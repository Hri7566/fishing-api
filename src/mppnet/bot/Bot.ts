import Client from "mpp-client-net";
import { Logger } from "@util/Logger";
import gettRPC from "@util/api/trpc";
import EventEmitter from "node:events";
const OldClient = require("mpp-client-xt");
const convertMarkdownToUnicode = require("markdown-to-unicode");

export type MPPNetBotConfig = {
    uri: string;
    useOldMessages: boolean;
    channel: {
        id: string;
        allowColorChanging: boolean;
        chatFormatting: "old" | "new";
        allowNotifications?: boolean;
    };
    envToken?: string;
    envAdminPass?: string;
};

export class MPPNetBot {
    public client: Client;
    public b = new EventEmitter();
    public logger: Logger;
    public trpc = gettRPC(process.env.MPP_FISHING_TOKEN as string);
    public started = false;
    public adminPassword = "";

    constructor(public config: MPPNetBotConfig) {
        this.logger = new Logger(config.channel.id);
        let token = config.envToken ? process.env[config.envToken] : undefined;
        this.adminPassword = config.envAdminPass
            ? (process.env[config.envAdminPass] as string)
            : "";

        if (!token) {
            this.client = new OldClient(config.uri);
        } else {
            this.client = new Client(config.uri, token);
        }

        this.bindEventListeners();
        this.client.setChannel(config.channel.id);
    }

    public start() {
        this.logger.debug("Starting on", this.client.uri);
        this.client.start();
        this.started = true;
    }

    public stop() {
        this.client.stop();
        this.started = false;
    }

    public bindEventListeners() {
        this.client.on("hi", async msg => {
            this.logger.info(`Connected to ${this.client.uri}`);
        });

        this.client.on("ch", msg => {
            this.logger.info(
                `Received channel update for channel ID "${msg.ch._id}"`
            );

            if (msg._id !== this.config.channel.id) {
                this.client.setChannel(this.config.channel.id);
            }
        });

        this.client.on("a", async msg => {
            let prefixes: string[];

            if (this.client.channel._id !== this.config.channel.id) {
                return;
            }

            try {
                prefixes = await this.trpc.prefixes.query();
            } catch (err) {
                this.logger.error(err);
                this.logger.warn("Unable to contact server");
                return;
            }

            const usedPrefix: string | undefined = prefixes.find(pr =>
                msg.a.startsWith(pr)
            );

            if (!usedPrefix) return;

            const args = msg.a.split(" ");

            const command = await this.trpc.command.query({
                channel: this.client.channel._id,
                args: args.slice(1, args.length),
                command: args[0].substring(usedPrefix.length),
                prefix: usedPrefix,
                user: {
                    id: msg.p._id,
                    name: msg.p.name,
                    color: msg.p.color
                }
            });

            if (!command) return;
            if (command.response) this.sendChat(command.response, msg.id);
        });

        this.client.on(
            "dm",
            async (msg: {
                m: "dm";
                id: string;
                t: number;
                a: string;

                sender: {
                    _id: string;
                    name: string;
                    color: string;
                    afk: boolean;
                    tag?: {
                        text: string;
                        color: string;
                    };
                    id: string;
                };

                recipient: {
                    _id: string;
                    name: string;
                    color: string;
                    afk: boolean;
                    tag?: {
                        text: string;
                        color: string;
                    };
                    id: string;
                };
            }) => {
                let prefixes: string[];

                try {
                    prefixes = await this.trpc.prefixes.query();
                } catch (err) {
                    this.logger.error(err);
                    this.logger.warn("Unable to contact server");
                    return;
                }

                const usedPrefix: string | undefined = prefixes.find(pr =>
                    msg.a.startsWith(pr)
                );

                if (!usedPrefix) return;

                const args = msg.a.split(" ");

                const command = await this.trpc.command.query({
                    channel: this.client.channel._id,
                    args: args.slice(1, args.length),
                    command: args[0].substring(usedPrefix.length),
                    prefix: usedPrefix,
                    user: {
                        id: msg.sender._id,
                        name: msg.sender.name,
                        color: msg.sender.color
                    },
                    isDM: true
                });

                if (!command) return;
                if (command.response)
                    this.sendDM(command.response, msg.sender._id, msg.id);
            }
        );

        setInterval(async () => {
            try {
                const backs =
                    (await this.trpc.backs.query()) as IBack<unknown>[];
                if (backs.length > 0) {
                    for (const back of backs) {
                        if (typeof back.m !== "string") return;
                        this.b.emit(back.m, back);
                    }
                }
            } catch (err) {
                return;
            }
        }, 1000 / 20);

        this.b.on("color", msg => {
            if (typeof msg.color !== "string" || typeof msg.id !== "string")
                return;

            if (!this.config.channel.allowColorChanging) return;

            if (!this.config.useOldMessages) {
                this.client.sendArray([
                    {
                        m: "setcolor",
                        _id: msg.id,
                        color: msg.color
                    }
                ]);
            } else {
                this.client.sendArray([
                    {
                        m: "admin message",
                        password: this.adminPassword,
                        msg: {
                            m: "color",
                            _id: msg.id,
                            color: msg.color
                        }
                    }
                ]);
            }
        });

        this.b.on("sendchat", msg => {
            // this.logger.debug("sendchat message:", msg);

            if (typeof msg.channel === "string") {
                if (msg.channel !== this.client.channel._id) return;
            }

            if (msg.isDM) {
                this.sendDM(msg.message, msg.id);
            } else {
                this.sendChat(msg.message);
            }
        });

        this.b.on("notification", msg => {
            if (!this.config.channel.allowNotifications) return;

            if (typeof msg.html === "string") {
                for (const p of Object.values(this.client.ppl)) {
                    msg.html = msg.html.split(`@${p._id}`).join(p.name);
                }
            }

            if (typeof msg.text === "string") {
                for (const p of Object.values(this.client.ppl)) {
                    msg.text = msg.text.split(`@${p._id}`).join(p.name);
                }
            }

            if (!this.config.useOldMessages) {
                // TODO: put html notif messages in mppnet
            } else {
                this.client.sendArray([
                    {
                        m: "admin message",
                        password: this.adminPassword,
                        msg: {
                            m: "notification",
                            id: msg.id,
                            targetChannel: msg.targetChannel,
                            targetUser: msg.targetUser,
                            duration: msg.duration,
                            class: msg.class,
                            html: msg.html,
                            text: msg.text
                        }
                    }
                ]);
            }
        });
    }

    public sendChat(text: string, reply?: string) {
        if (this.config.channel.chatFormatting === "old") {
            text = convertMarkdownToUnicode(text);

            for (const p of Object.values(this.client.ppl)) {
                text = text.split(`@${p._id}`).join(p.name);
            }
        }

        const lines = text.split("\n");

        for (const line of lines) {
            const splits = line.match(/.{510}|.{1,509}/gi);
            if (!splits) continue;

            for (const split of splits) {
                if (split.length <= 510) {
                    this.client.sendArray([
                        {
                            m: "a",
                            message: `\u034f${split
                                .split("\t")
                                .join("")
                                .split("\r")
                                .join("")}`,
                            reply_to: reply
                        }
                    ]);
                } else {
                    this.sendChat(split);
                }
            }
        }
    }

    public sendDM(text: string, dm: string, reply_to?: string) {
        if (this.config.channel.chatFormatting === "old") {
            text = convertMarkdownToUnicode(text);

            for (const p of Object.values(this.client.ppl)) {
                text = text.split(`@${p._id}`).join(p.name);
            }
        }

        const lines = text.split("\n");

        for (const line of lines) {
            if (line.length <= 510) {
                if (!this.config.useOldMessages) {
                    this.client.sendArray([
                        {
                            m: "dm",
                            message: `\u034f${line
                                .split("\t")
                                .join("")
                                .split("\r")
                                .join("")}`,
                            _id: dm,
                            reply_to
                        }
                    ]);
                } else {
                    this.client.sendArray([
                        {
                            m: "a",
                            message: `\u034f${line
                                .split("\t")
                                .join("")
                                .split("\r")
                                .join("")}`
                        }
                    ]);
                }
            } else {
                this.sendDM(line, dm, reply_to);
            }
        }
    }
}

export default MPPNetBot;
