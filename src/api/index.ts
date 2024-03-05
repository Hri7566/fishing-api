import "./api/server";
import "./cli/readline";
import { startFisherTick } from "./fish/fishers";
import { startObjectTimers } from "./fish/locations";
import { initTree } from "./fish/tree";
import { loadDefaultBehaviors } from "./items/behavior/defaults";

startObjectTimers();
await startFisherTick();
await initTree();
loadDefaultBehaviors();
