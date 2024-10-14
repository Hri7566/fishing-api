import { Logger } from "@util/Logger";
import { io, type Socket } from "socket.io-client";
import { EventEmitter } from "node:events";
import gettRPC from "@util/api/trpc";

require("dotenv").config();
const convertMarkdownToUnicode = require("markdown-to-unicode");

export interface TalkomaticBotConfig {
    channel: {
        name: string;
        type: "public" | "private";
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
    public defaultColor = "#abe3d6";
    public channelId: string = "";

    constructor(public config: TalkomaticBotConfig) {
        super();

        this.logger = new Logger("Talkomatic - " + config.channel.name);

        this.client = io("https://talkomatic.co/", {
            extraHeaders: {
                Cookie: "connect.sid=" + process.env.TALKOMATIC_SID
            },
            autoConnect: false
        });

        this.bindEventListeners();
    }

    public async start() {
        this.logger.info("Starting");
        this.client.connect();
        // this.client.io.engine.on("packetCreate", this.logger.debug);

        let data =
            (await this.findChannel(this.config.channel.name)) ||
            (await this.createChannel(
                this.config.channel.name,
                this.config.channel.type
            ));
        this.logger.debug(data);

        if (typeof data !== "undefined") {
            try {
                this.channelId = (data as Record<string, any>).room.room_id;
                this.setChannel(this.channelId);
                this.started = true;
            } catch (err) {
                this.logger.error(err);
            }
        }
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

                // this.logger.debug(msg);
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
            async (msg: {
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
                        let color = (
                            await this.trpc.getUserColor.query({
                                userId: user.id
                            })
                        ).color;

                        this.logger.debug(
                            "(updateRoom) user color from api:",
                            color
                        );

                        const p = ppl[user.id] || {
                            name: user.username,
                            id: user.id,
                            color,
                            typingFlag: false
                        };

                        ppl[user.id] = p;
                    }
                } catch (err) {
                    this.logger.warn("Unable to set user data:", err);
                }
            }
        );

        this.client.on(
            "roomUsers",
            async (msg: {
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
                        let color = (
                            await this.trpc.getUserColor.query({
                                userId: user.id
                            })
                        ).color;

                        if (!color) color = this.defaultColor;

                        this.logger.debug(
                            "(roomUsers) user color from api:",
                            color
                        );

                        const p = ppl[user.id] || {
                            name: user.username,
                            id: user.id,
                            color,
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

                let color = (
                    await this.trpc.getUserColor.query({
                        userId: msg.userId
                    })
                ).color;

                if (!color) color = this.defaultColor;
                if (!usedPrefix) return;

                const args = msg.text.split(" ");

                let part: TalkomaticParticipant = ppl[msg.userId] || {
                    name: "<unknown user>",
                    id: msg.userId,
                    color,
                    typingFlag: false
                };

                this.logger.info(`${part.name}: ${msg.text}`);

                const command = await this.trpc.command.query({
                    channel: this.channelId,
                    args: args.slice(1, args.length),
                    command: args[0].substring(usedPrefix.length),
                    prefix: usedPrefix,
                    user: {
                        id: part.id,
                        name: part.name,
                        color: part.color
                    }
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
                    name: msg.username,
                    id: msg.id,
                    color: "#abe3d6",
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

        this.b.on("color", async msg => {
            if (typeof msg.color !== "string" || typeof msg.id !== "string")
                return;
            // this.textColor = msg.color;

            try {
                ppl[msg.id].color = msg.color;

                await this.trpc.saveColor.query({
                    userId: msg.id,
                    color: msg.color
                });
            } catch (err) {
                this.logger.warn("Unable to save user color:", err);
            }
        });

        this.b.on(
            "sendchat",
            (msg: { m: "sendchat"; channel: string; message: string }) => {
                // this.logger.debug("sendchat message:", msg);

                if (typeof msg.channel === "string") {
                    if (msg.channel !== this.channelId) return;
                }

                this.sendChat(msg.message);
            }
        );
    }

    private oldText: string = "";

    public sendChat(text: string, reply?: string, id?: string) {
        const fixedOld = this.oldText.split("\n")[-1];

        if (text.toLowerCase().includes("autofish"))
            text = `${fixedOld ? fixedOld + "\n" : ""}${text}`;

        const msg = {
            roomId: this.channelId,
            // text: text.split("sack").join("ʂасκ"),
            text: text.split("sack").join("caught"),
            color: id ? ppl[id].color : this.defaultColor
        };

        for (const uuid of Object.keys(ppl)) {
            const p = ppl[uuid];

            msg.text = msg.text.split(`@${uuid}`).join(p.name);

            if (!p) continue;
            if (uuid !== id) continue;

            msg.color = p.color;
        }

        try {
            msg.text = convertMarkdownToUnicode(msg.text);
        } catch (err) {
            this.logger.warn("Unable to parse markdown:", err);
        }

        this.client.emit("typing", msg);

        this.oldText = text;
    }

    public setChannel(roomId: string) {
        this.client.emit("joinRoom", { roomId });
    }

    public async createChannel(
        roomName: string,
        roomType: "public" | "private" = "public"
    ) {
        const response = await fetch(
            "https://talkomatic.co/create-and-join-room",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: "connect.sid=" + process.env.TALKOMATIC_SID
                },
                credentials: "include",
                body: JSON.stringify({
                    roomName,
                    roomType
                })
            }
        );

        if (!response.ok)
            return void this.logger.warn(
                "Unable to create channel:",
                new TextDecoder().decode(
                    (await response.body?.getReader().read())?.value
                )
            );

        try {
            const data = new TextDecoder().decode(
                (await response.body?.getReader().read())?.value
            );

            return JSON.parse(data.toString());
        } catch (err) {
            this.logger.warn(
                "Unable to decode channel creation response data:",
                err
            );
        }
    }

    public async findChannel(name: string) {
        const response = await fetch("https://talkomatic.co/rooms", {
            method: "GET"
        });

        if (!response.ok)
            return void this.logger.warn(
                "Unable to create channel:",
                new TextDecoder().decode(
                    (await response.body?.getReader().read())?.value
                )
            );

        try {
            const data = new TextDecoder().decode(
                (await response.body?.getReader().read())?.value
            );

            const rooms = JSON.parse(data.toString());

            for (const room of rooms.rooms) {
                if (room.room_name == name) {
                    return { room };
                }
            }
        } catch (err) {
            this.logger.warn(
                "Unable to decode channel creation response data:",
                err
            );
        }
    }
}
