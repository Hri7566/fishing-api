import "./api/server";
import "./cli/readline";
import { startFisherTick } from "./fish/fishers";
import { startObjectTimers } from "./fish/locations";

startObjectTimers();
await startFisherTick();
