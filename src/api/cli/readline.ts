import { createInterface, type ReadLine } from "node:readline";
import { handleReadlineCommand } from "./handler";
import { Logger } from "@util/Logger";

export const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

export const logger = new Logger("Readline");

rl.on("line", async data => {
    const out = await handleReadlineCommand(data);
    if (typeof out !== "undefined") logger.info(out);
});

rl.prompt();

(globalThis as unknown as { rl: ReadLine }).rl = rl;
