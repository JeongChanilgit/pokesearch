// Derives (pokemonId, moveId) pairs from the Champions mod learnsets.
//
// Only the Champions mod learnsets are used — base Showdown learnsets
// are ignored. The mod file lists every legal learnset; Pokémon or moves
// not in it simply can't learn anything (which is expected for illegals).

import type { ShowdownRecord } from '../showdown/parse.js';
import type { IdManifest } from '../showdown/id-manifest.js';
import { toId } from './legality.js';

export interface ParsedLearnsetEntry {
  pokemonId: number;
  moveId: number;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Build learnset entries for a single Pokémon slug.
 *
 * `pokemonId` is the caller's `dex * 100 + slot` id.
 * Move ids are looked up from the manifest (must already be populated
 * from the move crawl step running first).
 *
 * If `slug` has no entry or an empty learnset, falls back to `baseSlug`.
 */
export function buildLearnset(
  pokemonId: number,
  slug: string,
  baseSlug: string,
  modLearnsets: ShowdownRecord,
  manifest: IdManifest
): ParsedLearnsetEntry[] {
  let entry = modLearnsets[slug];
  if (!isRecord(entry) || !isRecord(entry.learnset) || Object.keys(entry.learnset).length === 0) {
    entry = modLearnsets[baseSlug];
  }
  if (!isRecord(entry)) return [];
  const learnset = entry.learnset;
  if (!isRecord(learnset)) return [];

  const out: ParsedLearnsetEntry[] = [];
  const seen = new Set<number>();

  for (const moveSlug of Object.keys(learnset)) {
    const moveId = manifest.move[toId(moveSlug)];
    if (moveId === undefined) continue;
    if (seen.has(moveId)) continue;
    seen.add(moveId);
    out.push({ pokemonId, moveId });
  }

  return out;
}
