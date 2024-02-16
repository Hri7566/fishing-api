import { getHHMMSS } from "./time";
import type { ReadLine } from "readline";

export class Logger {
    private static log(...args: any[]) {
        const time = getHHMMSS();

        if (typeof (globalThis as unknown as any).rl !== "undefined") {
            process.stdout.write("\x1b[2K\r");
        }

        console.log(`\x1b[30m${time}\x1b[0m`, ...args);

        if (typeof (globalThis as unknown as any).rl !== "undefined") {
            try {
                ((globalThis as unknown as any).rl as ReadLine).prompt();
            } catch (err) {}
        }
    }

    constructor(public id: string) {}

    public info(...args: any[]) {
        Logger.log(
            `\x1b[34m[${this.id}]\x1b[0m`,
            `\x1b[34m[INFO]\x1b[0m`,
            ...args
        );
    }

    public error(...args: any[]) {
        Logger.log(
            `\x1b[34m[${this.id}]\x1b[0m`,
            `\x1b[31m[ERROR]\x1b[0m`,
            ...args
        );
    }

    public warn(...args: any[]) {
        Logger.log(
            `\x1b[34m[${this.id}]\x1b[0m`,
            `\x1b[33m[WARNING]\x1b[0m`,
            ...args
        );
    }

    public debug(...args: any[]) {
        Logger.log(
            `\x1b[34m[${this.id}]\x1b[0m`,
            `\x1b[32m[DEBUG]\x1b[0m`,
            ...args
        );
    }
}
