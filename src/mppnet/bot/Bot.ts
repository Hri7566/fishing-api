import Client from "mpp-client-net";
import { Logger } from "@util/Logger";
import gettRPC from "@util/api/trpc";
import EventEmitter from "events";

export interface MPPNetBotConfig {
    uri: string;
    useToken?: boolean;

    channel: {
        id: string;
        allowColorChanging: boolean;
    };
}

export class MPPNetBot {
    public client: Client;
    public b = new EventEmitter();
    public logger: Logger;
    public trpc = gettRPC(process.env.MPP_FISHING_TOKEN as string);
    public started = false;

    constructor(
        public config: MPPNetBotConfig,
        token: string = process.env[`MPP_TOKEN_NET`] as string
    ) {
        this.logger = new Logger(config.channel.id);
        this.client = new Client(config.uri, token);

        this.client.setChannel(config.channel.id);

        this.bindEventListeners();
    }

    public start() {
        this.logger.debug("Starting");
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

            let usedPrefix: string | undefined = prefixes.find(pr =>
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
            if (command.response)
                this.sendChat(command.response, (msg as any).id);
        });

        (this.client as unknown as any).on(
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

                let usedPrefix: string | undefined = prefixes.find(pr =>
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
                    // this.logger.debug(backs);
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
            this.client.sendArray([
                {
                    m: "setcolor",
                    _id: msg.id,
                    color: msg.color
                }
            ]);
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
    }

    public sendChat(text: string, reply?: string) {
        let lines = text.split("\n");

        for (const line of lines) {
            const splits = line.match(/.{510}|.{1,509}/gi);
            if (!splits) continue;

            for (const split of splits) {
                if (split.length <= 510) {
                    (this.client as any).sendArray([
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
        let lines = text.split("\n");

        for (const line of lines) {
            if (line.length <= 510) {
                (this.client as any).sendArray([
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
                this.sendChat(line);
            }
        }
    }
}

export default MPPNetBot;
