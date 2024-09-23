import { Logger } from "@util/Logger";
import { loadConfig } from "@util/config";

export const pokedex = loadConfig<TPokedex>("config/pokedex.yml", []);

const logger = new Logger("Pokédex");

export function getPokemonByID(id: number) {
    return pokedex.find(p => p.pokeID == id);
}

export function getRandomPokemon() {
    const r = Math.floor(Math.random() * pokedex.length);
    return pokedex[r];
}
