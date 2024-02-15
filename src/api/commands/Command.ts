export class Command {
    constructor(
        public id: string,
        public aliases: string[],
        public description: string,
        public usage: string,
        public permissionNode: string,
        public callback: TCommandCallback
    ) {}
}

export default Command;
