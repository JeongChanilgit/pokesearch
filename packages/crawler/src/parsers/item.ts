import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ShowdownRecord } from '../showdown/parse.js';
import type { IdManifest } from '../showdown/id-manifest.js';
import type { KoTables, MissingTracker } from '../showdown/korean.js';
import { assignId } from '../showdown/id-manifest.js';
import { lookupKo } from '../showdown/korean.js';

export interface ParsedItem {
  id: number;
  nameEn: string;
  nameKo: string;
  descriptionEn: string;
  descriptionKo: string;
  effectMult: Record<string, number> | null;
}

type EffectMultMap = Record<string, Record<string, number>>;

let effectMultCache: EffectMultMap | null = null;

export async function loadEffectMultMap(dataDir: string): Promise<EffectMultMap> {
  if (effectMultCache) return effectMultCache;
  try {
    const raw = await fs.readFile(path.join(dataDir, 'data', 'item-effect-mult.json'), 'utf8');
    effectMultCache = JSON.parse(raw) as EffectMultMap;
  } catch {
    effectMultCache = {};
  }
  return effectMultCache;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function buildItemRow(
  slug: string,
  mergedItems: ShowdownRecord,
  textItems: ShowdownRecord,
  effectMults: EffectMultMap,
  manifest: IdManifest,
  koTables: KoTables,
  tracker: MissingTracker
): ParsedItem | null {
  const entry = mergedItems[slug];
  if (!isRecord(entry)) return null;

  const textEntry = textItems[slug];
  const nameEn =
    (isRecord(textEntry) && typeof textEntry.name === 'string' ? textEntry.name : null) ??
    (typeof entry.name === 'string' ? entry.name : slug);

  const descriptionEn = isRecord(textEntry)
    ? (typeof textEntry.shortDesc === 'string'
        ? textEntry.shortDesc
        : typeof textEntry.desc === 'string'
          ? textEntry.desc
          : '')
    : '';

  const koEntry = lookupKo(koTables, tracker, 'items', slug, nameEn);
  const effectMult = effectMults[slug] ?? null;

  return {
    id: assignId(manifest, 'item', slug),
    nameEn,
    nameKo: koEntry.name,
    descriptionEn,
    descriptionKo: koEntry.description ?? descriptionEn,
    effectMult,
  };
}
