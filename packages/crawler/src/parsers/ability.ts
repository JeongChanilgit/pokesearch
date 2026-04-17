import type { ShowdownRecord } from '../showdown/parse.js';
import type { IdManifest } from '../showdown/id-manifest.js';
import type { KoTables, MissingTracker } from '../showdown/korean.js';
import { assignId } from '../showdown/id-manifest.js';
import { lookupKo } from '../showdown/korean.js';

export interface ParsedAbility {
  id: number;
  nameEn: string;
  nameKo: string;
  descriptionEn: string;
  descriptionKo: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function buildAbilityRow(
  slug: string,
  mergedAbilities: ShowdownRecord,
  textAbilities: ShowdownRecord,
  manifest: IdManifest,
  koTables: KoTables,
  tracker: MissingTracker
): ParsedAbility | null {
  const entry = mergedAbilities[slug];
  if (!isRecord(entry)) return null;

  const textEntry = textAbilities[slug];
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

  const koEntry = lookupKo(koTables, tracker, 'abilities', slug, nameEn);

  return {
    id: assignId(manifest, 'ability', slug),
    nameEn,
    nameKo: koEntry.name,
    descriptionEn,
    descriptionKo: koEntry.description ?? descriptionEn,
  };
}
