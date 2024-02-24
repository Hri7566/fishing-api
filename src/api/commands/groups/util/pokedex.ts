import Command from "@server/commands/Command";
import { getPokemonByID } from "@server/pokemon/pokedex";

export const pokedex = new Command(
    "pokedex",
    ["pokedex", "dex"],
    "View a Pokémon in the Pokédex",
    "pokedex",
    "command.util.pokedex",
    async ({ args }) => {
        const num = parseInt(args[0]);
        if (isNaN(num)) return `Please provide a Pokémon ID.`;

        const pokemon = getPokemonByID(num);

        if (!pokemon) return `Pokémon with ID ${args[0]} not found.`;

        return `ID: ${pokemon.pokeID} // Name: ${
            pokemon.name
        } // Type: ${pokemon.type.join("/")} // Base HP: ${
            pokemon.base.HP
        } // Base Attack: ${pokemon.base.Attack} // Base Defense: ${
            pokemon.base.Defense
        } // Base Sp. Attack: ${
            pokemon.base["Sp. Attack"]
        } // Base Sp. Defense: ${pokemon.base["Sp. Defense"]} // Base Speed: ${
            pokemon.base.Speed
        }`;
    }
);
