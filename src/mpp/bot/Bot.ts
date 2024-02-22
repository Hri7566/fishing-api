import Client from "mpp-client-net";
import { Logger } from "@util/Logger";
import trpc from "@client/api/trpc";

export interface MPPNetBotConfig {
    uri: string;

    channel: {
        id: string;
        allowColorChanging: boolean;
    };
}

export class MPPNetBot {
    public client: Client;

    public logger: Logger;

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
        this.client.start();
    }

    public stop() {
        this.client.stop();
    }

    public bindEventListeners() {
        this.client.on("hi", async msg => {
            this.logger.info(`Connected to ${this.client.uri}`);
        });

        this.client.on("ch", msg => {
            this.logger.info(
                `Received channel update for channel ID "${msg.ch._id}"`
            );
        });

        this.client.on("a", async msg => {
            let prefixes: string[];

            try {
                prefixes = await trpc.prefixes.query();
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

            const command = await trpc.command.query({
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
            if (command.response) this.sendChat(command.response);
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
                    prefixes = await trpc.prefixes.query();
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

                const command = await trpc.command.query({
                    args: args.slice(1, args.length),
                    command: args[0].substring(usedPrefix.length),
                    prefix: usedPrefix,
                    user: {
                        id: msg.sender._id,
                        name: msg.sender.name,
                        color: msg.sender.color
                    }
                });

                if (!command) return;
                if (command.response) this.sendChat(command.response);
            }
        );
    }

    public sendChat(text: string) {
        let lines = text.split("\n");

        for (const line of lines) {
            if (line.length <= 510) {
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
            } else {
                this.sendChat(line);
            }
        }
    }
}

export default MPPNetBot;
