import Command from "@server/commands/Command";
import { getFishing, startFishing } from "@server/fish/fishers";

export const fish = new Command(
    "fish",
    ["fish", "fosh", "cast", "startfishing"],
    "Send your LURE into a water for catching fish",
    "fish",
    "command.fishing.fish",
    async ({ id, channel, command, args, prefix, part, user, isDM }) => {
        const fishing = getFishing(id, part.id);

        if (!fishing) {
            startFishing(id, part.id, channel, isDM);
            return `Our friend ${part.name} casts LURE into a water for catching fish.`;
        } else {
            return `Your lure is already in the water (since ${(
                (Date.now() - fishing.t) /
                1000 /
                60
            ).toFixed(2)} minutes ago).${
                fishing.autofish
                    ? ` (AUTOFISH has been enabled for ${(
                          (Date.now() - fishing.autofish_t) /
                          1000 /
                          60
                      ).toFixed(2)} minutes)`
                    : ``
            }`;
        }
    }
);
