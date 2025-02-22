import { Logger } from "@util/Logger";
import { createInterface } from "readline";
import { EventEmitter } from "node:events";
import gettRPC from "@util/api/trpc";
import { startAutorestart } from "@util/autorestart";
import { CosmicColor } from "@util/CosmicColor";

const trpc = gettRPC(process.env.CLI_FISHING_TOKEN as string);

// no typedefs :/
const cliMd = require("cli-markdown").default;

const logger = new Logger("CLI");
const b = new EventEmitter();

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
} as any);

const user = {
    _id: "stdin",
    name: "CLI",
    color: "#abe3d6"
};

(globalThis as unknown as any).rl = rl;
rl.setPrompt("> ");
rl.prompt();
await setPrompt();

async function setPrompt() {
    let color = await trpc.getUserColor.query({ userId: user._id });
    const c = new CosmicColor(user.color);
    rl.setPrompt(`\x1b[38;2;${c.r};${c.g};${c.b}m> `);
}

rl.on("line", async line => {
    if (line == "stop" || line == "exit") process.exit();
    rl.prompt();

    const msg = {
        a: line,
        p: user
    };

    let prefixes: string[];

    try {
        prefixes = await trpc.prefixes.query();
    } catch (err) {
        logger.error(err);
        logger.warn("Unable to contact server");
        return;
    }

    let usedPrefix: string | undefined = prefixes.find(pr =>
        msg.a.startsWith(pr)
    );

    if (!usedPrefix) return;

    const args = msg.a.split(" ");

    const command = await trpc.command.query({
        channel: logger.id,
        args: args.slice(1, args.length),
        command: args[0].substring(usedPrefix.length),
        prefix: usedPrefix,
        user: {
            id: msg.p._id,
            name: msg.p.name,
            color: msg.p.color
        }
    });

    if (!command) return;
    if (command.response) {
        logger.info(cliMd(command.response.split("\n").join("\n\n")));
    }
});

setInterval(async () => {
    try {
        const backs = (await trpc.backs.query()) as IBack<unknown>[];
        if (backs.length > 0) {
            // this.logger.debug(backs);
            for (const back of backs) {
                if (typeof back.m !== "string") return;
                if (typeof back.channel === "string") {
                    if (back.channel !== logger.id) return;
                }

                b.emit(back.m, back);
            }
        }
    } catch (err) {
        return;
    }
}, 1000 / 20);

b.on("color", async msg => {
    if (typeof msg.color !== "string" || typeof msg.id !== "string") return;

    user.color = msg.color;

    trpc.saveColor.query({
        userId: user._id,
        color: msg.color
    });

    await setPrompt();
});

b.on("sendchat", msg => {
    logger.info(cliMd(msg.message));
});

startAutorestart();
