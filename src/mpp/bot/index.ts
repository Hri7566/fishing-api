import { loadConfig } from "@util/config";
import { MPPNetBot, type MPPNetBotConfig } from "./Bot";
import { Logger } from "@util/Logger";

const logger = new Logger("big brain");

const bots: MPPNetBot[] = [];

const defaults = loadConfig("config/mpp_bots.yml", [
    {
        uri: "wss://mppclone.com:8443",
        channel: {
            id: "✧𝓓𝓔𝓥 𝓡𝓸𝓸𝓶✧",
            allowColorChanging: true
        }
    }
] as MPPNetBotConfig[]);

export function connectDefaultBots() {
    defaults.forEach(conf => {
        initBot(conf);
    });
}

export function initBot(conf: MPPNetBotConfig) {
    const bot = new MPPNetBot(conf);
    bot.start();
    bots.push(bot);
}

export { MPPNetBot as Bot };
export default MPPNetBot;
