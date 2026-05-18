export function formatFish(fish: IFish) {
    let displayName = `${formatFishSize(fish.size)} ${fish.emoji || "🐟"}${fish.name} (${formatFishRarity(fish.rarity)})`
    displayName += addObjectCount(fish);
    return displayName;
}

export function formatItem(item: IItem) {
    let displayName = `${item.emoji || ""}${item.name}`
    displayName += addObjectCount(item);
    return displayName;
}

export function formatPokemon(pokemon: IPokemon) {
    let displayName = `${pokemon.name}`
    displayName += addObjectCount(pokemon);
    return displayName;
}

export function formatPokemonDetailed(pokemon: IPokemon) {
    let displayName = `${pokemon.name} / HP: ${pokemon.base.HP} / Attack: ${pokemon.base.Attack} / Defense: ${pokemon.base.Defense} / Sp. Attack: ${pokemon.base["Sp. Attack"]} / Sp. Defense: ${pokemon.base["Sp. Defense"]} / Speed: ${pokemon.base.Speed}`

    displayName += addObjectCount(pokemon);
    return displayName;
}

export function addObjectCount(obj: IObject) {
    if (
        typeof obj.count !== "undefined" &&
        obj.count !== 1
    )
        return ` (x${obj.count})`;

    return "";
}

export function formatFishSize(cm: number) {
    const size =
        cm < 5
            ? "microscopic"
            : cm < 10
                ? "tiny"
                : cm < 30
                    ? "small"
                    : cm < 60
                        ? "medium-sized"
                        : cm < 75
                            ? "large"
                            : cm < 100
                                ? "huge"
                                : cm < 200
                                    ? "massive"
                                    : cm < 300
                                        ? "gigantic"
                                        : cm < 600
                                            ? "humongous"
                                            : "supermassive";

    return size;
}

export function formatFishRarity(rarity: number) {
    const rarityStr =
        rarity < 1
            ? "common"
            : rarity < 2
                ? "uncommon"
                : rarity < 3
                    ? "rare"
                    : rarity < 4
                        ? "epic"
                        : "legendary";

    return rarityStr;
}
