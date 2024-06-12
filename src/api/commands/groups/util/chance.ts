import { addBack } from "@server/backs";
import Command from "@server/commands/Command";
import { getFishingChance } from "@server/fish/fishers";

export const chance = new Command(
    "chance",
    ["chance"],
    "Set own user color",
    "chance",
    "command.util.chance",
    async ({ id, command, args, prefix, part, user }) => {
        const chance = await getFishingChance(user.id);
        return `Fishing chance: ${chance.chance} | Timestamp: ${chance.t}`;
    },
    false
);
