import Client from "mpp-client-net";
import { Logger } from "@util/Logger";
import gettRPC from "@util/api/trpc";
import EventEmitter from "node:events";
import { getName, getVersion } from "@util/package";
import { getBranch } from "@util/git";
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

const branch = await getBranch();
const usernameVersionString = branch == "main" ? "" : ` v${getVersion()}-${branch}`;


export class MPPNetBot {
    public client: Client;
    public b = new EventEmitter();
    public logger: Logger;
    public trpc = gettRPC(process.env.MPP_FISHING_TOKEN as string);
    public started = false;
    public connected = false;
    public adminPassword = "";
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private desiredName = `Fishing Bot [$PREFIXhelp]${usernameVersionString}`;

    constructor(public config: MPPNetBotConfig) {
        this.logger = new Logger(config.channel.id);
        let token = config.envToken ? process.env[config.envToken] : undefined;
        this.adminPassword = config.envAdminPass
            ? (process.env[config.envAdminPass] as string)
            : "";

        (async () => {
            const prefixes = await this.trpc.prefixes.query();
            this.desiredName = this.desiredName.split("$PREFIX").join(prefixes[0]);
        })();

        if (!token) {
            this.client = new OldClient(config.uri);
        } else {
            this.client = new Client(config.uri, token);
        }

        this.logger.debug(`Token: ${token?.substring(0, 32)}...`);

        this.bindEventListeners();
        this.client.setChannel(config.channel.id);
    }

    public start() {
        this.logger.debug("Starting on", this.client.uri);
        this.client.start();
        this.started = true;
        this.connected = false;

        const reconnectWaitTime = 5000;

        this.reconnectTimeout = setTimeout(() => {
            if (!this.connected) {
                this.logger.warn(`Connection timed out, restarting in ${reconnectWaitTime}ms...`);
                this.stop();
                this.start();
            }
        }, reconnectWaitTime);
    }

    public stop() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        this.client.stop();
        this.started = false;
        this.connected = false;
    }

    public bindEventListeners() {
        this.trpc.events.subscribe(undefined, {
            onData: event => {
                if (typeof event === "object" && typeof event.m === "string") this.b.emit(event.m, event);
            },
            onError: err => this.logger.error
        });

        this.client.on("hi", async msg => {
            this.connected = true;
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }
            this.logger.info(`Connected to ${this.client.uri}`);

            // original fishing bot color: #abe3d6
            if (msg.u.name !== this.desiredName) {
                this.logger.info("Username mismatch, sending userset...");
                this.client.sendArray([{
                    m: "userset",
                    set: {
                        name: this.desiredName,
                    }
                    // color: "#abe3d6"
                }]);
            }
        });

        this.client.on("ch", msg => {
            this.logger.info(
                `Received channel update for channel ID "${msg.ch._id}"`
            );

            if (msg.ch._id !== this.config.channel.id) {
                this.client.setChannel(this.config.channel.id);
            }
        });

        this.client.on("a", async msg => {
            const command = await this.runCommand(msg.a, {
                id: msg.p._id,
                name: msg.p.name,
                color: msg.p.color
            }, true);

            if (!command) return;
            if (command.response) this.sendChat(command.response, msg.id);
        });

        this.client.on("dm", async msg => {
            const command = await this.runCommand(msg.a, {
                id: msg.sender._id,
                name: msg.sender.name,
                color: msg.sender.color
            }, true);

            if (!command) return;
            if (command.response)
                this.sendDM(command.response, msg.sender._id, msg.id);
        });

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
                ] as any);
            }
        });

        this.b.on("sendchat", msg => {
            // this.logger.debug("sendchat message:", msg);
            if (!this.client.channel) return;

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
                ] as any);
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
                    ] as any);
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

    public async getUsedPrefix(chatMessage: string) {
        // check command prefix against server-side suggestions
        let prefixes: string[];

        try {
            prefixes = await this.trpc.prefixes.query();
        } catch (err) {
            this.logger.error(err);
            this.logger.warn("Unable to contact server");
            return;
        }

        const usedPrefix: string | undefined = prefixes.find(pr => chatMessage.startsWith(pr));
        return usedPrefix;
    }

    public async runCommand(chatMessage: string, user: { id: string, name: string, color: string }, isDM = false) {
        if (!this.client.channel) return; // don't trust a weird empty server

        const args = chatMessage.split(" ");
        const usedPrefix = await this.getUsedPrefix(chatMessage);
        if (!usedPrefix) return; // no prefix, no running commands

        const spacedPrefix = usedPrefix.endsWith(" ");
        if (spacedPrefix) {
            args.splice(0, 1);
        }

        const command = await this.trpc.command.query({
            channel: this.client.channel._id,
            args: args.slice(1, args.length),
            // if the prefix has no trailing space,
            // cut the prefix out of the command
            command: !spacedPrefix ? args[0].substring(usedPrefix.length) : args[0],
            prefix: usedPrefix,
            user,
            isDM
        });

        return command;
    }
}

export default MPPNetBot;
