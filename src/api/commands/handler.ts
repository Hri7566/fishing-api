import { Logger } from "@util/Logger";
import type Command from "./Command";
import { commandGroups } from "./groups";
import { createUser, getUser, updateUser } from "@server/data/user";
import { createInventory, getInventory } from "@server/data/inventory";

export const logger = new Logger("Command Handler");

export async function handleCommand(
    id: string,
    command: string,
    args: string[],
    prefix: string,
    part: IPart,
    isDM: boolean = false
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

    let user = await getUser(part.id);

    if (!user) {
        const inventory = await createInventory({});

        user = await createUser({
            id: part.id,
            name: part.name,
            color: part.color,
            inventoryId: inventory.id
        });
    }

    if (user.name !== part.name) {
        user.name = part.name;
        await updateUser(user);
    }

    if (user.color !== part.color) {
        user.color = part.color;
        await updateUser(user);
    }

    let inventory = await getInventory(user.inventoryId);
    if (!inventory) inventory = await createInventory({ id: user.inventoryId });

    // TODO Check user's (or their groups') permissions against command permission node

    try {
        const response = await foundCommand.callback({
            id,
            command,
            args,
            prefix,
            part,
            user,
            isDM: isDM ?? false
        });

        if (response) return { response };
    } catch (err) {
        logger.error(err);

        return {
            response:
                "An error has occurred, but no fish were lost. If you are the fishing bot owner, check the server's error logs for details."
        };
    }
}
