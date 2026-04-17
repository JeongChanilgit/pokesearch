// Given a merged Showdown dataset, compute the set of slugs that are
// legal in the Champions metagame.
//
// - Pokémon: slugs in formats-data with `tier === 'OU'`.
// - Moves: `isNonstandard !== 'Past'` after mod merge (the mod tags
//   every pre-Champions-removed move as "Past").
// - Items: `isNonstandard === null` after mod merge (mod explicitly
//   un-flags Champions-legal mega stones by setting it to null).
// - Abilities: every ability referenced by a Champions-legal Pokémon
//   (so we also include things like Overgrow that the mod file doesn't
//   touch).

import type { ShowdownRecord } from '../showdown/parse.js';

export interface LegalitySets {
  pokemon: Set<string>;
  moves: Set<string>;
  items: Set<string>;
  abilities: Set<string>;
}

export function buildLegalitySets(
  mergedPokedex: ShowdownRecord,
  formatsData: ShowdownRecord,
  mergedMoves: ShowdownRecord,
  mergedItems: ShowdownRecord
): LegalitySets {
  const pokemon = new Set<string>();
  for (const [slug, entry] of Object.entries(formatsData)) {
    if (!isRecord(entry)) continue;
    if (entry.tier === 'OU') pokemon.add(slug);
  }

  const moves = new Set<string>();
  for (const [slug, entry] of Object.entries(mergedMoves)) {
    if (!isRecord(entry)) continue;
    if (entry.isNonstandard === 'Past') continue;
    moves.add(slug);
  }

  const items = new Set<string>();
  for (const [slug, entry] of Object.entries(mergedItems)) {
    if (!isRecord(entry)) continue;
    if (entry.isNonstandard === null) items.add(slug);
  }

  const abilities = new Set<string>();
  for (const slug of pokemon) {
    const pokedexEntry = mergedPokedex[slug];
    if (!isRecord(pokedexEntry)) continue;
    const ab = pokedexEntry.abilities;
    if (!isRecord(ab)) continue;
    for (const name of Object.values(ab)) {
      if (typeof name === 'string') abilities.add(toId(name));
    }
  }

  return { pokemon, moves, items, abilities };
}

export function toId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
