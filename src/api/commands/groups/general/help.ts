import Command from "@server/commands/Command";
import { commandGroups } from "..";

const aliases = [
    "help",
    "h",
    "holp",
    "halp",
    "hilp",
    "hulp",
    "commands",
    "commonds",
    "cmds",
    "cmd",
    "cimminds",
    "cammands",
    "cummunds"
];

export const help = new Command(
    "help",
    aliases,
    "Get a list of commands, or how to use them",
    "help [command]",
    "command.general.help",
    async ({ id, command, args, prefix, part, user }) => {
        if (!args[0]) {
            const list = commandGroups.map(g => `${g.displayName}`);
            return `__Fishing:__ ${list.join(" | ")}`;
        }

        const foundGroup = commandGroups.find(group => {
            // match group.displayName or group.id
            return group.displayName
                .toLowerCase()
                .includes(
                    args[0].toLowerCase()
                ) || group.id
                    .toLowerCase()
                    .includes(
                        args[0].toLowerCase()
                    )
        });

        if (!foundGroup) {
            // describe command
            const commands = commandGroups.flatMap(group => group.commands);
            const foundCommand = commands.find(cmd =>
                cmd.aliases.includes(args[0])
            );

            if (!foundCommand) return `Command "${args[0]}" not found.`;
            return `Description: ${foundCommand.description} | Usage: ${foundCommand.usage}`;
        } else {
            // list group
            const list = [];

            for (const cmd of foundGroup.commands) {
                if (cmd.visible) list.push(`\`${prefix}${cmd.aliases[0]}\``);
            }

            return `Commands in __${foundGroup.displayName}:__ ${list.join(" | ")}`
        }

    }
);
