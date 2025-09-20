import { loadConfig } from "@util/config";
import { MPPNetBot, type MPPNetBotConfig } from "./Bot";

const bots: MPPNetBot[] = [];

const defaults = loadConfig<MPPNetBotConfig[]>("config/mpp_bots.yml", [
    {
        uri: "wss://mppclone.com:8443",
        useOldMessages: false,
        channel: {
            id: "test/fishing",
            allowColorChanging: true,
            chatFormatting: "new"
        },
        envToken: "MPPNET_TOKEN"
    },
    {
        uri: "wss://www.multiplayerpiano.dev:443",
        useOldMessages: false,
        channel: {
            id: "test/fishing",
            allowColorChanging: true,
            chatFormatting: "old",
            allowNotifications: true
        },
        envToken: "MPPDEV_TOKEN"
    }
]);

export function connectDefaultBots() {
    for (const conf of defaults) {
        initBot(conf);
    }
}

export function initBot(conf: MPPNetBotConfig) {
    const bot = new MPPNetBot(conf);

    // connect later, worry about the next one
    (async () => {
        bots.push(bot);
        bot.start();
    })();
}

export { MPPNetBot as Bot };
export default MPPNetBot;
