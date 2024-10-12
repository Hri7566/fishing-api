import { Logger } from "@util/Logger";
import { io, type Socket } from "socket.io-client";
import { EventEmitter } from "node:events";
import gettRPC from "@util/api/trpc";

require("dotenv").config();

export interface TalkomaticBotConfig {
    channel: {
        id: string;
    };
}

interface TalkomaticParticipant {
    id: string;
    name: string;
    color: string;
    typingTimeout: Timer | undefined;
    typingFlag: boolean;
}

const ppl: Record<string, TalkomaticParticipant> = {};

export class TalkomaticBot extends EventEmitter {
    public client: Socket;
    public b = new EventEmitter();
    public logger: Logger;
    public trpc = gettRPC(process.env.TALKOMATIC_FISHING_TOKEN as string);
    public started = false;
    public textColor = "#abe3d6";

    constructor(public config: TalkomaticBotConfig) {
        super();
        this.logger = new Logger("Talkomatic - " + config.channel.id);
        // this.client = new Client(config.uri, token);
        // this.client = io(
        //     "wss://talkomatic.co/socket.io/?EIO=4&transport=websocket&sid=f_X4Z5LB8lKBlybNAdj8"
        // );

        // this.logger.debug(process.env.TALKOMATIC_SID);

        this.client = io("https://talkomatic.co/", {
            extraHeaders: {
                Cookie: "connect.sid=" + process.env.TALKOMATIC_SID
            },
            autoConnect: false
        });
    }

    public start() {
        this.logger.debug("Starting");
        this.client.connect();
        // this.client.io.engine.on("packetCreate", this.logger.debug);
        this.bindEventListeners();
        this.setChannel(this.config.channel.id);
        this.started = true;
    }

    public stop() {
        this.client.disconnect();
        this.started = false;
    }

    public connected = false;

    public bindEventListeners() {
        this.client.onAny(msg => {
            if (this.connected) return;
            this.connected = true;
            this.logger.info("Connected to server");
        });

        this.client.on(
            "userTyping",
            (msg: { userId: string; text: string; color: string }) => {
                const p = ppl[msg.userId] || {
                    name: "<unknown user>",
                    id: msg.userId,
                    color: msg.color,
                    typingFlag: false
                };

                // p.color = msg.color;

                if (p.typingTimeout) clearTimeout(p.typingTimeout);

                p.typingTimeout = setTimeout(() => {
                    p.typingFlag = true;
                    ppl[msg.userId] = p;
                    if (msg.text.length <= 0) return;
                    this.emit("command", msg);
                }, 500);

                ppl[msg.userId] = p;
            }
        );

        this.client.on(
            "udpateRoom",
            (msg: {
                users: {
                    id: string;
                    username: string;
                    location: string;
                    is_moderator: boolean;
                    avatar: string;
                }[];
            }) => {
                if (!Array.isArray(msg.users)) return;
                try {
                    for (const user of msg.users) {
                        const p = ppl[user.id] || {
                            name: user.username,
                            id: user.id,
                            color: "#abe3d6",
                            typingFlag: false
                        };

                        ppl[user.id] = p;
                    }
                } catch (err) {}
            }
        );

        this.client.on(
            "roomUsers",
            (msg: {
                users: {
                    id: string;
                    username: string;
                    location: string;
                    is_moderator: boolean;
                    avatar: string;
                }[];
                currentUserId: string;
            }) => {
                if (!Array.isArray(msg.users)) return;
                try {
                    for (const user of msg.users) {
                        const p = ppl[user.id] || {
                            name: user.username,
                            id: user.id,
                            color: "#abe3d6",
                            typingFlag: false
                        };

                        ppl[user.id] = p;
                    }
                } catch (err) {}
            }
        );

        this.on(
            "command",
            async (msg: { userId: string; text: string; color: string }) => {
                let prefixes: string[];

                try {
                    prefixes = await this.trpc.prefixes.query();
                } catch (err) {
                    this.logger.error(err);
                    this.logger.warn("Unable to contact server");
                    return;
                }

                let usedPrefix: string | undefined = prefixes.find(pr =>
                    msg.text.startsWith(pr)
                );

                if (!usedPrefix) return;

                const args = msg.text.split(" ");

                let part: TalkomaticParticipant = ppl[msg.userId] || {
                    name: "<unknown user>",
                    id: msg.userId,
                    color: msg.color,
                    typingFlag: false
                };

                this.logger.info(`${part.name}: ${msg.text}`);

                const command = await this.trpc.command.query({
                    channel: this.config.channel.id,
                    args: args.slice(1, args.length),
                    command: args[0].substring(usedPrefix.length),
                    prefix: usedPrefix,
                    user: part
                });

                if (!command) return;
                if (command.response)
                    this.sendChat(command.response, undefined, msg.userId);
            }
        );

        this.client.on(
            "userJoined",
            (msg: {
                id: string;
                username: string;
                location: string;
                avatar: string;
            }) => {
                const p = ppl[msg.id] || {
                    name: "<unknown user>",
                    id: msg.id,
                    color: "#ffffff",
                    typingFlag: false
                };

                ppl[msg.id] = p;
            }
        );

        setInterval(async () => {
            try {
                const backs = (await this.trpc.backs.query()) as any;
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
            // this.textColor = msg.color;
            try {
                ppl[msg.id].color = msg.color;
            } catch (err) {}
        });

        this.b.on("sendchat", msg => {
            // this.logger.debug("sendchat message:", msg);

            if (typeof msg.channel === "string") {
                if (msg.channel !== this.config.channel) return;
            }

            this.sendChat(msg.message);
        });
    }

    public sendChat(text: string, reply?: string, id?: string) {
        // let lines = text.split("\n");

        // for (const line of lines) {
        //     const splits = line.match(/.{510}|.{1,509}/gi);
        //     if (!splits) continue;

        //     for (const split of splits) {
        //         if (split.length <= 510) {
        // const text = `\u034f${split
        //     .split("\t")
        //     .join("")
        //     .split("\r")
        //     .join("")}`;

        const msg = {
            roomId: this.config.channel.id,
            text,
            color: id ? ppl[id].color : "#ffffff"
        };

        this.client.emit("typing", msg);
        //         } else {
        //             this.sendChat(split);
        //         }
        //     }
        // }
    }

    public setChannel(roomId: string) {
        this.client.emit("joinRoom", { roomId });
    }
}
