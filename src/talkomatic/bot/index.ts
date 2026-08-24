import { loadConfig } from "@util/config";
import { TalkomaticBot, type TalkomaticBotConfig, type TalkomaticClassicToken } from "./TalkomaticBot";
import { readFile } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { Logger } from "@util/Logger";
import { getName, getVersion } from "@util/package";
import { getBranch } from "@util/git";
import { existsSync } from "node:fs";

const logger = new Logger("Talkomatic Classic Authenticator");

export const bots: TalkomaticBot[] = [];

export let authFile = "./.talko.json";
export let auth: TalkomaticClassicToken = {
    token: "",
    expires: Date.now()
}

const defaults = loadConfig("config/talkomatic_bots.yml", [
    {
        channel: {
            name: "test/fishing",
            maxSize: 20,
            type: "public",
            allowBots: true
        }
    }
] as TalkomaticBotConfig[]);

/**
 * check if auth tokens are still valid
 * (docs state 30 day expiry but it's probably not exact)
 **/
export async function checkToken() {
    const now = Date.now();

    if (auth.expires <= now) {
        logger.warn("Token expired:", new Date(auth.expires).toLocaleString() + " (expired) //", new Date(now).toLocaleString() + " (now)");
        const data = await fetchNewToken();
        auth.token = data.token;
        auth.expires = Number(new Date(data.expiresAt));
        await saveToken();
    } else {
        logger.info("Token validated");
    }
}

/**
 * fetch new token from talko classic api
 **/
export async function fetchNewToken() {
    logger.info("Fetching new token...")
    const res = await fetch("https://classic.talkomatic.co/api/v1/bot-tokens/request", {
        headers: {
            "User-Agent": `${getName()}/${getVersion()}-${await getBranch()}`
        }
    });
    const data = await res.json();

    /*
    if (
        typeof data.token !== "string" ||
        typeof data.expiresIn !== "number" ||
        typeof data.expiresAt !== "string" ||
        typeof data.usage !== "object" ||
        typeof data.usage.rateLimit !== "string" ||
        typeof data.usage.headers !== "string"
    ) throw new Error("Invalid token data:", data);
    */

    logger.info("Fetch complete");
    return data as {
        token: string;
        expiresIn: number;
        expiresAt: string;
        usage: {
            rateLimit: string;
            headers: string;
        }
    }
}

export async function saveToken() {
    logger.info("Saving auth data...");
    const json = JSON.stringify(auth);
    await writeFile(authFile, json);
}

export async function loadToken() {
    if (!existsSync(authFile)) {
        logger.info("No auth file found");
        return await saveToken();
    }

    logger.info("Loading cached auth data...");
    const data = await readFile(authFile);

    const json = data.toString();
    auth = JSON.parse(json) as TalkomaticClassicToken;
}

export async function connectDefaultBots() {
    // auth check routine
    try {
        // load file and check timestamp
        await loadToken()
        await checkToken();
    } catch (err) {
        logger.error("Unable to load auth data:", err);
        setTimeout(() => {
            logger.error("Exiting in 5 seconds...")
            process.exit(-1);
        });
    }

    logger.info("Auth check complete, initializing...");

    for (const conf of defaults) {
        initBot(conf);
    }
}

export function initBot(conf: TalkomaticBotConfig) {
    const bot = new TalkomaticBot(conf, auth);
    bot.start();
    bots.push(bot);
}

export { TalkomaticBot as Bot };
export default TalkomaticBot;
