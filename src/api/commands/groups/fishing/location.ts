import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";
import { locations } from "@server/fish/locations";

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
    "You pull your cell phone out of your pocket and turn it on. Opening the maps app, you realize you are at {loc}.",
    "You currently happen to be somewhere near {loc}.",
    "You look all over the piece of paper you're holding. It's actually a map, and it says you must be near {loc}.",
    "Having run your fingers all over the paper, you finally come to the conclusion you must be somewhere in the vicinity of {loc}",
    "Your eyes travel your map as you realize you have to be somewhere near {loc}.",
    "Having found the rock that you see on your map, you are likely to be near {loc}.",
    "You are likely to be near {loc}.",
    "Near {loc}, you feel the wind blow on your face.",
    "The wind here is strong, so you must be near {loc}.",
    "Nowadays, we consider this location to be {loc}.",
    "The ancient tribe long ago has given this place the name of {loc}.",
    "Over the many years, people have travelled these lands and decided to name this area {loc}",
    "You pull your cell phone out of your pocket and open the Maps app. The screen loads for a while, until showing you the name {loc}"
];
