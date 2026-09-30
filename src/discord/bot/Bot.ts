import { EventEmitter } from "node:events";
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
        this.trpc.events.subscribe(undefined, {
            onData: event => {
                if (typeof event === "object" && typeof event.m === "string")
                    this.b.emit(event.m, event);
            },
            onError: err => this.logger.error
        });

        this.client.on("clientReady", async () => {
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

            const existingRole = this.server.roles.cache.find(
                role => role.name === member.id
            );

            if (existingRole) {
                await member.roles.add(existingRole);
                return;
            }
        });

        this.client.on("messageCreate", async msg => {
            if (!this.server) return;
            if (msg.guildId !== this.server.id) return;
            if (!msg.member) return; // sent by webhook?

            let colorRole = this.server.roles.cache.find(
                role => role.name === msg.author.id
            );

            if (!colorRole) {
                colorRole = await this.createUserRole(msg.member);
                if (!colorRole)
                    return void msg.reply(
                        "Something really bad happened with Discord roles, so the bot won't work right now. Maybe contact server owner at some point - probably not urgent."
                    );
            }

            const name = msg.member.nickname ?? msg.member.displayName;

            const res = await this.runCommand(
                msg.content,
                {
                    id: msg.member.id,
                    color: msg.member.displayHexColor,
                    name
                },
                false,
                msg.channelId
            );

            if (!res) return;
            if (res.response) {
                const messages =
                    this.splitMessageEvery510CharsWithPreservedWords(
                        res.response
                    );
                for (const message of messages) {
                    msg.reply(
                        message
                            .split(`@${msg.author.id}`)
                            .join(`<@${msg.author.id}>`)
                    );
                }
            }
        });

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
                    await this.createUserRole(member);
                } catch (err) {
                    this.logger.warn(
                        "Unable to create and set color for user ID:",
                        msg.id
                    );
                    return;
                }
            } else {
                await existingRole.setColors({
                    primaryColor: msg.color
                });
            }
        });

        this.b.on("sendchat", msg => {
            this.logger.debug("sendchat message:", msg);
            if (!this.defaultChannel) return;

            if (typeof msg.channel === "string") {
                if (msg.channel !== this.defaultChannel.id) return;
            }

            const messages = this.splitMessageEvery510CharsWithPreservedWords(
                msg.message.split(`@${msg.id}`).join(`<@${msg.id}>`)
            );

            for (const message of messages) {
                this.defaultChannel.send(message);
            }
        });

        this.client.on("interactionCreate", async interaction => {
            if (!this.server) return;
            if (interaction.guildId !== this.server.id) return;

            if (!this.defaultChannel) return;
            if (interaction.channelId !== this.defaultChannel.id) return;

            if (!interaction.isChatInputCommand()) return;

            const usedCommand = interaction.commandName;
            await interaction.deferReply();

            const args = interaction.options.getString("args");
            const member = interaction.member;
            if (!member)
                return await interaction.editReply(
                    "Must be a guild member to fish"
                );

            if (!(member instanceof Discord.GuildMember))
                return await interaction.editReply(
                    "Must not be a webhook to fish"
                );

            let role = this.server.roles.cache.find(
                r => r.name === member.user.id
            );
            if (!role) {
                role = await this.createUserRole(member);
                if (!role)
                    return await interaction.editReply({
                        content:
                            "Somehow, you don't have a role. I can't help you."
                    });
            }

            let prefix: string;

            const prefixes = await this.trpc.prefixes.query();
            if (!prefixes) {
                prefix = "/";
            } else {
                prefix = prefixes[0];
            }

            const message =
                prefix + (args ? usedCommand + " " + args : usedCommand);

            const res = await this.runCommand(
                message,
                {
                    id: member.user.id,
                    name: member.nickname ?? member.displayName,
                    color: role.hexColor
                },
                false,
                interaction.channelId
            );

            if (!res)
                return await interaction.editReply(
                    "Error: Unable to contact server."
                );
            if (res.response) {
                const messages =
                    this.splitMessageEvery510CharsWithPreservedWords(
                        res.response
                    );
                for (const message of messages) {
                    await interaction.editReply(
                        message.split(`@${member.id}`).join(`<@${member.id}>`)
                    );
                }
            }
        });
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

        const usedPrefix: string | undefined = prefixes.find(pr =>
            chatMessage.startsWith(pr)
        );
        return usedPrefix;
    }

    public async runCommand(
        chatMessage: string,
        user: { id: string; name: string; color: string },
        isDM = false,
        channelId: string
    ) {
        if (!this.client.isReady()) return;

        const args = chatMessage.split(" ");
        const usedPrefix = await this.getUsedPrefix(chatMessage);
        if (!usedPrefix) return; // no prefix, no running commands

        const spacedPrefix = usedPrefix.endsWith(" ");
        if (spacedPrefix) {
            args.splice(0, 1);
        }

        const command = await this.trpc.command.query({
            channel: channelId,
            args: args.slice(1, args.length),
            // if the prefix has no trailing space,
            // cut the prefix out of the command
            command: !spacedPrefix
                ? args[0].substring(usedPrefix.length)
                : args[0],
            prefix: usedPrefix,
            user,
            isDM
        });

        return command;
    }

    public async createUserRole(member: Discord.GuildMember) {
        if (!this.server) return;

        const color = this.getRandomColor();
        const role = await this.server.roles.create({
            name: member.id,
            colors: {
                primaryColor: Number.parseInt(color.toHexa().substring(1), 16)
            }
        });

        if (!role) throw new Error("Unable to create role");
        member.roles.add(role);

        return role;
    }

    public getRandomColor() {
        const color = new CosmicColor(
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)
        );

        return color;
    }

    public splitMessageEvery510CharsWithPreservedWords(text: string) {
        const splits = text.match(/.{510}|.{1,509}/gi);
        if (!splits) return [text];
        return [...splits] as string[];
    }
}
