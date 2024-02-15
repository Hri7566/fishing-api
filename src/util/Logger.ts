import { getHHMMSS } from "./time";

export class Logger {
    private static log(...args: any[]) {
        const time = getHHMMSS();

        console.log(`\x1b[30m${time}\x1b[0m`, ...args);
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
