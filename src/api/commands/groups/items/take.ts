import Command from "@server/commands/Command";
import { getInventory, updateInventory } from "@server/data/inventory";
import { locations, saveObjects } from "@server/fish/locations";
import { go } from "../regional/go";
import { addItem } from "@server/items";
import { copy } from "@util/object";
import { nearby } from "../regional/nearby";
import { look } from "../regional/look";

export const take = new Command(
    "take",
    ["take"],
    "Take something from your surroundings",
    "take <something>",
    "command.items.take",
    async ({ id, command, args, prefix, part, user }) => {
        const taking = args[0];

        if (!taking) {
            return `Are you going to ${prefix}take <something>?`;
        }

        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        // TODO: make tree an item and move this take code to a behavior

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
                if (
                    typeof foundObject.count !== "undefined" &&
                    foundObject.count > 1
                ) {
                    foundObject.count--;
                } else {
                    loc.objects.splice(idx, 1);
                }
            }

            await saveObjects();
        }

        if (!foundObject) {
            return getNotFoundText(part.name, `"${taking}"`, prefix, command);
        }
        foundObject = copy(foundObject);
        if (!foundObject) throw new Error("Unable to copy object");
        foundObject.count = 1;

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

const notFoundText = [
    "There is no $TAKING here.",
    "These are not the $TAKING you are looking for.",
    "Friend $USER missed.",
    "You attempt to $CMD the $TAKING, but it does not appear to be here.",
    "The $TAKING is not here.",
    "There is no $TAKING in this vicinity.",
    "Unfortunately, you try to take the $TAKING, but there's none here.",
    "Taking the $TAKING would mean there's some here, which there is not.",
    "You can't $CMD the $TAKING. Take a $LOOK around.",
    "You $LOOK for a $TAKING, but it's not $NEARBY."
];

function getNotFoundText(
    username: string,
    missing: string,
    usedPrefix: string,
    usedCommand: string
) {
    const answer =
        notFoundText[Math.floor(Math.random() * notFoundText.length)];

    return answer
        .split("$TAKING")
        .join(missing)
        .split("$USER")
        .join(username)
        .split("$CMD")
        .join(usedCommand)
        .split("$NEARBY")
        .join(usedPrefix + nearby.aliases[0])
        .split("$LOOK")
        .join(usedPrefix + look.aliases[0]);
}
