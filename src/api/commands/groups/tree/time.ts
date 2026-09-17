import Command from "@server/commands/Command";
import { getFruitCount } from "@server/fish/tree";

export const time = new Command(
    "time",
    ["time", "timi", "tomo", "tumu", "tama", "teme"],
    "Get the current time.",
    "time",
    "command.tree.time",
    async ({ id, command, args, prefix, part, user, isDM }) => {
        const num = await getFruitCount();

        return `Friend ${part.name}: ${num}`;
    }
);
