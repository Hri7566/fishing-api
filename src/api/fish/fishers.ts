import { kvGet, kvSet } from "@server/data/keyValueStore";
import { getObjectStorage } from "@server/data/location";
import { addTickEvent, removeTickEvent } from "@util/tick";
import { getSizeString, randomFish } from "./fish";
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
            stopFishing(winner.id, winner.userID, winner.channel, false);
            return;
        }

        const inventory = await getInventory(user.inventoryId);

        if (!inventory) {
            stopFishing(winner.id, winner.userID, winner.channel, false);
            return;
        }

        const r = Math.random();
        const data = await getFishingChance(user.id);
        // After 30 minutes, reset chance
        if (data.t > 30 * 60000) await resetFishingChance(user.id);

        if (r < data.chance / 10) {
            stopFishing(
                winner.id,
                winner.userID,
                winner.channel,
                winner.autofish,
                winner.autofish_t
            );

            // Save to sack
            const animal = randomFish(inventory.location);
            addItem(inventory.fishSack as TFishSack, animal);
            await updateInventory(inventory);

            const size = getSizeString(animal.size);
            const p = prefixes[0];
            const emoji = animal.emoji || "🐟";

            addBack(winner.id, {
                m: "sendchat",
                channel: winner.channel,
                message: `Our good friend @${user.id} caught a ${size} ${emoji}${animal.name}! ready to ${p}eat or ${p}fish again${winner.autofish ? " (AUTOFISH is enabled)" : ""}`,
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
    userID: string,
    channel: string,
    isDM: boolean = false,
    autofish: boolean = false,
    autofish_t: number = Date.now()
) {
    fishers[id + "~" + userID] = {
        id,
        userID,
        channel,
        t: Date.now(),
        isDM,
        autofish,
        autofish_t
    };
}

export function stopFishing(
    id: string,
    userID: string,
    channel: string,
    autofish: boolean = false,
    autofish_t: number = Date.now()
) {
    let key = id + "~" + userID;
    let fisher = fishers[key];
    delete fishers[key];

    const t = Date.now();
    if (t > autofish_t + 5 * 60000) {
        addBack(fisher.id, {
            m: "sendchat",
            message: `Friend @${fisher.userID}'s AUTOFISH has sibsided after ${(
                (Date.now() - fisher.autofish_t) /
                1000 /
                60
            ).toFixed(2)} minutes.`,
            channel: fisher.channel,
            isDM: fisher.isDM,
            id: fisher.userID
        });
        return;
    }

    if (autofish) {
        startFishing(id, userID, channel, true, true, autofish_t);
    }
}

export function getFishing(id: string, userID: string) {
    return fishers[id + "~" + userID];
}

export async function getFishingChance(userID: string) {
    const key = `fishingChance~${userID}`;
    const data = (await kvGet(key)) as IFishingChance;

    if (!data) {
        await resetFishingChance(userID);
        return await getFishingChance(userID);
    }

    return data;
}

export async function resetFishingChance(userID: string) {
    const key = `fishingChance~${userID}`;
    await kvSet(key, {
        t: Date.now(),
        chance: 1
    } as IFishingChance);
}

export async function incrementFishingChance(userID: string) {
    const key = `fishingChance~${userID}`;
    const data = (await kvGet(key)) as IFishingChance;
    if (!data) await resetFishingChance(userID);
    const r = Math.random();
    data.chance += r;
    await kvSet(key, data);
    return r;
}
