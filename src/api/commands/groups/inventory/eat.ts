import { addBack } from "@server/backs";
import Command from "@server/commands/Command";
import { logger } from "@server/commands/handler";
import { getInventory, updateInventory } from "@server/data/inventory";
import { CosmicColor } from "@util/CosmicColor";

export const eat = new Command(
    "eat",
    ["eat", "oot"],
    "Eat literally anything in your inventory",
    "eat <something>",
    "command.inventory.eat",
    async ({ id, command, args, prefix, part, user }) => {
        const eating = args[0];
        if (!eating) return `What do you want to ${prefix}eat?`;

        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        let foundObject: IObject | undefined;
        let tryChangingColor = false;
        let i = 0;

        for (const item of inventory.items as unknown as IItem[]) {
            if (!item.name.toLowerCase().includes(eating.toLowerCase())) {
                i++;
                continue;
            }

            foundObject = item;

            let shouldRemove = false;

            if (typeof item.count !== "undefined") {
                if (item.count > 1) {
                    shouldRemove = false;
                    ((inventory.items as TInventoryItems)[i].count as number)--;
                } else {
                    shouldRemove = true;
                }
            } else {
                shouldRemove = true;
            }

            if (shouldRemove) (inventory.items as TInventoryItems).splice(i, 1);
            break;
        }

        i = 0;

        for (const pokemon of inventory.pokemon as TPokemonSack) {
            if (!pokemon.name.toLowerCase().includes(eating.toLowerCase())) {
                i++;
                continue;
            }

            foundObject = pokemon as unknown as IObject;

            let shouldRemove = false;

            if (typeof pokemon.count !== "undefined") {
                if (pokemon.count > 1) {
                    shouldRemove = false;
                    ((inventory.pokemon as TPokemonSack)[i].count as number)--;
                } else {
                    shouldRemove = true;
                }
            } else {
                shouldRemove = true;
            }

            if (shouldRemove) (inventory.pokemon as TPokemonSack).splice(i, 1);
            break;
        }

        i = 0;

        for (const fish of inventory.fishSack as TFishSack) {
            if (!fish.name.toLowerCase().includes(eating.toLowerCase())) {
                i++;
                continue;
            }

            foundObject = fish;

            let shouldRemove = false;

            if (typeof fish.count !== "undefined") {
                if (fish.count > 1) {
                    shouldRemove = false;
                    ((inventory.fishSack as TFishSack)[i].count as number)--;
                } else {
                    shouldRemove = true;
                }
            } else {
                shouldRemove = true;
            }

            if (shouldRemove) (inventory.fishSack as TFishSack).splice(i, 1);
            break;
        }

        if (!foundObject) return `You don't have "${eating}" to eat.`;
        if (foundObject.objtype == "fish") {
            tryChangingColor = true;
        }

        await updateInventory(inventory);

        if (!tryChangingColor) {
            if (foundObject.id == "sand") {
                return `Our friend ${part.name} ate of his/her ${foundObject.name}.`;
            } else {
                return `Our friend ${part.name} ate his/her ${foundObject.name}.`;
            }
        } else {
            const r = Math.random();

            if (r < 0.3) {
                const color = new CosmicColor(
                    Math.floor(Math.random() * 255),
                    Math.floor(Math.random() * 255),
                    Math.floor(Math.random() * 255)
                );

                addBack(id, {
                    m: "color",
                    id: part.id,
                    color: color.toHexa()
                });

                return `Our friend ${part.name} ate his/her ${
                    foundObject.name
                } and it made him/her turn ${color.getName().toLowerCase()}.`;
            } else {
                return `Our friend ${part.name} ate his/her ${foundObject.name}.`;
            }
        }
    }
);
