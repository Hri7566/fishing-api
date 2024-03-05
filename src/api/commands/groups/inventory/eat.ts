import Command from "@server/commands/Command";
import { getInventory, updateInventory } from "@server/data/inventory";
import { itemBehaviorMap, runBehavior } from "@server/items/behavior";

export const eat = new Command(
    "eat",
    ["eat", "oot"],
    "Eat literally anything you have (except non-fish animals)",
    "eat <something>",
    "command.inventory.eat",
    async props => {
        const { args, prefix, part, user } = props;
        const eating = args[0];
        if (!eating) return `What do you want to ${prefix}eat?`;

        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        let foundObject: IObject | undefined;
        let i = 0;
        let shouldRemove = false;

        for (const item of inventory.items as unknown as IItem[]) {
            if (!item.name.toLowerCase().includes(eating.toLowerCase())) {
                i++;
                continue;
            }

            foundObject = item;
            break;
        }

        i = 0;

        for (const fish of inventory.fishSack as TFishSack) {
            if (!fish.name.toLowerCase().includes(eating.toLowerCase())) {
                i++;
                continue;
            }

            foundObject = fish;
            break;
        }

        if (!foundObject) return `You don't have "${eating}" to eat.`;

        // Get item behaviors and run the "eat" script
        let thingy = foundObject.id;
        if (foundObject.objtype == "fish") thingy = "fish";

        const bhv = itemBehaviorMap[thingy];
        if (!bhv) return `The ${foundObject.name} isn't edible.`;
        if (!bhv["eat"]) return `You can't eat the ${foundObject.name}.`;

        const res = await runBehavior(thingy, "eat", foundObject, props);
        shouldRemove = res.shouldRemove;

        if (shouldRemove) {
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

            await updateInventory(inventory);
        }

        if (foundObject.id == "sand") {
            if (res.and) {
                return `Our friend ${part.name} ate of his/her ${foundObject.name} ${res.and}`;
            } else {
                return `Our friend ${part.name} ate of his/her ${foundObject.name}.`;
            }
        } else {
            if (res.and) {
                return `Our friend ${part.name} ate his/her ${foundObject.name} ${res.and}`;
            } else {
                return `Our friend ${part.name} ate his/her ${foundObject.name}.`;
            }
        }
    }
);
