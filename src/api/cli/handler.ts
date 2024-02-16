import type { ReadlineCommand } from "./ReadlineCommand";
import { readlineCommands } from "./commands";
import { logger } from "./readline";

export async function handleReadlineCommand(line: string) {
    let args = line.split(" ");

    let usedCommand: ReadlineCommand | undefined = readlineCommands.find(cmd =>
        cmd.aliases.includes(args[0])
    );
    if (!usedCommand) return "Unknown command";

    try {
        return await usedCommand.callback(line);
    } catch (err) {
        logger.error(err);
    }
}
