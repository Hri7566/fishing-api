import { loadConfig } from "@util/config";
import { MPPNetBot, type MPPNetBotConfig } from "./Bot";

const bots: MPPNetBot[] = [];

const defaults = loadConfig<MPPNetBotConfig[]>("config/mpp_bots.yml", [
    {
        uri: "wss://mppclone.com:8443",
        channel: {
            id: "✧𝓓𝓔𝓥 𝓡𝓸𝓸𝓶✧",
            allowColorChanging: true
        }
    }
]);

export function connectDefaultBots() {
    for (const conf of defaults) {
        initBot(conf);
    }
}

export function initBot(conf: MPPNetBotConfig) {
    const bot = new MPPNetBot(conf);
    bot.start();
    bots.push(bot);
}

export { MPPNetBot as Bot };
export default MPPNetBot;
