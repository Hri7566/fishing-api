import { loadConfig } from "@util/config";
import { initBot } from "./bot";
import type { DiscordBotConfig } from "./bot/Bot";

const config = loadConfig<DiscordBotConfig>("config/discord.yml", {
    serverID: "841331769051578413",
    defaultChannelID: "841331769658703954"
});

await initBot(config);
