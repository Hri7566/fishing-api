import { startAutorestart } from "@util/autorestart";
import { connectDefaultBots } from "./bot";

connectDefaultBots();

startAutorestart();
