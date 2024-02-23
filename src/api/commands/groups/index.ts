import type { Command } from "../Command";
import { fish } from "./fishing/fish";
import { help } from "./general/help";
import { setcolor } from "./util/setcolor";
import { data } from "./util/data";
import { location } from "./fishing/location";
import { go } from "./fishing/go";
import { nearby } from "./fishing/nearby";
import { look } from "./fishing/look";
import { take } from "./inventory/take";
import { inventory } from "./inventory/inventory";
import { eat } from "./inventory/eat";
import { sack } from "./inventory/sack";
import { reel } from "./fishing/reel";
import { memory } from "./util/mem";

interface ICommandGroup {
    id: string;
    displayName: string;
    commands: Command[];
}

export const commandGroups: ICommandGroup[] = [];

const generalGroup: ICommandGroup = {
    id: "general",
    displayName: "General",
    commands: [help]
};

commandGroups.push(generalGroup);

const fishingGroup: ICommandGroup = {
    id: "fishing",
    displayName: "Fishing",
    commands: [fish, reel, location, go, nearby, look]
};

commandGroups.push(fishingGroup);

const inventoryGroup: ICommandGroup = {
    id: "inventory",
    displayName: "Inventory",
    commands: [inventory, take, eat, sack]
};

commandGroups.push(inventoryGroup);

const utilGroup: ICommandGroup = {
    id: "util",
    displayName: "Utility",
    commands: [data, setcolor, memory]
};

commandGroups.push(utilGroup);
