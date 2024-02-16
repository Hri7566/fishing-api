import { deleteToken } from "@server/data/token";
import { ReadlineCommand } from "../ReadlineCommand";

export const deltoken = new ReadlineCommand(
    "deltoken",
    ["deltoken"],
    "Delete an API token",
    "deltoken <token>",
    async line => {
        const args = line.split(" ");
        if (!args[1]) return "Please provide a token";

        const argcat = args.slice(1).join(" ");
        await deleteToken(argcat);

        return "Token deleted";
    }
);
