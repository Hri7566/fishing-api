import { addEvent } from "@server/events";
import { ReadlineCommand } from "../ReadlineCommand";
import { readlineCommands } from "../commands";

export const say = new ReadlineCommand(
    "say",
    ["say"],
    "Send a message in chat",
    "say [stuff]",
    async line => {
        const args = line.split(" ");

        if (!args[1]) {
            return "Usage: say [stuff]";
        }

        const argcat = args.slice(1).join();
        addEvent<string>("sendchat", {
            m: "sendchat",
            message: argcat
        });

        return `Message sent: ${argcat}`
    }
);

