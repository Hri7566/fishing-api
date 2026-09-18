import type { User } from "@prisma/client";
import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";
import prisma from "@server/data/prisma";
import { fuzzyFindUser } from "@server/data/user";
import { formatItem } from "@util/format";

export const inventory = new Command(
    "inventory",
    ["inventory", "inv", "items", "i"],
    "List your inventory items and details",
    "inventory",
    "command.items.inventory",
    async ({ id, command, args, prefix, part, user }) => {
        if (args[0]) {
            let decidedUser = await fuzzyFindUser(args[0]);
            if (!decidedUser) return `User "${args[0]}" not found.`;

            const inv = await getInventory(decidedUser.inventoryId);
            if (!inv)
                return `This message should be impossible to see because friend ${decidedUser.name}'s item list (and, by extension, their entire inventory) does not exist.`;

            const items = inv.items as TInventoryItems;

            return `Contents of ${decidedUser.name}'s inventory: ${items
                .map((item: IItem) => formatItem(item))
                .join(", ") || "(none)"
                }`;
        }

        const inv = await getInventory(user.inventoryId);
        if (!inv)
            return `Congratulations, you have no inventory. Not sure if that can be fixed, and I don't know how you got this message.`;
        const items = inv.items as TInventoryItems;

        return `Contents of ${part.name}'s inventory: ${items
            .map((item: IItem) => formatItem(item))
            .join(", ") || "(none)"
            }`;
    }
);
