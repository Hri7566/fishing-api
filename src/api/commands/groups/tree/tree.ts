import Command from "@server/commands/Command";
import { getFruitCount } from "@server/fish/tree";

export const tree = new Command(
    "tree",
    ["tree", "troo", "truu", "traa"],
    "Check how many fruit are on the Kekklefruit Tree.",
    "tree",
    "command.tree.tree",
    async ({ id, command, args, prefix, part, user, isDM }) => {
        const num = await getFruitCount();

        return `Friend ${part.name}: ${num}`;
    }
);
