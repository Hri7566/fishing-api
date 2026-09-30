import type { User } from "@prisma/client";
import Command from "@server/commands/Command";
import { logger } from "@server/commands/handler";
import { getInventory, updateInventory } from "@server/data/inventory";
import prisma from "@server/data/prisma";
import { fuzzyFindUser } from "@server/data/user";
import { addItem, findItemByNameFuzzy, removeItem } from "@server/items";
import { copy } from "@util/object";

export const give = new Command(
    "give",
    ["give", "govo", "guvu", "gava", "geve", "givi", "g", "donate", "bestow"],
    "Give another user something you have",
    "give <user> <item>",
    "command.items.give",
    async ({ id, command, args, prefix, part, user }) => {
        const inventory = await getInventory(user.inventoryId);
        if (!inventory)
            return `According to my records, you don't have an inventory whatsoever. The data is literally not there. Congratulations.`;

        const targetFuzzy = args[0];
        if (!targetFuzzy) return `To whom will you ${prefix}${command} to?`;

        let foundUser = await fuzzyFindUser(targetFuzzy);
        if (!foundUser) return `Who is ${targetFuzzy}? I don't know them.`;

        const foundInventory = await getInventory(foundUser.inventoryId);
        if (!foundInventory) return "They have no room, apparently.";

        if (!args[1])
            return `What are you going to ${prefix}${command} to ${foundUser.name}?`;
        const argcat = args.slice(1).join(" ");
        let foundObject: IObject | undefined;

        foundObject =
            findItemByNameFuzzy(inventory.items, argcat) ||
            findItemByNameFuzzy(inventory.fishSack, argcat);

        if (!foundObject) return `You don't have any "${argcat}" to give.`;

        const item = copy(foundObject);

        let updated = false;
        if (item.objtype === "fish") {
            addItem(foundInventory.fishSack as unknown as IItem[], item);
            updated = true;
        } else if (item.objtype === "item") {
            addItem(foundInventory.items as unknown as IItem[], item);
            updated = true;
        }

        if (updated) {
            if (item.objtype === "fish") {
                removeItem(inventory.fishSack, item, 1);
            } else if (item.objtype === "item") {
                removeItem(inventory.items, item, 1);
            }

            await updateInventory(foundInventory);
            await updateInventory(inventory);

            return `You ${prefix}${
                command.endsWith("e") ? `${command}d` : `${command}ed`
            } your ${item.name} to ${foundUser.name}.`;
        }

        return `You tried to give your ${foundObject.name} away, but I messed up and the transaction was reverted.`;
    }
);
