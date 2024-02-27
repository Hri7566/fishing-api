import { Logger } from "@util/Logger";
import { loadConfig } from "@util/config";

export const fish = loadConfig<IFish[]>("config/fish.yml", []);

for (let i = 0; i < fish.length; i++) {
    fish[i].objtype = "fish";
}

const logger = new Logger("Fishies");

export function randomFish(location: string, r: number = Math.random()) {
    let rarity = 0;

    // logger.debug("R:", r);

    if (r < 0.1) {
        rarity = 2;
    } else if (r < 0.6) {
        rarity = 1;
    } else if (r < 1) {
        rarity = 0;
    }

    let animal: IFish | undefined;

    let matchesLocation = false;
    let matchesRarity = false;
    let matchesMonth = false;
    let matchesTime = false;

    let maxRecursion = 1000;
    let i = 0;

    while (
        !matchesLocation ||
        !matchesRarity ||
        !matchesMonth ||
        !matchesTime
    ) {
        if (i >= maxRecursion) {
            break;
        }

        animal = fish[Math.floor(Math.random() * fish.length)];

        matchesLocation = animal.location == location;
        matchesRarity = animal.rarity == rarity;

        matchesMonth =
            typeof animal.activeMonths !== "undefined"
                ? hasFishMonths(animal.activeMonths)
                : true;

        matchesTime =
            typeof animal.startHour !== "undefined" &&
            typeof animal.endHour !== "undefined"
                ? hasFishTime(animal.startHour, animal.endHour)
                : true;

        // logger.debug("Matches location:", matchesLocation);
        // logger.debug("Matches rarity:", matchesRarity);
        // logger.debug("Matches month:", matchesMonth);
        // logger.debug("Matches time:", matchesTime);

        i++;
    }

    return animal as IFish;
}

export function hasFishMonths(activeMonths: string, t: number = Date.now()) {
    const d = new Date(t);
    const month = d.getMonth();
    const bin = 0x800 >> month;
    const active = parseInt(activeMonths.substring(2), 2);

    // logger.debug("Current month: ", bin.toString(2).padStart(12, "0"));
    // logger.debug("Active:        ", active.toString(2).padStart(12, "0"));
    // logger.debug(
    //     "Bitwise:       ",
    //     (bin & active).toString(2).padStart(12, "0")
    // );

    return !!(bin & active);
}

export function hasFishTime(
    startHour: number,
    endHour: number,
    t: number = Date.now()
) {
    const d = new Date(t);
    const hour = d.getHours();

    if (startHour < endHour) {
        if (hour > startHour && hour < endHour) {
            return true;
        }
    } else {
        if (hour > startHour || hour < startHour) {
            return true;
        }
    }

    return false;
}

export function getSizeString(cm: number) {
    const size =
        cm < 30
            ? "small"
            : cm < 60
            ? "medium-sized"
            : cm < 75
            ? "large"
            : cm < 100
            ? "huge"
            : cm < 200
            ? "massive"
            : cm < 300
            ? "gigantic"
            : cm < 600
            ? "humongous"
            : "supermassive";

    return size;
}
