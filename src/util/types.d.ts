interface IUser {
    id: string;
    name: string;
    color: string;
}

interface ICommandResponse {
    response: string;
}

type TCommandCallback = (
    command: string,
    args: string[],
    prefix: string,
    user: IUser
) => Promise<string | void>;
