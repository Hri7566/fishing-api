import Command from "@server/commands/Command";
import { getFishing, startFishing } from "@server/fish/fishers";
import { reel } from "../fishing/reel";

export const autofish = new Command(
    "autofish",
    ["autofish", "ootofosh"],
    "Fish automatically",
    "data",
    "command.util.autofish",
    async props => {
        const fishing = getFishing(props.id, props.part.id);

        if (!fishing) {
            startFishing(props.id, props.part.id, true, true);
            return `Our friend ${props.user.name} casts LURE into a water with AUTOFISH enabled. (${props.prefix}${reel.aliases[0]} to disable)`;
        } else {
            return `Your lure is already in the water (since ${(
                (Date.now() - fishing.t) /
                1000 /
                60
            ).toFixed(2)} minutes ago).${
                fishing.autofish
                    ? ` (AUTOFISH is enabled)`
                    : ` (${props.prefix}${reel.aliases[0]} in first to AUTOFISH)`
            }`;
        }
    }
);
