import type { Command } from "../Command";
import { fish } from "./fishing/fish";
import { help } from "./general/help";
import { setcolor } from "./util/setcolor";
import { data } from "./util/data";
import { location } from "./fishing/location";

interface ICommandGroup {
    id: string;
    displayName: string;
    commands: Command[];
}

export const commandGroups: ICommandGroup[] = [];

const general: ICommandGroup = {
    id: "general",
    displayName: "General",
    commands: [help]
};

commandGroups.push(general);

const fishing: ICommandGroup = {
    id: "fishing",
    displayName: "Fishing",
    commands: [fish, location]
};

commandGroups.push(fishing);

const util: ICommandGroup = {
    id: "util",
    displayName: "Utility",
    commands: [data, setcolor]
};

commandGroups.push(util);
