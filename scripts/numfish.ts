import { Logger } from "@util/Logger";
import { argv } from "bun";
import { existsSync, readFileSync, writeFileSync } from "fs";
import YAML from "yaml";

const logger = new Logger("Numfish");

const inFile = argv[2];

if (typeof inFile !== "string") {
    logger.error(`Usage: <infile>`);
    process.exit();
}

if (!existsSync(inFile)) {
    logger.error("Input file not found");
    process.exit();
}

logger.info("Reading YAML...");

let data: IFish[];

try {
    const ydata = readFileSync(inFile).toString();
    data = YAML.parse(ydata);
    logger.info("Number of fish:", data.length);
} catch (err) {
    logger.error(err);
    logger.error("YAML read error");
    process.exit();
}
