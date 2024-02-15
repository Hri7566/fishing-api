import { Logger } from "@util/Logger";
import type Command from "./Command";
import { commandGroups } from "./groups";

export const logger = new Logger("Command Handler");

export async function handleCommand(
    command: string,
    args: string[],
    prefix: string,
    user: IUser
): Promise<ICommandResponse | void> {
    let foundCommand: Command | undefined;

    commandGroups.forEach(group => {
        if (!foundCommand) {
            foundCommand = group.commands.find(cmd => {
                return cmd.aliases.includes(command);
            });
        }
    });

    if (!foundCommand) return;

    // TODO Check user's (or their groups') permissions against command permission node

    try {
        const response = await foundCommand.callback(
            command,
            args,
            prefix,
            user
        );
        if (response) return { response };
    } catch (err) {
        logger.error(err);
        return {
            response:
                "An error has occurred, but no fish were lost. If you are the fishing bot owner, check the error logs for details."
        };
    }
}
