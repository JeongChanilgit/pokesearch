// Maps PokeAPI species + variety responses to our `pokemons` rows.
//
// Our ID scheme: `dex * 100 + form_number`.
// - Base form       → dex * 100 + 0
// - First alt form  → dex * 100 + 1
// - Subsequent alts → dex * 100 + 2, 3, ...
//
// Form ordering follows the `varieties[]` order returned by the species
// endpoint. The default variety is placed at slot 0 regardless of its
// position in the array; remaining varieties keep their relative order.

import type { PokeApiPokemon, PokeApiSpecies } from '../pokeapi.js';
import { idFromUrl, pickName } from '../pokeapi.js';

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

export interface VarietyPlan {
  ourId: number;
  formOf: number | null;
  pokeapiId: number;
  varietyName: string;
  isDefault: boolean;
}

/**
 * Compute our ID layout for a species' varieties.
 *
 * We keep the variety order from PokeAPI (stable per release), but
 * guarantee the default variety occupies form slot 0 so `form_of` always
 * points to the canonical base form.
 */
export function planVarieties(species: PokeApiSpecies): VarietyPlan[] {
  const dex = species.id;
  const varieties = species.varieties;
  const baseIdx = varieties.findIndex((v) => v.is_default);
  const base = baseIdx === -1 ? varieties[0] : varieties[baseIdx];
  if (!base) return [];

  const ordered = [base, ...varieties.filter((v) => v !== base)];
  const baseId = dex * 100 + 0;

  return ordered.map((variety, slot) => ({
    ourId: dex * 100 + slot,
    formOf: slot === 0 ? null : baseId,
    pokeapiId: idFromUrl(variety.pokemon.url),
    varietyName: variety.pokemon.name,
    isDefault: variety === base,
  }));
}

/**
 * Extract `name_en` / `name_ko` from a species response. Older Pokémon
 * sometimes lack a Korean name — return `null` so the caller can log and
 * fall back.
 */
export function pickBilingualNames(
  species: PokeApiSpecies
): { nameEn: string; nameKo: string | null } | null {
  const nameEn = pickName(species.names, 'en');
  if (!nameEn) return null;
  const nameKo = pickName(species.names, 'ko');
  return { nameEn, nameKo };
}

/**
 * Build a `pokemons` row. For alt forms, the species-level names are
 * decorated with a suffix derived from the variety slug (e.g.
 * `charizard-mega-x` → "Mega X") so the UI can distinguish them.
 */
export function buildPokemonRow(
  species: PokeApiSpecies,
  mon: PokeApiPokemon,
  plan: VarietyPlan
): ParsedPokemon | null {
  const names = pickBilingualNames(species);
  if (!names) return null;
  const nameEn = plan.isDefault ? names.nameEn : decorateFormName(names.nameEn, plan.varietyName);
  const nameKo = plan.isDefault
    ? names.nameKo ?? `${names.nameEn}`
    : decorateFormName(names.nameKo ?? names.nameEn, plan.varietyName);

  const stat = (key: string) =>
    mon.stats.find((s) => s.stat.name === key)?.base_stat ?? 0;
  const types = [...mon.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name);

  return {
    id: plan.ourId,
    nameEn: truncate(nameEn, 32),
    nameKo: truncate(nameKo, 32),
    types,
    baseH: stat('hp'),
    baseA: stat('attack'),
    baseB: stat('defense'),
    baseC: stat('special-attack'),
    baseD: stat('special-defense'),
    baseS: stat('speed'),
    spriteUrl: spriteUrlFor(plan.pokeapiId),
    formOf: plan.formOf,
  };
}

function spriteUrlFor(pokeapiId: number): string {
  return `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${pokeapiId}.png`;
}

function decorateFormName(baseName: string, varietySlug: string): string {
  const parts = varietySlug.split('-').slice(1);
  if (parts.length === 0) return baseName;
  const suffix = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
  return `${baseName} ${suffix}`;
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max);
}
