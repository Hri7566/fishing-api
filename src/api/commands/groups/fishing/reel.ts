import Command from "@server/commands/Command";
import { getFishing, stopFishing } from "@server/fish/fishers";

export const reel = new Command(
    "reel",
    ["reel", "rool", "stopfishing", "stopfoshing"],
    "Reel in and stop fishing",
    "reel",
    "command.fishing.reel",
    async ({ id, channel, command, args, prefix, part, user, isDM }) => {
        const fishing = getFishing(id, part.id);
        if (fishing) {
            stopFishing(id, part.id, channel, isDM);
            return `Our friend ${part.name} reel his/her lure back inside, temporarily decreasing his/her chances of catching a fish by 100%.`;
        } else {
            return `Friend ${part.name}: You haven't ${prefix}casted it.`;
        }
    }
);
