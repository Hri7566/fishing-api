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
    "Help command",
    "help [command]",
    "command.general.help",
    async (command, args, prefix, user) => {
        return `${commandGroups
            .map(
                group =>
                    `${group.displayName}: ${group.commands
                        .map(cmd => (cmd.visible ? cmd.aliases[0] : "<hidden>"))
                        .join(", ")}`
            )
            .join("\n")}`;
    }
);
