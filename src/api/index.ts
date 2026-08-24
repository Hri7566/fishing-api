import { startAutorestart } from "@util/autorestart";
import { startFisherTick } from "./fish/fishers";
import { startObjectTimers } from "./fish/locations";
import { initTree } from "./fish/tree";
import { registerBehaviors } from "./behavior/register";
import { startServer } from "./api/server";
import { setupReadline } from "./cli/readline";
// import { loadDefaultBehaviors } from "./items/behavior/defaults";

startObjectTimers();
await startFisherTick();
await initTree();
// loadDefaultBehaviors();
registerBehaviors();

startServer();
setupReadline();

startAutorestart();
