import { EventEmitter } from "events";
import Discord from "discord.js";
import { Logger } from "@util/Logger";
import { CosmicColor } from "@util/CosmicColor";
import trpc from "@util/api/trpc";

export interface DiscordBotConfig {
    serverID: string;
    defaultChannelID: string;
    token?: string;
}

export class DiscordBot extends EventEmitter {
    public client: Discord.Client;
    public logger = new Logger("Discord Bot");
    public token?: string;
    public server?: Discord.Guild;
    public defaultChannel?: Discord.TextChannel;
    public b = new EventEmitter();

    constructor(public conf: DiscordBotConfig) {
        super();

        this.token = conf.token ?? process.env.DISCORD_TOKEN;
        this.client = new Discord.Client({
            intents: [
                "Guilds",
                "GuildMessages",
                "MessageContent",
                "GuildMembers"
            ]
        });

        this.bindEventListeners();
    }

    public async start() {
        await this.client.login(this.token);
    }

    private bindEventListeners() {
        this.client.on("ready", async () => {
            this.logger.info("Connected to Discord");

            this.server = await this.client.guilds.fetch(this.conf.serverID);

            const channel = await this.server.channels.fetch(
                this.conf.defaultChannelID
            );

            if (!channel) throw "Unable to find default Discord channel.";

            this.defaultChannel = channel as Discord.TextChannel;
        });

        this.client.on("guildMemberAdd", async member => {
            if (!this.server) return;

            const color = new CosmicColor(
                Math.floor(Math.random() * 255),
                Math.floor(Math.random() * 255),
                Math.floor(Math.random() * 255)
            );

            const existingRole = this.server.roles.cache.find(
                role => role.name === member.id
            );

            if (existingRole) {
                await member.roles.add(existingRole);
                return;
            }

            const role = await this.server.roles.create({
                name: member.id,
                color: parseInt(color.toHexa().substring(1), 16)
            });

            await member.roles.add(role);
        });

        this.client.on("messageCreate", async msg => {
            if (!this.server) return;
            if (msg.guildId !== this.server.id) return;

            const existingRole = this.server.roles.cache.find(
                role => role.name === msg.author.id
            );

            if (!existingRole) return;

            let prefixes: string[];

            try {
                prefixes = await trpc.prefixes.query();
            } catch (err) {
                this.logger.error(err);
                this.logger.warn("Unable to contact server");
                return;
            }

            let usedPrefix: string | undefined = prefixes.find(pr =>
                msg.content.startsWith(pr)
            );

            if (!usedPrefix) return;

            const args = msg.content.split(" ");

            const command = await trpc.command.query({
                args: args.slice(1, args.length),
                command: args[0].substring(usedPrefix.length),
                prefix: usedPrefix,
                user: {
                    id: msg.author.id,
                    name: msg.author.displayName,
                    color: existingRole.hexColor
                }
            });

            if (!command) return;
            if (command.response)
                msg.reply(
                    command.response
                        .split(`@${msg.author.id}`)
                        .join(`<@${msg.author.id}>`)
                );
        });

        setInterval(async () => {
            try {
                const backs = (await trpc.backs.query()) as IBack<unknown>[];
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

            if (!this.server) return;

            const existingRole = this.server.roles.cache.find(
                role => role.name === msg.id
            );

            if (!existingRole) {
                try {
                    const member = await this.server.members.fetch(msg.id);
                    if (!member) throw "no member";

                    const role = await this.server.roles.create({
                        name: member.id,
                        color: msg.color
                    });

                    await member.roles.add(role);
                } catch (err) {
                    this.logger.warn(
                        "Unable to create and set color for user ID:",
                        msg.id
                    );
                    return;
                }
            } else {
                await existingRole.setColor(msg.color);
            }
        });

        this.b.on("sendchat", msg => {
            // this.logger.debug("sendchat message:", msg);
            if (!this.defaultChannel) return;
            this.defaultChannel.send(
                msg.message
                    .split(`@${msg.author.id}`)
                    .join(`<@${msg.author.id}>`)
            );
        });
    }
}
