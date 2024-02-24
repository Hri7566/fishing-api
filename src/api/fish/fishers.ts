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

export let fishers: Record<string, TFisher> = {};

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

        const user = await getUser(winner.userID);

        if (!user) {
            stopFishing(winner.id, winner.userID, false);
            return;
        }

        const inventory = await getInventory(user.inventoryId);

        if (!inventory) {
            stopFishing(winner.id, winner.userID, false);
            return;
        }

        const r = Math.random();

        if (r < 0.1) {
            stopFishing(winner.id, winner.userID, winner.autofish);
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
                    : animal.size < 200
                    ? "massive"
                    : "gigantic";
            addBack(winner.id, {
                m: "sendchat",
                message: `Our good friend @${user.id} caught a ${size} ${
                    animal.emoji || "🐟"
                }${animal.name}! ready to ${prefixes[0]}eat or ${
                    prefixes[0]
                }fish again${winner.autofish ? " (AUTOFISH is enabled)" : ""}`,
                isDM: winner.isDM,
                id: winner.userID
            });
        }
    }

    await kvSet("fishers", fishers);
}

export async function startFisherTick() {
    let maybe = (await kvGet("fishers")) as Record<string, TFisher>;

    if (maybe) fishers = maybe;

    addTickEvent(tick);
}

export function stopFisherTick() {
    removeTickEvent(tick);
}

export function startFishing(
    id: string,
    userId: string,
    isDM: boolean = false,
    autofish: boolean = false
) {
    fishers[id + "~" + userId] = {
        id,
        userID: userId,
        t: Date.now(),
        isDM,
        autofish
    };
}

export function stopFishing(
    id: string,
    userId: string,
    autofish: boolean = false
) {
    let key = id + "~" + userId;
    let fisher = fishers[key];
    delete fishers[key];

    if (autofish) {
        startFishing(id, userId, true, true);
    }
}

export function getFishing(id: string, userId: string) {
    return fishers[id + "~" + userId];
}
