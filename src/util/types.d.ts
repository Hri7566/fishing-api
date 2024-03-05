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
    isDM: boolean;
}) => Promise<string | void>;

interface CountComponent {
    count: number;
}

interface IObject extends JsonValue {
    id: string;
    objtype: string;
    name: string;
    emoji?: string;
    count?: number;
}

interface IItem extends IObject {
    objtype: "item";
}

interface IFish extends IObject {
    id: string;
    objtype: "fish";
    name: string;
    size: number;
    rarity: number;
    location: string;

    onlyRain?: true;
    startHour?: number;
    endHour?: number;
    activeMonths?: string;

    emoji?: string;
}

interface IPokemon extends IObject {
    id: number;
    pokeID: number;
    objtype: "pokemon";
    emoji?: string;
    name: string;
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

type TObjectArray = JsonArray & IObject[];
type TInventoryItems = JsonArray & IItem[];
type TFishSack = JsonArray & IFish[];
type TPokemonSack = JsonArray & IPokemon[];

interface IInventory {
    id: number;
    balance: number;

    items: TInventoryItems;
    fishSack: TFishSack;
    pokemon: TPokemonSack;

    user: User;
}

interface IBack<T extends string | unknown> extends Record<string, unknown> {
    m: T;
}

interface Backs extends Record<string, IBack<unknown>> {
    color: {
        m: "color";
    };
}

interface ILocation {
    id: string;
    name: string;
    nearby: string[];
    objects: IObject[];
    hasSand: boolean;
}

interface TFisher {
    id: string;
    userID: string;
    t: number;
    isDM: boolean;
    autofish: boolean;
    autofish_t: number;
}

type TPokedex = IPokemon[];

type TBehavior<T> = () => Promise<T>;
type TBehaviorMap<T> = Record<T, TBehavior>;

interface IItemBehaviorData {
    status: boolean;
    text: string;
    userID: string;
}

type TItemBehavior = Behavior<IItemBehaviorData>;
type TItemBehaviorMap = TBehaviorMap<TItemBehavior>;

interface IGroup {
    id: string;
    permissions: string[];
}
