import { kvGet, kvSet } from "@server/data/keyValueStore";
import { Logger } from "@util/Logger";
import { getRandomPokemon } from "./pokedex";
import { getInventory, updateInventory } from "@server/data/inventory";
import { getUser } from "@server/data/user";
import { addItem } from "@server/items";
import { getHHMMSS } from "@util/time";

const logger = new Logger("Daily Pokemon Manager");
const oneDay = 1000 * 60 * 60 * 24;

export async function claimDailyPokemon(userID: string) {
    // Get the last daily timestamp
    let timestampS = await kvGet(`pokedaily~${userID}`);
    let timestamp = 0;

    if (typeof timestampS == "string") {
        try {
            timestamp = parseInt(timestampS);
        } catch (err) {
            logger.warn("Unable to parse JSON:", err);
        }
    }

    logger.debug("Time remaining:", Date.now() - timestamp);

    // Check if it has been over a day
    if (Date.now() - timestamp > oneDay) {
        // Give them a random pokemon and set new timestamp
        const pokemon = getRandomPokemon();

        const item = {
            id: pokemon.pokeID.toString(),
            name: pokemon.name,
            pokeID: pokemon.pokeID,
            base: pokemon.base,
            type: pokemon.type,
            count: 1,
            objtype: "pokemon"
        } as IPokemon;

        const user = await getUser(userID);
        if (!user) throw new Error("No user found");

        const inventory = await getInventory(user.inventoryId);
        if (!inventory) throw new Error("No inventory found");

        addItem(inventory.pokemon, pokemon);
        await updateInventory(inventory);
        kvSet(`pokedaily~${userID}`, Date.now().toString());

        return `You claimed your daily Pokémon reward and got: ${
            item.emoji || "📦"
        }${item.name}${item.count ? ` (x${item.count})` : ""}`;
    } else {
        // or tell them no
        return `You already claimed today! Time remaining: ${getHHMMSS(
            oneDay - (Date.now() - timestamp),
            false
        )}`;
    }
}
