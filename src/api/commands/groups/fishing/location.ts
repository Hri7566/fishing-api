import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";
import { locations } from "@server/fish/locations";

const answers = [
    "You are at {loc}.",
    "You appear to be at {loc}.",
    "According to your map, you are at {loc}.",
    "The map says you are at {loc}.",
    "Looking at your world atlas, you appear to be at {loc}.",
    "The world atlas defines your location as {loc}.",
    "Judging by the wind direction, hemisphere sun angle, and the size of the waves in the water, you deduce that you must be at {loc}.",
    "You run your fingers down the map until you find {loc}. This is where you must be.",
    "Your cell phone's maps app shows your location as {loc}.",
    "You pull your cell phone out of your pocket and turn it on. Opening the maps app, you realize you are at {loc}."
];

export const location = new Command(
    "location",
    ["location", "loc", "where", "whereami", "l"],
    "Get current location",
    "location",
    "command.fishing.location",
    async ({ id, command, args, prefix, part, user }) => {
        const inventory = await getInventory(user.inventoryId);
        if (!inventory) return;

        const loc = locations.find(loc => loc.id == inventory.location);
        if (!loc) return "You are in the middle of nowhere.";

        const answer = answers[Math.floor(Math.random() * answers.length)];
        return answer.replaceAll("{loc}", loc.name);
    }
);
