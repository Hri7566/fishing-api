import Command from "@server/commands/Command";
import { commandGroups } from "..";

export const help = new Command(
    "help",
    [
        "help",
        "h",
        "holp",
        "halp",
        "hilp",
        "hulp",
        "commands",
        "commonds",
        "cmds",
        "cimminds",
        "cammands",
        "cummunds"
    ],
    "Get a list of commands, or how to use them",
    "help [command]",
    "command.general.help",
    async ({ id, command, args, prefix, part, user }) => {
        if (!args[0]) {
            const list = [];

            for (const group of commandGroups) {
                const list2 = [];

                for (const cmd of group.commands) {
                    if (cmd.visible) list2.push(cmd.aliases[0]);
                }

                if (list2.length > 0)
                    list.push(`**${group.displayName}:** ${list2.join(", ")}`);
            }

            return `__Fishing:__\n${list.join("\n")}`;
        }

        const commands = commandGroups.flatMap(group => group.commands);
        const foundCommand = commands.find(cmd =>
            cmd.aliases.includes(args[0])
        );

        if (!foundCommand) return `Command "${args[0]}" not found.`;

        return `Description: ${foundCommand.description} | Usage: ${foundCommand.usage}`;
    }
);
