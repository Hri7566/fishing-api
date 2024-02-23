import { kvGet, kvSet } from "@server/data/keyValueStore";
import { getObjectStorage } from "@server/data/location";
import { addTickEvent, removeTickEvent } from "@util/tick";
import { randomFish } from "./fish";
import { getUser } from "@server/data/user";
import { getInventory, updateInventory } from "@server/data/inventory";
import { addItem } from "@server/items";
import { addBack } from "@server/backs";
import { prefixes } from "@server/commands/prefixes";
import { Logger } from "@util/Logger";

export let fishers: Record<
    string,
    {
        id: string;
        userId: string;
        t: number;
    }
> = {};

let cooldown = Date.now() + 5000;

const logger = new Logger("Fishermen");

export async function tick() {
    if (Date.now() > cooldown) {
        cooldown = Date.now() + 5000;

        let winner =
            Object.values(fishers)[
                Math.floor(Math.random() * Object.values(fishers).length)
            ];

        if (!winner) return;

        const user = await getUser(winner.userId);

        if (!user) {
            stopFishing(winner.id, winner.userId);
            return;
        }

        const inventory = await getInventory(user.inventoryId);

        if (!inventory) {
            stopFishing(winner.id, winner.userId);
            return;
        }

        const r = Math.random();

        if (r < 0.1) {
            stopFishing(winner.id, winner.userId);
            const animal = randomFish(inventory.location);
            addItem(inventory.fishSack as TFishSack, animal);
            await updateInventory(inventory);
            const size =
                animal.size < 30
                    ? "small"
                    : animal.size < 60
                    ? "medium-sized"
                    : animal.size < 75
                    ? "large"
                    : animal.size < 100
                    ? "huge"
                    : "massive";
            addBack(winner.id, {
                m: "sendchat",
                message: `Our good friend ${user.name} caught a ${size} ${
                    animal.emoji || "🐟"
                }${animal.name}! ready to ${prefixes[0]}eat or ${
                    prefixes[0]
                }fish again`
            });
        }
    }

    await kvSet("fishers", fishers);
}

export async function startFisherTick() {
    let maybe = (await kvGet("fishers")) as Record<
        string,
        {
            id: string;
            userId: string;
            t: number;
        }
    >;

    if (maybe) fishers = maybe;

    addTickEvent(tick);
}

export function stopFisherTick() {
    removeTickEvent(tick);
}

export function startFishing(id: string, userId: string) {
    fishers[id + "~" + userId] = { id, userId: userId, t: Date.now() };
}

export function stopFishing(id: string, userId: string) {
    let key = id + "~" + userId;
    delete fishers[key];
}

export function getFishing(id: string, userId: string) {
    return fishers[id + "~" + userId];
}
