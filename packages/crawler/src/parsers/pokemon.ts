// Maps a Showdown pokedex entry to our `pokemons` row.
//
// ID scheme (unchanged from PokeAPI era): `dex * 100 + form_slot`
//   - Base form: slot 0  → dex * 100
//   - Alt forms : slot 1+ → dex * 100 + N  (ordering: base first, then
//     Showdown's `formeOrder` if present, else alphabetical by slug)
//
// Sprite URL reuses the PokeAPI CDN (commercial-OK, MIT sprites repo)
// keyed by national-dex number: there's only one sprite per dex entry
// for base forms; alt forms use the same base-form dex sprite.

import type { ShowdownRecord } from '../showdown/parse.js';
import type { KoTables, MissingTracker } from '../showdown/korean.js';
import { lookupKo } from '../showdown/korean.js';
import { toId } from './legality.js';

export interface ParsedPokemon {
  id: number;
  nameEn: string;
  nameKo: string;
  types: string[];
  baseH: number;
  baseA: number;
  baseB: number;
  baseC: number;
  baseD: number;
  baseS: number;
  spriteUrl: string;
  formOf: number | null;
}

function spriteUrl(dexNum: number): string {
  return `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${dexNum}.png`;
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function numArr(v: unknown): number[] {
  return Array.isArray(v) ? (v as unknown[]).filter((x) => typeof x === 'number') as number[] : [];
}

/**
 * Group all Showdown pokedex slugs by national-dex number, computing
 * stable form slots. Returns a list of `{ slug, dexNum, slot, baseSlug }`
 * in the order they should be inserted.
 *
 * Ordering: base form always slot 0; remaining slugs follow `formeOrder`
 * if present on the base entry, else alphabetical by slug.
 */
export interface FormGroup {
  slug: string;
  dexNum: number;
  slot: number;
  baseSlug: string;
}

export function buildFormGroups(
  mergedPokedex: ShowdownRecord,
  legalSlugs: Set<string>
): FormGroup[] {
  // Group slugs by dex number.
  const byDex = new Map<number, string[]>();
  for (const [slug, entry] of Object.entries(mergedPokedex)) {
    if (!legalSlugs.has(slug)) continue;
    if (!isRecord(entry)) continue;
    const num = entry.num;
    if (typeof num !== 'number' || num <= 0) continue;
    const list = byDex.get(num) ?? [];
    list.push(slug);
    byDex.set(num, list);
  }

  const groups: FormGroup[] = [];

  for (const [dexNum, slugs] of byDex) {
    const base = slugs.find((s) => !isRecord(mergedPokedex[s]) || !(mergedPokedex[s] as Record<string, unknown>).baseSpecies);
    if (!base) continue;
    const baseEntry = mergedPokedex[base] as Record<string, unknown>;

    // Determine order. Use `formeOrder` from the base entry if present
    // (it lists Showdown internal names like "Venusaur-Mega"), otherwise
    // base first then alphabetical alts.
    const formeOrder = Array.isArray(baseEntry.formeOrder) ? baseEntry.formeOrder as string[] : null;
    const alts = slugs.filter((s) => s !== base);

    let ordered: string[];
    if (formeOrder && formeOrder.length > 1) {
      // Map Showdown display names → slugs for alts.
      const altMap = new Map<string, string>(alts.map((s) => [toId((mergedPokedex[s] as Record<string, unknown>).name as string ?? s), s]));
      ordered = [base];
      for (const formeName of formeOrder) {
        const id = toId(formeName);
        if (id === toId((baseEntry.name as string) ?? base)) continue;
        const altSlug = altMap.get(id);
        if (altSlug) ordered.push(altSlug);
      }
      // Append any alts not in formeOrder.
      for (const alt of alts) {
        if (!ordered.includes(alt)) ordered.push(alt);
      }
    } else {
      ordered = [base, ...alts.sort()];
    }

    for (let slot = 0; slot < ordered.length; slot++) {
      groups.push({
        slug: ordered[slot],
        dexNum,
        slot,
        baseSlug: base,
      });
    }
  }

  return groups.sort((a, b) => a.dexNum * 100 + a.slot - (b.dexNum * 100 + b.slot));
}

export function buildPokemonRow(
  slug: string,
  group: FormGroup,
  mergedPokedex: ShowdownRecord,
  koTables: KoTables,
  tracker: MissingTracker
): ParsedPokemon | null {
  const entry = mergedPokedex[slug];
  if (!isRecord(entry)) return null;

  const nameEn = typeof entry.name === 'string' ? entry.name : slug;
  const koEntry = lookupKo(koTables, tracker, 'pokemon', slug, nameEn);

  const stats = entry.baseStats;
  if (!isRecord(stats)) return null;

  const types = (Array.isArray(entry.types) ? entry.types : [])
    .map((t) => (typeof t === 'string' ? t.toLowerCase() : ''))
    .filter(Boolean);

  const ourId = group.dexNum * 100 + group.slot;
  const baseId = group.dexNum * 100;

  return {
    id: ourId,
    nameEn: truncate(nameEn, 32),
    nameKo: truncate(koEntry.name, 32),
    types,
    baseH: Number(stats.hp ?? 0),
    baseA: Number(stats.atk ?? 0),
    baseB: Number(stats.def ?? 0),
    baseC: Number(stats.spa ?? 0),
    baseD: Number(stats.spd ?? 0),
    baseS: Number(stats.spe ?? 0),
    spriteUrl: spriteUrl(group.dexNum),
    formOf: group.slot === 0 ? null : baseId,
  };
}
