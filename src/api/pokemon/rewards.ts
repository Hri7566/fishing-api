export interface IPokemonReward extends IItem {
}

const rewards: IPokemonReward[] = [{
    id: "stick",
    name: "Stick",
    objtype: "item"
}];

export function getReward(pokeID: number) {
    // TODO: return random reward based on pokemon ID hash/checksum, or maybe pokemon type
    const checksum = 
}
