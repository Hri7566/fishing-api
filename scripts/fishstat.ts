import { Logger } from "@util/Logger";
import { argv } from "bun";
import { existsSync, readFileSync, writeFileSync } from "fs";
import YAML from "yaml";

const logger = new Logger("Fishstat");

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
    const numFish = data.length;
    logger.info("Number of fish:", numFish);

    let rarities = data.map(fish => fish.rarity);
    let raritySum = rarities.reduce((b, a) => a + b);

    let rarityCounts: Record<number, number> = {};

    for (const fish of data) {
        if (!rarityCounts[fish.rarity]) rarityCounts[fish.rarity] = 0;
        rarityCounts[fish.rarity]++;
    }

    let mostCommonRarity = 0;
    let mostCommonRaritySum = 0;

    for (const rarity of rarities) {
        if (rarityCounts[rarity] > mostCommonRaritySum) {
            mostCommonRaritySum = rarityCounts[rarity];
            mostCommonRarity = rarity;
        }
    }

    logger.info("Average rarity:", raritySum / numFish);
    logger.info(
        "Most common rarity:",
        mostCommonRarity,
        `(${mostCommonRaritySum} counted)`
    );
} catch (err) {
    logger.error(err);
    logger.error("YAML read error");
    process.exit();
}
