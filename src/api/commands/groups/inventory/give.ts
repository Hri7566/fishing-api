import type { User } from "@prisma/client";
import Command from "@server/commands/Command";
import { logger } from "@server/commands/handler";
import { getInventory, updateInventory } from "@server/data/inventory";
import prisma from "@server/data/prisma";
import { addItem, findItemByNameFuzzy, removeItem } from "@server/items";

export const give = new Command(
    "give",
    ["give", "govo", "guvu", "gava", "geve", "givi", "g", "donate", "bestow"],
    "Give another user something you have",
    "give <user> <item>",
    "command.inventory.give",
    async ({ id, command, args, prefix, part, user }) => {
        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        let targetFuzzy = args[0];
        if (!targetFuzzy) return `To whom will you ${prefix}${command} to?`;

        let foundUser: User = user;
        foundUser = (await prisma.user.findFirst({
            where: {
                name: {
                    contains: targetFuzzy,
                    mode: "insensitive"
                }
            }
        })) as User;

        if (!foundUser) return `Who is ${targetFuzzy}? I don't know them.`;

        const foundInventory = await getInventory(foundUser.inventoryId);
        if (!foundInventory) return `They have no room, apparently.`;

        if (!args[1])
            return `What are you going to ${prefix}${command} to ${foundUser.name}?`;
        const argcat = args.slice(1).join(" ");
        let foundObject: IObject | undefined;

        foundObject =
            findItemByNameFuzzy(inventory.items, argcat) ||
            findItemByNameFuzzy(inventory.fishSack, argcat);

        if (!foundObject) return `You don't have any "${argcat}" to give.`;

        let updated = false;
        if (foundObject.objtype == "fish") {
            addItem(foundInventory.items as unknown as IItem[], foundObject);
            updated = true;
        } else if (foundObject.objtype == "item") {
            addItem(foundInventory.items as unknown as IItem[], foundObject);
            updated = true;
        }

        if (updated) {
            if (foundObject.objtype == "fish") {
                removeItem(inventory.fishSack, foundObject, 1);
            } else if (foundObject.objtype == "item") {
                removeItem(inventory.items, foundObject, 1);
            }

            await updateInventory(foundInventory);
            await updateInventory(inventory);

            return `You ${prefix}${
                command.endsWith("e") ? `${command}d` : `${command}ed`
            } your ${foundObject.name} to ${foundUser.name}.`;
        } else {
            return `You tried to give your ${foundObject.name} away, but I messed up and the transaction was reverted.`;
        }
    }
);
