import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";
import { formatPokemon } from "@util/format";

export const listpokemon = new Command(
    "listpokemon",
    ["listpokemon", "showpokemon", "pokemonbox", "pokebox", "box", "pokemon", "pmon"],
    "List your Pokémon collection",
    "pokemon",
    "command.inventory.pokemon",
    async ({ id, command, args, prefix, part, user }) => {
        const inv = await getInventory(user.inventoryId);
        if (!inv) return;

        const sack = inv.pokemon as TPokemonSack[];

        return `Friend ${part.name}'s Pokémon: ${sack
            .map((pokemon: IPokemon, index) => `${index}. ${formatPokemon(pokemon)}`)
            .join(" | ") || "(none)"
            }`;
    },
    true
);
