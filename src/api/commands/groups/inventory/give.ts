import type { User } from "@prisma/client";
import Command from "@server/commands/Command";
import { getInventory, updateInventory } from "@server/data/inventory";
import prisma from "@server/data/prisma";
import { addItem } from "@server/items";

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

        let i = 0;

        for (const item of inventory.items as unknown as IItem[]) {
            if (!item.name.toLowerCase().includes(argcat.toLowerCase())) {
                i++;
                continue;
            }

            foundObject = item;
            break;
        }

        i = 0;

        for (const fish of inventory.fishSack as TFishSack) {
            if (!fish.name.toLowerCase().includes(argcat.toLowerCase())) {
                i++;
                continue;
            }

            foundObject = fish;
            break;
        }

        if (!foundObject) return `You don't have any "${argcat}" to give.`;

        let updated = false;

        if (foundObject.objtype == "item") {
            addItem(foundInventory.items as unknown as IItem[], foundObject);
            updated = true;
        } else if (foundObject.objtype == "fish") {
            addItem(foundInventory.items as unknown as IItem[], foundObject);
            updated = true;
        }

        let shouldRemove = false;

        if (updated) {
            await updateInventory(foundInventory);

            if (foundObject.objtype == "fish") {
                i = 0;

                for (const fish of inventory.fishSack as TFishSack) {
                    if (typeof fish.count !== "undefined") {
                        if (fish.count > 1) {
                            shouldRemove = false;
                            ((inventory.fishSack as TFishSack)[i]
                                .count as number)--;
                        } else {
                            shouldRemove = true;
                        }
                    } else {
                        shouldRemove = true;
                    }

                    if (shouldRemove)
                        (inventory.fishSack as TFishSack).splice(i, 1);
                    break;
                }
            } else if (foundObject.objtype == "item") {
                i = 0;

                for (const item of inventory.items as unknown as IItem[]) {
                    if (typeof item.count == "number") {
                        if (item.count > 1) {
                            shouldRemove = false;
                            ((inventory.items as TInventoryItems)[i]
                                .count as number)--;
                        } else {
                            shouldRemove = true;
                        }
                    } else {
                        shouldRemove = true;
                    }

                    if (shouldRemove)
                        (inventory.items as TInventoryItems).splice(i, 1);
                    break;
                }
            }

            return `You ${
                command.endsWith("e") ? `${command}d` : `${command}ed`
            } your ${foundObject.name} to ${foundUser.name}.`;
        } else {
            return `You tried to give your ${foundObject.name} away, but I messed up and the transaction was reverted.`;
        }
    }
);
