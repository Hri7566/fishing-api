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
import { pokemon } from "./inventory/pokemon";
import { color } from "./general/color";
import { autofish } from "./util/autofish";
import { pokedex } from "./util/pokedex";
import { myid } from "./general/myid";
import { yeet } from "./inventory/yeet";
import { tree } from "./fishing/tree";
import { pick } from "./fishing/pick";
import { fid } from "./util/fid";
import { chance } from "./util/chance";
import { info } from "./general/info";
import { burger } from "./util/burger";
import { daily } from "./pokemon/daily";
import { give } from "./inventory/give";

interface ICommandGroup {
    id: string;
    displayName: string;
    commands: Command[];
}

export const commandGroups: ICommandGroup[] = [];

const generalGroup: ICommandGroup = {
    id: "general",
    displayName: "General",
    commands: [help, color, myid, info]
};

commandGroups.push(generalGroup);

const fishingGroup: ICommandGroup = {
    id: "fishing",
    displayName: "Fishing",
    commands: [fish, reel, location, go, nearby, look, tree, pick]
};

commandGroups.push(fishingGroup);

const inventoryGroup: ICommandGroup = {
    id: "inventory",
    displayName: "Inventory",
    commands: [inventory, sack, pokemon, take, eat, yeet, burger, give]
};

commandGroups.push(inventoryGroup);

const pokemonGroup: ICommandGroup = {
    id: "pokemon",
    displayName: "Pokémon",
    commands: [daily, pokedex]
};

commandGroups.push(pokemonGroup);

const utilGroup: ICommandGroup = {
    id: "util",
    displayName: "Utility",
    commands: [data, setcolor, memory, autofish, fid, chance]
};

commandGroups.push(utilGroup);
