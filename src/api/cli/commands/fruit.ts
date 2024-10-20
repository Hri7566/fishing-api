import { getAllTokens } from "@server/data/token";
import { ReadlineCommand } from "../ReadlineCommand";
import { getFruitCount, growFruit } from "@server/fish/tree";

export const fruit = new ReadlineCommand(
    "fruit",
    ["fruit", "kekklefruit", "tree"],
    "Show the amount of kekklefruit on the tree",
    "fruit",
    async line => {
        const fruit = await getFruitCount();

        return `The tree has ${fruit} kekklefruit.`;
    }
);
