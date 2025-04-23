import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";
import prisma from "@server/data/prisma";
import type { User } from "@prisma/client";

export const sack = new Command(
    "sack",
    [
        "sack",
        "caught",
        "catched",
        "sock",
        "fish-sack",
        "fishies",
        "myfish",
        "mysack",
        "sacks",
        "ʂасκ"
    ],
    "List your caught fish",
    "sack [user ID]",
    "command.inventory.sack",
    async ({ id, command, args, prefix, part, user }) => {
        if (args[0]) {
            let foundUser: User = user;
            foundUser = (await prisma.user.findFirst({
                where: {
                    name: {
                        contains: args[0]
                    }
                }
            })) as User;

            if (!foundUser)
                foundUser = (await prisma.user.findFirst({
                    where: {
                        id: {
                            contains: args[0]
                        }
                    }
                })) as User;

            if (!foundUser) return `User "${args[0]}" not found.`;

            const inv = await getInventory(foundUser.inventoryId);
            if (!inv)
                return `This message should be impossible to see because friend ${foundUser.name}'s fish sack (and, by extension, their entire inventory) does not exist.`;

            const fishSack = inv.fishSack as TFishSack;

            return `Contents of ${foundUser.name}'s fish sack: ${
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
);
