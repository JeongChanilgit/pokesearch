import type { ShowdownRecord } from '../showdown/parse.js';
import type { KoTables, MissingTracker } from '../showdown/korean.js';
import { lookupKo } from '../showdown/korean.js';

export interface ParsedNature {
  id: number;
  nameEn: string;
  nameKo: string;
  boostStat: 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe' | null;
  reduceStat: 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe' | null;
}

// Showdown uses 'spa' but also abbreviates as 'spatk' in some contexts.
// The DB enum matches Showdown's shorthand: hp/atk/def/spa/spd/spe.
const STAT_MAP: Record<string, ParsedNature['boostStat']> = {
  atk: 'atk',
  def: 'def',
  spa: 'spa',
  spd: 'spd',
  spe: 'spe',
  hp: 'hp',
};

// Stable id assignment: sorted alphabetically by slug → 1-based index.
function assignNatureId(slug: string, sortedSlugs: string[]): number {
  return sortedSlugs.indexOf(slug) + 1;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function buildNatureRows(
  baseNatures: ShowdownRecord,
  koTables: KoTables,
  tracker: MissingTracker
): ParsedNature[] {
  const sortedSlugs = Object.keys(baseNatures).sort();
  const out: ParsedNature[] = [];

  for (const slug of sortedSlugs) {
    const entry = baseNatures[slug];
    if (!isRecord(entry)) continue;
    const nameEn = typeof entry.name === 'string' ? entry.name : slug;
    const koEntry = lookupKo(koTables, tracker, 'natures', slug, nameEn);

    const plus = typeof entry.plus === 'string' ? entry.plus : null;
    const minus = typeof entry.minus === 'string' ? entry.minus : null;

    out.push({
      id: assignNatureId(slug, sortedSlugs),
      nameEn,
      nameKo: koEntry.name,
      boostStat: plus ? (STAT_MAP[plus] ?? null) : null,
      reduceStat: minus ? (STAT_MAP[minus] ?? null) : null,
    });
  }

  return out;
}
