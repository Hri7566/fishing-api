interface IPart {
    id: string;
    name: string;
    color: string;
}

interface ICommandResponse {
    response: string;
}

interface ICommandContextProps {
    id: string;
    channel: string;
    command: string;
    args: string[];
    prefix: string;
    part: IPart;
    user: User;
    isDM: boolean;
}

type TCommandCallback<User> = (
    props: ICommandContextProps
) => Promise<string | void>;

type TCommandCallbackWithSelf<User, T> = (
    props: ICommandContextProps,
    self: T
) => Promise<string | void>;

interface ICountComponent {
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
    id: string;
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
    location: string;

    items: TInventoryItems;
    fishSack: TFishSack;
    pokemon: TPokemonSack;

    user: User;
}

interface IBack<T extends string | unknown> extends Record<string, unknown> {
    m: T;
}

interface IBacks extends Record<string, IBack<unknown>> {
    color: {
        m: "color";
    };
}

interface ILocation {
    id: string;
    name: string;
    nearby: string[];
    objects: IObject[];
}

interface IFishingLocation extends ILocation {
    canFish: true;
}

interface ISandyLocation extends ILocation {
    hasSand: true;
}

interface IShopLocation extends ILocation {
    isShop: true;
}

type TAnyLocation =
    | ILocation
    | IFishingLocation
    | ISandyLocation
    | IShopLocation;

interface TFisher {
    id: string;
    userID: string;
    channel: string;
    t: number;
    isDM: boolean;
    autofish: boolean;
    autofish_t: number;
}

type TPokedex = IPokemon[];

interface IGroup {
    id: string;
    permissions: string[];
}

interface IFishingChance {
    chance: number;
    t: number;
}
