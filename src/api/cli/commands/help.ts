import { ReadlineCommand } from "../ReadlineCommand";
import { readlineCommands } from "../commands";

export const help = new ReadlineCommand(
    "help",
    ["help", "cmds"],
    "List commands",
    "help [command]",
    async line => {
        const args = line.split(" ");

        if (!args[1]) {
            return `Commands: ${readlineCommands
                .map(cmd => cmd.aliases[0])
                .join(" | ")}`;
        }

        const foundCommand: ReadlineCommand | undefined = readlineCommands.find(
            cmd => cmd.aliases.includes(args[1])
        );
        if (!foundCommand) return `No such command "${args[1]}"`;

        return `Description: ${foundCommand.description} | Usage: ${foundCommand.usage}`;
    }
);
