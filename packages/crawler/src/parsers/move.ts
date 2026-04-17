import type { ShowdownRecord } from '../showdown/parse.js';
import type { IdManifest } from '../showdown/id-manifest.js';
import type { KoTables, MissingTracker } from '../showdown/korean.js';
import { assignId } from '../showdown/id-manifest.js';
import { lookupKo } from '../showdown/korean.js';

export interface ParsedMove {
  id: number;
  nameEn: string;
  nameKo: string;
  type: string;
  category: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  pp: number;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function buildMoveRow(
  slug: string,
  mergedMoves: ShowdownRecord,
  textMoves: ShowdownRecord,
  manifest: IdManifest,
  koTables: KoTables,
  tracker: MissingTracker
): ParsedMove | null {
  const entry = mergedMoves[slug];
  if (!isRecord(entry)) return null;

  // Prefer text file name, fall back to entry name.
  const textEntry = textMoves[slug];
  const nameEn =
    (isRecord(textEntry) && typeof textEntry.name === 'string' ? textEntry.name : null) ??
    (typeof entry.name === 'string' ? entry.name : slug);

  const rawCategory = typeof entry.category === 'string' ? entry.category.toLowerCase() : '';
  if (rawCategory !== 'physical' && rawCategory !== 'special' && rawCategory !== 'status') {
    return null;
  }

  const koEntry = lookupKo(koTables, tracker, 'moves', slug, nameEn);

  return {
    id: assignId(manifest, 'move', slug),
    nameEn,
    nameKo: koEntry.name,
    type: typeof entry.type === 'string' ? entry.type.toLowerCase() : 'normal',
    category: rawCategory as 'physical' | 'special' | 'status',
    power: typeof entry.basePower === 'number' && entry.basePower > 0 ? entry.basePower : null,
    accuracy: typeof entry.accuracy === 'number' ? entry.accuracy : null,
    pp: typeof entry.pp === 'number' ? entry.pp : 5,
  };
}
