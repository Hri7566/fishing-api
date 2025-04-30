import { getHHMMSS } from "./time";
import type { ReadLine } from "node:readline";

export class Logger {
    private static log(...args: unknown[]) {
        const time = getHHMMSS();

        if (
            typeof (globalThis as unknown as { rl: ReadLine }).rl !==
            "undefined"
        ) {
            process.stdout.write("\x1b[2K\r");
        }

        console.log(`\x1b[37m${time}\x1b[0m`, ...args);

        if (
            typeof (globalThis as unknown as { rl: ReadLine }).rl !==
            "undefined"
        ) {
            try {
                (globalThis as unknown as { rl: ReadLine }).rl.prompt();
            } catch (err) {}
        }
    }

    constructor(public id: string) {}

    public info(...args: unknown[]) {
        Logger.log(
            `\x1b[34m[${this.id}]\x1b[0m`,
            "\x1b[34m[INFO]\x1b[0m",
            ...args
        );
    }

    public error(...args: unknown[]) {
        Logger.log(
            `\x1b[34m[${this.id}]\x1b[0m`,
            "\x1b[31m[ERROR]\x1b[0m",
            ...args
        );
    }

    public warn(...args: unknown[]) {
        Logger.log(
            `\x1b[34m[${this.id}]\x1b[0m`,
            "\x1b[33m[WARNING]\x1b[0m",
            ...args
        );
    }

    public debug(...args: unknown[]) {
        Logger.log(
            `\x1b[34m[${this.id}]\x1b[0m`,
            "\x1b[32m[DEBUG]\x1b[0m",
            ...args
        );
    }
}
