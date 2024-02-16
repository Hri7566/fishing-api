export class Command {
    constructor(
        public id: string,
        public aliases: string[],
        public description: string,
        public usage: string,
        public permissionNode: string,
        public callback: TCommandCallback,
        public visible: boolean = true
    ) {}
}

export default Command;
