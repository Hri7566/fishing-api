import { Logger } from "@util/Logger";
import { argv } from "bun";
import { existsSync, readFileSync, writeFileSync } from "fs";
import YAML from "yaml";

const logger = new Logger("JSON Converter");

const inFile = argv[2];
const outFile = argv[3];

if (typeof inFile !== "string" || typeof outFile !== "string") {
    logger.error(`Usage: <infile> <outfile>`);
    process.exit();
}

if (!existsSync(inFile)) {
    logger.error("Input file not found");
    process.exit();
}

logger.info("Reading JSON...");

let data: unknown;

try {
    const jdata = readFileSync(inFile).toString();
    data = JSON.parse(jdata);
} catch (err) {
    logger.error(err);
    logger.error("JSON read error");
    process.exit();
}

logger.info("Writing file...");
writeFileSync(outFile, YAML.stringify(data));
logger.info("Done.");
