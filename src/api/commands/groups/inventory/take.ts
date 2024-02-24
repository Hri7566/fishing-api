import Command from "@server/commands/Command";
import { logger } from "@server/commands/handler";
import { getInventory, updateInventory } from "@server/data/inventory";
import { locations, saveObjects } from "@server/fish/locations";
import { go } from "../fishing/go";
import { addItem } from "@server/items";

export const take = new Command(
    "take",
    ["take"],
    "Take something from your surroundings",
    "take <something>",
    "command.inventory.take",
    async ({ id, command, args, prefix, part, user }) => {
        let taking = args[0];

        if (!taking) {
            return `Are you going to ${prefix}take <something>?`;
        }

        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        let loc = locations.find(loc => loc.id == inventory.location);
        if (!loc)
            return `Something is broken, just ${prefix}${go.aliases[0]} somewhere else first`;

        let foundObject: IObject | undefined;

        const items = inventory.items as unknown as IItem[];
        const fish = inventory.fishSack as unknown as IFish[];
        const pokemon = inventory.pokemon as unknown as IPokemon[];

        for (const obj of loc.objects) {
            if (obj.name.toLowerCase().includes(taking.toLowerCase()))
                foundObject = obj;

            loc.objects.splice(loc.objects.indexOf(obj), 1);
            await saveObjects();
        }

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
                return "Unlike other items, Pokémon have to be caught.";
                break;
            default:
                break;
        }

        (inventory as any).items = items;
        (inventory as any).fishSack = fish;
        (inventory as any).pokemon = pokemon;

        await updateInventory(inventory);

        return `You picked up the ${foundObject.name}.`;
    }
);
