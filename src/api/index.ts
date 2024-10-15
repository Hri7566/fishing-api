import { startAutorestart } from "@util/autorestart";
import { startFisherTick } from "./fish/fishers";
import { startObjectTimers } from "./fish/locations";
import { initTree } from "./fish/tree";
import { registerBehaviors } from "./behavior/register";
// import { loadDefaultBehaviors } from "./items/behavior/defaults";

startObjectTimers();
await startFisherTick();
await initTree();
// loadDefaultBehaviors();
registerBehaviors();

require("./api/server");
require("./cli/readline");

startAutorestart();
