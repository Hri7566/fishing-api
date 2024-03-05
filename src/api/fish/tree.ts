import { createKeyValueStore, kvGet, kvSet } from "@server/data/keyValueStore";
import { addTickEvent } from "@util/tick";

const key = "tree";

export async function getFruitCount() {
    return await kvGet(key);
}

export async function setFruitCount(num: number) {
    await kvSet(key, num);
}

export async function treeTick() {
    const r = Math.random();

    if (r < 0.00001) {
        await growFruit(5);
    } else if (r < 0.0001) {
        await growFruit(1);
    }
}

export async function initTree() {
    const num = await kvGet(key);
    if (typeof num !== "number") kvSet(key, 0);

    addTickEvent(treeTick);
}

export async function genFruitAndRemove(): Promise<IItem> {
    await growFruit(-1);

    return {
        id: "kekklefruit",
        name: "Kekklefruit",
        objtype: "item",
        emoji: "🍍"
    };
}

export async function hasFruit() {
    const num = await getFruitCount();
    if (num <= 0) return false;
    return true;
}

export async function growFruit(num: number) {
    const old = await getFruitCount();
    await setFruitCount(old + num);
}
