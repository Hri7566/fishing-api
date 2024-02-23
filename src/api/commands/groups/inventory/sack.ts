import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";
import prisma from "@server/data/prisma";
import type { User } from "@prisma/client";

export const sack = new Command(
    "sack",
    ["sack", "caught"],
    "Look at your fish sack",
    "sack",
    "command.inventory.sack",
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
                return `This message should be impossible to see because friend ${decidedUser.name}'s fish sack (and, by extension, their entire inventory) does not exist.`;

            const fishSack = inv.fishSack as TFishSack;

            return `Contents of ${decidedUser.name}'s fish sack: ${
                fishSack
                    .map(
                        (fish: IFish) =>
                            `${fish.emoji || "🐟"}${fish.name}${
                                fish.count ? ` (x${fish.count})` : ""
                            }`
                    )
                    .join(", ") || "(none)"
            }`;
        } else {
            const inv = await getInventory(user.inventoryId);
            if (!inv) return;
            const fishSack = inv.fishSack as TFishSack;

            return `Contents of ${part.name}'s fish sack: ${
                fishSack
                    .map(
                        (fish: IFish) =>
                            `${fish.emoji || "🐟"}${fish.name}${
                                fish.count ? ` (x${fish.count})` : ""
                            }`
                    )
                    .join(", ") || "(none)"
            }`;
        }
    }
);
