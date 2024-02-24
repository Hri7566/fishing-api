import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";
import { getFishing, stopFishing } from "@server/fish/fishers";
import { locations } from "@server/fish/locations";

export const reel = new Command(
    "reel",
    ["reel", "rool", "stopfishing", "stopfoshing"],
    "Reel in and stop fishing",
    "fishing",
    "command.fishing.reel",
    async ({ id, command, args, prefix, part, user }) => {
        const fishing = getFishing(id, part.id);
        if (fishing) {
            stopFishing(id, part.id);
            return `Our friend ${part.name} reel his/her lure back inside, temporarily decreasing his/her chances of catching a fish by 100%.`;
        } else {
            return `Friend ${part.name}: You haven't ${prefix}casted it.`;
        }
    }
);
