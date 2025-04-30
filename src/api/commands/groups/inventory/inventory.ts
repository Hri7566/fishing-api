import type { User } from "@prisma/client";
import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";
import prisma from "@server/data/prisma";

export const inventory = new Command(
    "inventory",
    ["inventory", "inv", "items", "i"],
    "List your inventory items and details",
    "inventory",
    "command.inventory.inventory",
    async ({ id, command, args, prefix, part, user }) => {
        if (args[0]) {
            let decidedUser: User = user;
            decidedUser = (await prisma.user.findFirst({
                where: {
                    name: {
                        contains: args[0]
                    }
                }
            })) as User;

            if (!decidedUser)
                decidedUser = (await prisma.user.findFirst({
                    where: {
                        id: {
                            contains: args[0]
                        }
                    }
                })) as User;

            if (!decidedUser) return `User "${args[0]}" not found.`;

            const inv = await getInventory(decidedUser.inventoryId);
            if (!inv)
                return `This message should be impossible to see because friend ${decidedUser.name}'s items inventory (and, by extension, their entire inventory) does not exist.`;

            const items = inv.items as TInventoryItems;

            return `Contents of ${decidedUser.name}'s inventory: ${
                items
                    .map(
                        (item: IItem) =>
                            `${item.emoji || "📦"}${item.name}${
                                item.count ? ` (x${item.count})` : ""
                            }`
                    )
                    .join(", ") || "(none)"
            }`;
        }

        const inv = await getInventory(user.inventoryId);
        if (!inv)
            return `Apparently, you have no inventory. Not sure if that can be fixed, and I don't know how you got this message.`;
        const items = inv.items as TInventoryItems;

        return `Contents of ${part.name}'s inventory: ${
            items
                .map(
                    (item: IItem) =>
                        `${item.emoji || "📦"}${item.name}${
                            item.count ? ` (x${item.count})` : ""
                        }`
                )
                .join(", ") || "(none)"
        }`;
    }
);
