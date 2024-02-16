import { ReadlineCommand } from "../ReadlineCommand";

export const stop = new ReadlineCommand(
    "stop",
    ["stop", "exit"],
    "Stop server",
    "stop",
    async line => {
        process.exit();
    }
);
