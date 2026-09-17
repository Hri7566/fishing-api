import type { Command } from "../Command";
import { fish } from "./fishing/fish";
import { help } from "./general/help";
import { setcolor } from "./util/setcolor";
import { data } from "./util/data";
import { location } from "./regional/location";
import { go } from "./regional/go";
import { nearby } from "./regional/nearby";
import { look } from "./regional/look";
import { take } from "./items/take";
import { inventory } from "./items/inventory";
import { eat } from "./items/eat";
import { sack } from "./items/sack";
import { reel } from "./fishing/reel";
import { memory } from "./util/mem";
import { listpokemon } from "./pokemon/listpokemon";
import { color } from "./general/color";
import { autofish } from "./util/autofish";
import { pokedex } from "./pokemon/pokedex";
import { myid } from "./general/myid";
import { yeet } from "./items/yeet";
import { tree } from "./tree/tree";
import { pick } from "./tree/pick";
import { fid } from "./util/fid";
import { chance } from "./util/chance";
import { info } from "./general/info";
import { burger } from "./util/burger";
import { daily } from "./pokemon/daily";
import { give } from "./items/give";
import { time } from "./tree/time";

interface ICommandGroup {
    id: string;
    displayName: string;
    commands: Command[];
}

export const commandGroups: ICommandGroup[] = [];

const generalGroup: ICommandGroup = {
    id: "general",
    displayName: "💬 General",
    commands: [help, color, myid, info]
};

commandGroups.push(generalGroup);

const fishingGroup: ICommandGroup = {
    id: "fishing",
    displayName: "🐟 Fishing",
    commands: [fish, reel]
};

commandGroups.push(fishingGroup);

const itemsGroup: ICommandGroup = {
    id: "items",
    displayName: "💎 Items",
    commands: [inventory, sack, listpokemon, take, eat, yeet, burger, give]
};

commandGroups.push(itemsGroup);

const regionalGroup: ICommandGroup = {
    id: "regional",
    displayName: "🗺️ Regional",
    commands: [location, go, look, nearby]
};

commandGroups.push(regionalGroup);

const treeGroup: ICommandGroup = {
    id: "tree",
    displayName: "🌴 Tree",
    commands: [tree, pick, time]
};

commandGroups.push(treeGroup);

const pokemonGroup: ICommandGroup = {
    id: "pokemon",
    displayName: "🐖 Pokémon",
    commands: [daily, listpokemon, pokedex]
};

commandGroups.push(pokemonGroup);

const utilGroup: ICommandGroup = {
    id: "util",
    displayName: "⚙️ Utility",
    commands: [data, setcolor, memory, autofish, fid, chance]
};

commandGroups.push(utilGroup);
