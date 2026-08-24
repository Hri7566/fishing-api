import { Logger } from "@util/Logger";
import { io, type Socket } from "socket.io-client";
import { EventEmitter } from "node:events";
import gettRPC from "@util/api/trpc";
import { getVersion } from "@util/package";

require("dotenv").config();
const convertMarkdownToUnicode = require("markdown-to-unicode");

const endpoint = "https://classic.talkomatic.co";

export interface TalkomaticClassicToken {
    token: string;
    expires: number;
}

export interface TalkomaticBotConfig {
    channel: {
        name: string;
        type: "public" | "private";
        maxSize: number;
        accessCode?: string;
        allowBots?: boolean;
    };
}

/*
interface TalkoUser {

}
*/

type TalkoUser = unknown;

interface TalkoChannel {
    id: string;
    name: string;
    type: string;
    layout: string;
    users: TalkoUser[];
    votes: Record<string, unknown>;
    bannedUserIds: Record<string, unknown>;
    lastActiveTime: number;
    isFull: boolean;
}

interface TalkomaticParticipant {
    id: string;
    name: string;
    text: string;
    color: string;
    typingTimeout: Timer | undefined;
    typingFlag: boolean;
}

const ppl: Record<string, TalkomaticParticipant> = {};

export class TalkomaticBot extends EventEmitter {
    public socket: Socket;
    public b = new EventEmitter();
    public logger: Logger;
    public trpc = gettRPC(process.env.TALKOMATIC_FISHING_TOKEN as string);
    public started = false;
    public defaultColor = "#abe3d6";
    public channelId = "";

    constructor(public config: TalkomaticBotConfig, auth: TalkomaticClassicToken) {
        super();

        this.logger = new Logger(`Talkomatic - ${config.channel.name}`);

        //this.logger.debug(process.env.TALKOMATIC_SID);
        //this.logger.debug(process.env.TALKOMATIC_API_KEY);

        //this.logger.debug(`Connecting to ${endpoint}`);
        this.socket = io(endpoint, {
            transports: ["websocket"],
            /*
            extraHeaders: {
                Cookie: `connect.sid=${process.env.TALKOMATIC_SID}`
            },
            */
            autoConnect: false,
            auth: {
                //apiKey: process.env.TALKOMATIC_API_KEY
                token: auth.token
            }
        });

        this.bindEventListeners();
    }

    public async start() {
        this.logger.info("Starting");
        this.socket.connect();

        //this.socket.io.engine.on("packetCreate", this.logger.debug);
        //this.socket.io.engine.on("data", this.logger.debug);
        this.socket.io.engine.on("error", this.logger.error);
    }

    public stop() {
        this.socket.disconnect();
        this.started = false;
    }

    public connected = false;

    public bindEventListeners() {
        this.socket.on("connect", () => {
            if (this.connected) return;
            this.connected = true;
            this.logger.info("Connected to server");

            // "log in"
            this.socket.emit("join lobby", {
                // 42["join lobby",{"username":"hri7566","location":"bean zone"}]
                username: "Fishing Bot",
                location: "pond"
            });

            this.socket.emit("get rooms");
        });

        this.socket.on("connect_error", err => {
            this.logger.error(err);
        });

        this.socket.on("error", data => {
            this.logger.error("\x1b[31m[" + data.error.code + "]\x1b[0m", data.error.message);
        });

        this.socket.on("lobby update", data => {
            // a lobby updated?
            //this.logger.debug("Received lobby update:", data);
        });

        this.socket.on("initial rooms", data => {
            // given us room data
            //this.logger.debug("Received initial rooms:", data);
        });

        this.socket.on("signin status", async msg => {
            // received auth info
            // 42["signin status",{"isSignedIn":true,"username":"hri7566","location":"bean zone","userId":"ZHqr_YT9KX_ED-m57eLRjuDrjTAcbhu8"}]
            //this.logger.debug("Received signin status:", msg);
            //this.setChannel(this.channelId);

            let channel = (await this.findChannel(this.config.channel.name));
            let channelId: string;

            if (!channel) {
                channelId = await this.createChannel(
                    this.config.channel.name,
                    this.config.channel.type,
                );
            } else {
                channelId = channel.id;
            }

            //this.logger.debug("Channel ID:", channelId);

            if (typeof channelId === "string") {
                try {
                    this.channelId = channelId;
                    this.setChannel(this.channelId);
                    this.started = true;
                } catch (err) {
                    this.logger.error(err);
                }
            }
        });

        this.socket.on(
            "chat update",
            (msg: {
                userId: string;
                username: string;
                diff: {
                    type: "add" | "delete" | "full-replace";
                    text: string;
                };
                //text: string;
                //color: { color: string };
            }) => {
                //this.logger.debug(msg);
                const p: TalkomaticParticipant = ppl[msg.userId] || {
                    name: "<unknown user>",
                    id: msg.userId,
                    text: "",
                    //color: msg.color.color,
                    color: "#FF9800",
                    typingFlag: false
                };

                //this.logger.debug(msg);
                // p.color = msg.color;

                if (p.typingTimeout) clearTimeout(p.typingTimeout);
                p.text = msg.diff.text;

                p.typingTimeout = setTimeout(() => {
                    //this.logger.debug("Typing timeout for " + msg.userId + " exhausted");
                    p.typingFlag = true;
                    ppl[msg.userId] = p;
                    if (p.text.length <= 0) return;
                    this.emit("command", msg);
                }, 500);

                ppl[msg.userId] = p;
            }
        );

        this.socket.on(
            "room update",
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
                        let color: string;

                        const c = (
                            await this.trpc.getUserColor.query({
                                userId: user.id
                            })
                        );

                        if (typeof c === "object" && typeof c.color === "string") {
                            color = c.color;
                        } else if (typeof c === "string") {
                            color = c;
                        } else {
                            color = this.defaultColor;
                        }

                        this.logger.debug(
                            "(updateRoom) user color from api:",
                            color
                        );

                        const p = ppl[user.id] || {
                            name: user.username,
                            id: user.id,
                            color,
                            text: "",
                            typingFlag: false
                        };

                        if (color) p.color = color;

                        ppl[user.id] = p;
                    }
                } catch (err) {
                    this.logger.warn("Unable to set user data:", err);
                }
            }
        );

        this.socket.on(
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
                            text: "",
                            typingFlag: false
                        };

                        ppl[user.id] = p;
                    }
                } catch (err) { }
            }
        );

        this.on(
            "command",
            async (msg: {
                userId: string;
                diff: {
                    type: "add" | "delete" | "full-replace";
                    text: string;
                };
                //text: string;
                //color: { color: string };
            }) => {
                //this.logger.debug("Running command from", msg.userId + ":", msg.diff.text);
                let prefixes: string[];

                try {
                    prefixes = await this.trpc.prefixes.query();
                } catch (err) {
                    this.logger.error(err);
                    this.logger.warn("Unable to contact server");
                    return;
                }

                if (typeof msg.diff.text !== "string") {
                    this.logger.debug("blank message happened");
                    return;
                }

                const usedPrefix: string | undefined = prefixes.find(pr =>
                    msg.diff.text.startsWith(pr)
                );

                let color: string | null = (
                    await this.trpc.getUserColor.query({
                        userId: msg.userId
                    })
                ).color;

                if (!color) color = this.defaultColor;
                if (!usedPrefix) return;

                const args = msg.diff.text.split(" ");

                const part: TalkomaticParticipant = ppl[msg.userId] || {
                    name: "<unknown user>",
                    id: msg.userId,
                    color,
                    typingFlag: false
                };

                this.logger.info(`${part.name}: ${msg.diff.text}`);

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

        this.socket.on(
            "user joined",
            (msg: {
                id: string;
                username: string;
                location: string;
                deviceType?: string;
                isBotUser?: boolean;
                roomName?: string;
                roomType?: string;
                avatar?: string;
            }) => {
                const p = ppl[msg.id] || {
                    name: msg.username,
                    id: msg.id,
                    color: "#abe3d6",
                    text: "",
                    typingFlag: false
                };

                ppl[msg.id] = p;
            }
        );

        this.socket.on("disconnect", (reason, description) => {
            this.logger.warn(
                "Disconnected from server:",
                reason,
                description ? description : ""
            );

            setTimeout(() => {
                this.stop();
                this.start();
            }, 5000);
        });

        this.socket.on("room joined", () => {
            this.fixChat();
        });

        setInterval(async () => {
            try {
                const events = await this.trpc.events.query();
                if (!events) return;
                if (events.length > 0) {
                    // this.logger.debug(events);
                    for (const event of events) {
                        if (typeof event.m !== "string") return;
                        this.b.emit(event.m, event);
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

    private oldText = "";
    private prefix = `Fishing Bot v${getVersion()} - Usage: Type /help and wait a moment\n\n`;
    private sendTimeout: NodeJS.Timeout | undefined;

    public sendChat(t: string, reply?: string, id?: string) {
        clearTimeout(this.sendTimeout);

        const fixedOld = this.oldText.split("\n")[-1];

        let text = t;
        if (text.toLowerCase().includes("autofish"))
            text = `${fixedOld ? `${fixedOld}\n` : ""}${text}`;

        const msg = {
            roomId: this.channelId,
            // text: text.split("sack").join("ʂасκ"),
            // text: text.split("sack").join("caught"),
            text,
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

        //this.logger.debug("Sending typing:", msg);
        this.logger.debug("Sending chat update:", msg);
        //this.socket.emit("typing", msg);

        /*
        this.socket.emit("chat update", {
            diff: {
                type: "delete",
                count: this.oldText.length,
                index: 0
            }
        });
        */

        if (!this.oldText) {
            this.socket.emit("chat update", {
                diff: {
                    type: "add",
                    text: this.prefix + msg.text,
                    index: 0
                }
            });
        } else {
            this.socket.emit("chat update", {
                diff: {
                    type: "full-replace",
                    text: this.prefix + msg.text
                }
            });
        }

        this.oldText = this.prefix + text;
        this.sendTimeout = setTimeout(() => {
            this.fixChat();
        }, 30000);
    }

    public fixChat() {
        if (this.oldText == this.prefix) {
            this.sendChat("\n    ");
        } else {
            this.sendChat("");
        }
    }

    public setChannel(roomId: string, accessCode?: string) {
        //this.logger.debug("Changing channel to", roomId);
        //this.socket.emit("joinRoom", { roomId });;
        this.socket.emit("join room", { roomId, accessCode });
    }

    public createChannel(
        roomName: string,
        roomType: "public" | "semi-private" | "private" = "public",
        //roomLayout: "horizontal" | "vertical" = "horizontal"
        maxSize: number = 5,
        accessCode?: string,
        allowBots = true
    ): Promise<string> {
        this.logger.debug(
            `Creating ${roomType} channel ${roomName}`
        );

        const p = new Promise<string>((resolve, reject) => {
            this.logger.debug("Channel creation promise awaiting...");

            const listener = (channelId: string) => {
                this.logger.debug("Channel creation listener called");
                this.socket.off("room created", listener);
                resolve(channelId);
            };

            this.socket.on("room created", listener);
        });

        this.socket.emit("create room", {
            name: roomName,
            type: roomType,
            maxSize,
            accessCode,
            allowBots
        });

        return p;
    }

    public findChannel(name: string): Promise<TalkoChannel | undefined> {
        return new Promise((resolve, reject) => {
            this.socket.emit("get rooms");

            this.socket.once("initial rooms", rooms => {
                if (!Array.isArray(rooms)) resolve(undefined);

                const channel = rooms.find(
                    (ch: TalkoChannel) => ch.name === name
                );

                if (typeof channel === "undefined") resolve(undefined);

                resolve(channel);
            });
        });
    }

    public getParticipant(uuid: string) {
        return ppl[uuid];
    }
}
