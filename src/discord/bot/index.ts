import { DiscordBot, type DiscordBotConfig } from "./Bot";

export async function initBot(conf: DiscordBotConfig) {
    const bot = new DiscordBot(conf);
    await bot.start();
}

export { DiscordBot as Bot };

export default DiscordBot;
