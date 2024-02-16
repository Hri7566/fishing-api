import { getAllTokens } from "@server/data/token";
import { ReadlineCommand } from "../ReadlineCommand";

export const lstoken = new ReadlineCommand(
    "lstoken",
    ["lstoken"],
    "List all API tokens",
    "lstoken",
    async line => {
        const tokens = await getAllTokens();
        if (tokens.length > 0) {
            return `Tokens:\n\t- ${tokens.map(t => t.token).join("\n\t- ")}`;
        } else {
            return "No tokens";
        }
    }
);
