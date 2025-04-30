export type ReadlineCommandCallback = (
    line: string
) => Promise<string | undefined>;

export class ReadlineCommand {
    constructor(
        public id: string,
        public aliases: string[],
        public description: string,
        public usage: string,
        public callback: ReadlineCommandCallback
    ) {}
}
