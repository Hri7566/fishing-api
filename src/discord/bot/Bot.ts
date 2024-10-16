import { EventEmitter } from "events";
import * as Discord from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { Logger } from "@util/Logger";
import { CosmicColor } from "@util/CosmicColor";
import gettRPC from "@util/api/trpc";

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
    public trpc = gettRPC(process.env.DISCORD_FISHING_TOKEN as string);

    constructor(public conf: DiscordBotConfig) {
        super();

        this.token = conf.token ?? process.env.DISCORD_TOKEN;
        this.client = new Discord.Client({
            intents: [
                "Guilds",
                "GuildMessages",
                "MessageContent",
                "GuildMembers",
                "GuildModeration"
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

            const groups = await this.trpc.commandList.query();
            if (!groups) throw "Unable to get command list.";

            const builders = [];
            const seen: string[] = [];

            for (const group of groups) {
                for (const command of group.commands) {
                    const discordCommand = command.aliases[0];
                    if (seen.indexOf(discordCommand) !== -1) continue;

                    const builder = new SlashCommandBuilder();

                    builder.setName(discordCommand);
                    builder.setDescription(command.description);
                    builder.addStringOption(option =>
                        option
                            .setName("args")
                            .setDescription("Command arguments")
                    );

                    seen.push(discordCommand);

                    builders.push(builder);
                }
            }

            const rest = new Discord.REST().setToken(this.token || "");
            rest.put(
                Discord.Routes.applicationGuildCommands(
                    this.client.user?.id || "",
                    this.conf.serverID
                ),
                {
                    body: builders
                }
            );
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
                prefixes = await this.trpc.prefixes.query();
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

            const command = await this.trpc.command.query({
                channel: msg.channelId,
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
                this.logger.error(err);
                this.logger.warn("Unable to parse server message");
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
                await existingRole.setColor(msg.color.toUpperCase());
            }
        });

        this.b.on("sendchat", msg => {
            // this.logger.debug("sendchat message:", msg);
            if (!this.defaultChannel) return;

            if (typeof msg.channel === "string") {
                if (msg.channel !== this.defaultChannel.id) return;
            }

            this.defaultChannel.send(
                msg.message.split(`@${msg.id}`).join(`<@${msg.id}>`)
            );
        });

        this.client.on("interactionCreate", async msg => {
            if (!this.server) return;
            if (msg.guildId !== this.server.id) return;

            if (!msg.isCommand()) return;

            const existingRole = this.server.roles.cache.find(
                role => role.name === msg.user.id
            );

            if (!existingRole) return;

            let prefixes: string[];

            try {
                prefixes = await this.trpc.prefixes.query();
            } catch (err) {
                this.logger.error(err);
                this.logger.warn("Unable to contact server");
                return;
            }

            let usedPrefix = prefixes[0];
            if (!usedPrefix) return;

            this.logger.debug("Args:", msg.options.data);

            const argsOption = msg.options.get("args");
            const args = argsOption
                ? argsOption.value
                    ? argsOption.value.toString().split(" ")
                    : []
                : [];

            const command = await this.trpc.command.query({
                channel: msg.channelId || this.conf.defaultChannelID,
                args: args,
                command: msg.commandName,
                prefix: usedPrefix,
                user: {
                    id: msg.user.id,
                    name: msg.user.displayName,
                    color: existingRole.hexColor
                }
            });

            if (!command) return;
            if (command.response)
                msg.reply(
                    command.response
                        .split(`@${msg.user.id}`)
                        .join(`<@${msg.user.id}>`)
                );
        });
    }
}
