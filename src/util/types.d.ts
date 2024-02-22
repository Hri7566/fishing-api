interface IPart {
    id: string;
    name: string;
    color: string;
}

interface ICommandResponse {
    response: string;
}

type TCommandCallback<User> = (props: {
    id: string;
    command: string;
    args: string[];
    prefix: string;
    part: IPart;
    user: User;
}) => Promise<string | void>;

interface CountComponent {
    count: number;
}

interface IFish extends JsonValue {
    id: string;
    name: string;
    size: string;
}

interface IPokemon extends JsonValue {
    id: number;
    name: {
        english: string;
        japanese: string;
        chinese: string;
        french: string;
    };
    type: string[];
    base: {
        HP: number;
        Attack: number;
        Defense: number;
        "Sp. Attack": number;
        "Sp. Defense": number;
        Speed: number;
    };
}

type TFishSack = JsonArray & IFish[];
type TPokemonSack = JsonArray & IPokemon[];

interface IInventory {
    id: number;
    balance: number;
    fishSack: TFishSack;
    pokemon: TPokemonSack;
}

interface IBack<T extends string | unknown> extends Record<string, unknown> {
    m: T;
}

interface Backs extends Record<string, IBack<unknown>> {
    color: {
        m: "color";
    };
}
