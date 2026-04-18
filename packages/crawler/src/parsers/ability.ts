import type { ShowdownRecord } from '../showdown/parse.js';
import type { IdManifest } from '../showdown/id-manifest.js';
import type { KoTables, MissingTracker } from '../showdown/korean.js';
import { assignId } from '../showdown/id-manifest.js';
import { lookupKo } from '../showdown/korean.js';
import type { FormGroup } from './pokemon.js';
import { toId } from './legality.js';

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

export interface PokemonAbilityLink {
  pokemonId: number;
  abilityId: number;
}

export function buildPokemonAbilityLinks(
  formGroups: FormGroup[],
  mergedPokedex: ShowdownRecord,
  manifest: IdManifest
): PokemonAbilityLink[] {
  const results: PokemonAbilityLink[] = [];
  for (const form of formGroups) {
    const entry = mergedPokedex[form.slug];
    if (!isRecord(entry)) continue;
    const ab = entry.abilities;
    if (!isRecord(ab)) continue;
    const pokemonId = form.dexNum * 100 + form.slot;
    const seen = new Set<number>();
    for (const name of Object.values(ab)) {
      if (typeof name !== 'string') continue;
      const slug = toId(name);
      const abilityId = manifest.ability[slug];
      if (typeof abilityId !== 'number') continue;
      if (seen.has(abilityId)) continue;
      seen.add(abilityId);
      results.push({ pokemonId, abilityId });
    }
  }
  return results;
}
