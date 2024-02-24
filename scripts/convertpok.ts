import { Logger } from "@util/Logger";
import { argv } from "bun";
import { existsSync, readFileSync, writeFileSync } from "fs";
import YAML from "yaml";

const logger = new Logger("Pokémon Converter");

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

logger.info("Reading YAML...");

let data: any;

try {
    const jdata = readFileSync(inFile).toString();
    data = YAML.parse(jdata);

    for (let i = 0; i < data.length; i++) {
        // data[i].name = data[i].name.english;
        data[i].pokeID = data[i].id;
        data[i].id = data[i].name.toLowerCase();
    }
} catch (err) {
    logger.error(err);
    logger.error("YAML read error");
    process.exit();
}

logger.info("Writing file...");
writeFileSync(outFile, YAML.stringify(data));
logger.info("Done.");
