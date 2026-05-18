import Command from "@server/commands/Command";
import { getInventory, updateInventory } from "@server/data/inventory";
import { locations, saveObjects } from "@server/fish/locations";
import { go } from "../fishing/go";
import { addItem } from "@server/items";
import { copy } from "@util/object";

export const take = new Command(
    "take",
    ["take"],
    "Take something from your surroundings",
    "take <something>",
    "command.inventory.take",
    async ({ id, command, args, prefix, part, user }) => {
        const taking = args[0];

        if (!taking) {
            return `Are you going to ${prefix}take <something>?`;
        }

        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        const loc = locations.find(loc => loc.id === inventory.location);
        if (!loc)
            return `Something is broken, just ${prefix}${go.aliases[0]} somewhere else first`;

        let foundObject: IObject | undefined;

        const items = inventory.items as unknown as IItem[];
        const fish = inventory.fishSack as unknown as IFish[];
        const pokemon = inventory.pokemon as unknown as IPokemon[];

        const idx = loc.objects.findIndex(obj =>
            obj.name.toLowerCase().includes(taking.toLowerCase())
        );

        if (idx !== -1) {
            foundObject = loc.objects[idx];
            if (foundObject.objtype !== "pokemon") {
                if (typeof foundObject.count !== "undefined" && foundObject.count > 1) {
                    foundObject.count--;
                } else {
                    loc.objects.splice(idx, 1);
                }
            }

            await saveObjects();
        }

        foundObject = copy(foundObject);
        if (!foundObject) throw new Error("Unable to copy object");
        foundObject.count = 1;

        if (!foundObject) return `There is no "${taking}" here.`;

        switch (foundObject.objtype) {
            case "item":
                addItem(items, foundObject);
                break;
            case "fish":
                addItem(fish, foundObject);
                break;
            case "pokemon":
                // addItem(pokemon as unknown as IObject[], foundObject);
                return "Unlike other items, Pokémon have to be caught with a Pokéball.";
            default:
                break;
        }

        inventory.items = items;
        inventory.fishSack = fish;
        inventory.pokemon = pokemon;

        await updateInventory(inventory);

        return `You picked up the ${foundObject.name}.`;
    }
);
