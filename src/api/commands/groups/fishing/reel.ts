import Command from "@server/commands/Command";
import { getFishing, stopFishing } from "@server/fish/fishers";

const aliases = ["reel", "rool", "stopfishing", "stopfoshong"];

export const reel = new Command(
    "reel",
    aliases,
    "Reel in and stop fishing",
    "reel",
    "command.fishing.reel",
    async ({ id, channel, command, args, prefix, part, user, isDM }) => {
        const fishing = getFishing(id, part.id);

        if (fishing) {
            stopFishing(
                id,
                part.id,
                channel,
                fishing.autofish,
                fishing.autofish_t
            );
            return `Our friend ${part.name} ${aliases[0]} his/her lure back inside, temporarily decreasing his/her chances of catching a fish by 100%.`;
        }

        return `Friend ${part.name}: You haven't ${prefix}casted it.`;
    }
);
