import { loadConfig } from "../../util/config";
import { TalkomaticBot, type TalkomaticBotConfig } from "./TalkomaticBot";

const bots: TalkomaticBot[] = [];

const defaults = loadConfig("config/talkomatic_bots.yml", [
    {
        channel: {
            id: "116955"
        }
    }
] as TalkomaticBotConfig[]);

export function connectDefaultBots() {
    defaults.forEach(conf => {
        initBot(conf);
    });
}

export function initBot(conf: TalkomaticBotConfig) {
    const bot = new TalkomaticBot(conf);
    bot.start();
    bots.push(bot);
}

export { TalkomaticBot as Bot };
export default TalkomaticBot;
