import BehaviorCommand from "@server/commands/BehaviorCommand";
import { logger } from "@server/commands/handler";
import { getInventory, updateInventory } from "@server/data/inventory";
import { findItemByNameFuzzy, removeItem } from "@server/items";
// import { itemBehaviorMap, runBehavior } from "@server/items/behavior";

export const eat = new BehaviorCommand(
    "eat",
    ["eat", "oot"],
    "Eat literally anything you have (except non-fish animals)",
    "eat <something>",
    "command.inventory.eat",
    async (props, self) => {
        const { args, prefix, part, user, command } = props;
        // const eating = args[0];
        const eating = args.join(" ");
        if (!eating) return `What do you want to ${prefix}${command}?`;

        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        let foundObject: IObject | undefined;
        const i = 0;
        let shouldRemove = false;

        foundObject =
            findItemByNameFuzzy(inventory.items, eating) ||
            findItemByNameFuzzy(inventory.fishSack, eating);

        if (!foundObject) return `You don't have "${eating}" to eat.`;

        // Get item behaviors and run the "eat" script
        let thingy = foundObject.id;
        if (foundObject.objtype === "fish") thingy = "fish";

        let res: TBehaviorResponse<
            IBehaviorContextStateDefinitions["eat"]["state"]
        >;
        let bhvNamespace = foundObject.id;

        if (foundObject.objtype === "fish") {
            bhvNamespace = "fish";
        }

        res = await self.behave<"eat">(
            { id: props.id, part, object: foundObject, user },
            bhvNamespace,
            async () => {
                shouldRemove = true;

                return {
                    success: true,
                    state: {
                        shouldRemove: true
                    }
                };
            }
        );

        if (!res)
            throw new Error(
                `Unable to ${prefix}${command} fish: no behavior result`
            );

        if (res.success) shouldRemove = res.state.shouldRemove;
        else shouldRemove = false;

        if (shouldRemove) {
            if (foundObject.objtype === "fish") {
                removeItem(inventory.fishSack, foundObject);
            } else if (foundObject.objtype === "item") {
                removeItem(inventory.items, foundObject);
            }

            await updateInventory(inventory);
        }

        if (!res.success) {
            return `You broke the bot trying to ${prefix}eat the ${foundObject.name}. Congratulations.`;
        }

        const state =
            res.state as IBehaviorContextStateDefinitions["eat"]["state"];

        if (foundObject.id === "sand") {
            if (res?.success && typeof state.and !== "undefined") {
                return `Our friend ${part.name} ate of his/her ${foundObject.name} ${state.and}`;
            }

            return `Our friend ${part.name} ate of his/her ${foundObject.name}.`;
        }

        if (res?.success && typeof state.and !== "undefined") {
            return `Our friend ${part.name} ate his/her ${foundObject.name} ${state.and}`;
        }

        return `Our friend ${part.name} ate his/her ${foundObject.name}.`;
    }
);
