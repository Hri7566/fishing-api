import Command from "@server/commands/Command";
import { commandGroups } from "..";
import { logger } from "@server/commands/handler";

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
    "Get command list or command usage",
    "help [command]",
    "command.general.help",
    async ({ id, command, args, prefix, part, user }) => {
        if (!args[0]) {
            const list = [];

            for (const group of commandGroups) {
                let list2 = [];

                for (const cmd of group.commands) {
                    if (cmd.visible) list2.push(cmd.aliases[0]);
                }

                if (list2.length > 0)
                    list.push(`${group.displayName}: ${list2.join(", ")}`);
            }

            return `__Fishing:__\n${list.join("\n")}`;
        } else {
            const commands = commandGroups.flatMap(group => group.commands);

            const foundCommand = commands.find(cmd =>
                cmd.aliases.includes(args[0])
            );
            if (!foundCommand) return `Command "${args[0]}" not found.`;

            return `Description: ${foundCommand.description} | Usage: ${foundCommand.usage}`;
        }
    }
);
