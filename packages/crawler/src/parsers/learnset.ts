// Derives (pokemon_id, move_id) pairs for the pokemon_learnable_moves table.
// PokeAPI returns a Pokemon's full learnable-move list directly on the
// /pokemon endpoint — no generation/version filtering needed for v1.

import type { PokeApiPokemon } from '../pokeapi.js';
import { idFromUrl } from '../pokeapi.js';

export interface ParsedLearnsetEntry {
  pokemonId: number;
  moveId: number;
}

export function buildLearnset(
  ourPokemonId: number,
  mon: PokeApiPokemon
): ParsedLearnsetEntry[] {
  const out: ParsedLearnsetEntry[] = [];
  const seen = new Set<number>();
  for (const m of mon.moves) {
    let moveId: number;
    try {
      moveId = idFromUrl(m.move.url);
    } catch {
      continue;
    }
    if (seen.has(moveId)) continue;
    seen.add(moveId);
    out.push({ pokemonId: ourPokemonId, moveId });
  }
  return out;
}
