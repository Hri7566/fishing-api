import { Logger } from "@util/Logger";
import { io, type Socket } from "socket.io-client";
import { EventEmitter } from "node:events";
import gettRPC from "@util/api/trpc";
import type { HeadersInit } from "undici-types/fetch.d.ts";

require("dotenv").config();
const convertMarkdownToUnicode = require("markdown-to-unicode");

const endpoint = "https://classic.talkomatic.co";

export interface TalkomaticBotConfig {
    channel: {
        name: string;
        type: "public" | "private";
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
    public client: Socket;
    public b = new EventEmitter();
    public logger: Logger;
    public trpc = gettRPC(process.env.TALKOMATIC_FISHING_TOKEN as string);
    public started = false;
    public defaultColor = "#abe3d6";
    public channelId = "";

    constructor(public config: TalkomaticBotConfig) {
        super();

        this.logger = new Logger(`Talkomatic - ${config.channel.name}`);

        //this.logger.debug(process.env.TALKOMATIC_SID);
        //this.logger.debug(process.env.TALKOMATIC_API_KEY);

        this.logger.debug(`Connecting to ${endpoint}`);
        this.client = io(endpoint, {
            transports: ['websocket'],
            /*
            extraHeaders: {
                Cookie: `connect.sid=${process.env.TALKOMATIC_SID}`
            },
            */
            autoConnect: false,
            auth: {
                apiKey: process.env.TALKOMATIC_API_KEY
            }
        });

        this.bindEventListeners();
    }

    public async start() {
        this.logger.info("Starting");
        this.client.connect();

        this.client.io.engine.on("packetCreate", this.logger.debug);

        let channel = await this.findChannel(this.config.channel.name);
        if (!channel)
            channel = await this.createChannel(
                this.config.channel.name,
                this.config.channel.type
            );

        if (typeof channel !== "undefined") {
            try {
                this.channelId = channel.id;
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
        this.client.on("connect", () => {
            if (this.connected) return;
            this.connected = true;
            this.logger.info("Connected to server");

            // "log in"
            this.client.emit("join lobby", {
                // 42["join lobby",{"username":"hri7566","location":"bean zone"}]
                username: "Fishing Bot",
                location: "test/fishing"
            });

            this.client.emit("get rooms");
        });

        this.client.on("lobby update", data => {
            this.logger.debug("Received lobby update:", data);
        });

        this.client.on("initial rooms", data => {
            this.logger.debug("Received initial rooms:", data);
        });

        this.client.on("signin status", msg => {
            // 42["signin status",{"isSignedIn":true,"username":"hri7566","location":"bean zone","userId":"ZHqr_YT9KX_ED-m57eLRjuDrjTAcbhu8"}]
            this.logger.debug("Received signin status:", msg);
        });

        this.client.on(
            "chat update",
            (msg: {
                userId: string;
                username: string;
                diff: {
                    type: "add" | "delete" | "full-replace";
                };
                //text: string;
                //color: { color: string };
            }) => {
                this.logger.debug(msg);
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

                p.typingTimeout = setTimeout(() => {
                    p.typingFlag = true;
                    ppl[msg.userId] = p;
                    if (p.text.length <= 0) return;
                    this.emit("command", msg);
                }, 500);

                ppl[msg.userId] = p;
            }
        );

        this.client.on(
            "updateRoom",
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
                        const color = (
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
                text: string;
                color: { color: string };
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
                    msg.text.startsWith(pr)
                );

                let color: string = (
                    await this.trpc.getUserColor.query({
                        userId: msg.userId
                    })
                ).color;

                if (!color) color = this.defaultColor;
                if (!usedPrefix) return;

                const args = msg.text.split(" ");

                const part: TalkomaticParticipant = ppl[msg.userId] || {
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
                    text: "",
                    typingFlag: false
                };

                ppl[msg.id] = p;
            }
        );

        this.client.on("disconnect", (reason, description) => {
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

        setInterval(async () => {
            try {
                const backs = await this.trpc.backs.query();
                if (!backs) return;
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

    private oldText = "";

    public sendChat(t: string, reply?: string, id?: string) {
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
        //this.client.emit("typing", msg);

        /*
        this.client.emit("chat update", {
            diff: {
                type: "delete",
                count: this.oldText.length,
                index: 0
            }
        });
        */

        if (!this.oldText) {
            this.client.emit("chat update", {
                diff: {
                    type: "add",
                    text: msg.text,
                    index: 0
                }
            });
        } else {
            this.client.emit("chat update", {
                diff: {
                    type: "full-replace",
                    text: msg.text
                }
            });
        }

        this.oldText = text;
    }

    public setChannel(roomId: string, accessCode?: string) {
        this.logger.debug("Changing channel to", roomId);
        //this.client.emit("joinRoom", { roomId });
        this.client.emit("join room", { roomId, accessCode });
    }

    public createChannel(
        roomName: string,
        roomType: "public" | "semi-private" | "private" = "public",
        roomLayout: "horizontal" | "vertical" = "horizontal"
    ): Promise<TalkoChannel> {
        this.logger.debug(
            `Creating ${roomType} channel ${roomName} with ${roomLayout} layout`
        );
        this.client.emit("create room", {
            name: roomName,
            type: roomType,
            layout: roomLayout
        });

        return new Promise((resolve, reject) => {
            const listener = (list: TalkoChannel[]) => {
                if (!Array.isArray(list)) return;

                for (const channel of list) {
                    if (channel.name !== roomName) continue;
                    this.client.off("lobby update", listener);
                    resolve(channel);
                }
            };

            this.client.once("lobby update", listener);
        });
    }

    public findChannel(name: string): Promise<TalkoChannel | undefined> {
        return new Promise((resolve, reject) => {
            this.client.emit("get rooms");

            this.client.once("initial rooms", rooms => {
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
