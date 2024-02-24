import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";

export const pokemon = new Command(
    "pokemon",
    ["pokemon"],
    "Look at your Pokemon",
    "pokemon",
    "command.inventory.pokemon",
    async ({ id, command, args, prefix, part, user }) => {
        const inv = await getInventory(user.inventoryId);
        if (!inv) return;

        const sack = inv.pokemon as TPokemonSack[];

        return `Friend ${part.name}'s Pokémon: ${
            sack
                .map(
                    (pokemon: IPokemon) =>
                        `${pokemon.emoji || ""}${pokemon.name}${
                            pokemon.count ? ` (x${pokemon.count})` : ""
                        }`
                )
                .join(", ") || "(none)"
        }`;
    },
    true
);
