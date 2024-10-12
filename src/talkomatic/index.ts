import { startAutorestart } from "@util/autorestart";
import { connectDefaultBots } from "./bot/index";

connectDefaultBots();
startAutorestart();
