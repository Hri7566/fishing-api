import { getAllTokens } from "@server/data/token";
import { ReadlineCommand } from "../ReadlineCommand";
import { growFruit } from "@server/fish/tree";

export const grow_fruit = new ReadlineCommand(
    "grow_fruit",
    ["grow_fruit", "grow", "grow_kekklefruit"],
    "Grow kekklefruit on the tree",
    "grow_fruit <number>",
    async line => {
        try {
            const args = line.split(" ");
            const num = Number.parseInt(args[1], 10);
            await growFruit(num);
            return `grew ${num} kekklefruit`;
        } catch (err) {
            return "bad";
        }
    }
);
