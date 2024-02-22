import { randomFish } from "@server/fish/fish";
import { Logger } from "@util/Logger";
import { argv } from "bun";

const logger = new Logger("Numfish");

const location = argv[2];

if (typeof location !== "string") {
    logger.error(`Usage: <location>`);
    process.exit();
}

const fish = randomFish(location);
logger.info(fish);
