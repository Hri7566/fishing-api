import { createToken } from "@server/data/token";
import { ReadlineCommand } from "../ReadlineCommand";

export const gentoken = new ReadlineCommand(
    "gentoken",
    ["gentoken"],
    "Generate a new API token",
    "gentoken",
    async line => {
        const token = await createToken();
        return `New token: ${token}`;
    }
);
