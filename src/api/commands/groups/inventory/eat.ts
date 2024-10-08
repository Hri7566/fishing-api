import Command from "@server/commands/Command";
import { logger } from "@server/commands/handler";
import { getInventory, updateInventory } from "@server/data/inventory";
import { removeItem } from "@server/items";
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
        let res;

        if (bhv) {
            if (!bhv["eat"]) return `You can't eat the ${foundObject.name}.`;

            res = await runBehavior(thingy, "eat", foundObject, props);
            shouldRemove = res.shouldRemove;
        } else {
            shouldRemove = true;
        }

        if (shouldRemove) {
            if (foundObject.objtype == "fish") {
                removeItem(inventory.fishSack, foundObject);
            } else if (foundObject.objtype == "item") {
                removeItem(inventory.items, foundObject);
            }

            await updateInventory(inventory);
        }

        if (foundObject.id == "sand") {
            if (res) {
                if (res.and) {
                    return `Our friend ${part.name} ate of his/her ${foundObject.name} ${res.and}`;
                } else {
                    return `Our friend ${part.name} ate of his/her ${foundObject.name}.`;
                }
            } else {
                return `Our friend ${part.name} ate of his/her ${foundObject.name}.`;
            }
        } else {
            if (res) {
                if (res.and) {
                    return `Our friend ${part.name} ate his/her ${foundObject.name} ${res.and}`;
                } else {
                    return `Our friend ${part.name} ate his/her ${foundObject.name}.`;
                }
            } else {
                return `Our friend ${part.name} ate his/her ${foundObject.name}.`;
            }
        }
    }
);
