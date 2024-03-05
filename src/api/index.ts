import "./api/server";
import "./cli/readline";
import { startFisherTick } from "./fish/fishers";
import { startObjectTimers } from "./fish/locations";
import { initTree } from "./fish/tree";

startObjectTimers();
await startFisherTick();
await initTree();
