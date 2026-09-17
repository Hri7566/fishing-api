import Command from "@server/commands/Command";
import { getInventory } from "@server/data/inventory";

export const pokemon = new Command(
    "trade",
    ["trade", "pt"],
    "Trade your Pokémon with someone else.",
    "trade",
    "command.pokemon.trade",
    async ({ id, command, args, prefix, part, user }) => {
        // TODO: trade command
        return "WIP";
    },
    true
);
