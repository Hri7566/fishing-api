import { createKeyValueStore, kvGet, kvSet } from "@server/data/keyValueStore";
import { addTickEvent } from "@util/tick";

const key = "tree";

export async function getFruitCount() {
    let num = await kvGet(key);

    switch (typeof num) {
        case "string":
            return parseInt(num);
        case "number":
            if (isNaN(num)) return 0;
            return num;
        default:
            return 0;
    }
}

export async function setFruitCount(num: number) {
    await kvSet(key, num);
}

export async function treeTick() {
    const r = Math.random();

    if (r < 0.000001) {
        await growFruit(5);
    } else if (r < 0.00001) {
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
