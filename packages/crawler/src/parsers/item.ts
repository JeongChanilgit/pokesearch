import type { PokeApiItem } from '../pokeapi.js';
import { pickName } from '../pokeapi.js';

export interface ParsedItem {
  id: number;
  nameEn: string;
  nameKo: string;
  descriptionEn: string;
  descriptionKo: string;
  effectMult: Record<string, number> | null;
}

function pickEffect(entries: PokeApiItem['effect_entries'], lang: 'en' | 'ko'): string {
  const hit = entries.find((e) => e.language.name === lang);
  return (hit?.short_effect ?? hit?.effect ?? '').replace(/[\n\f]/g, ' ').trim();
}

function pickFlavor(entries: PokeApiItem['flavor_text_entries'], lang: 'en' | 'ko'): string {
  const hit = entries.find((e) => e.language.name === lang);
  return (hit?.text ?? '').replace(/[\n\f]/g, ' ').trim();
}

export function buildItemRow(it: PokeApiItem): ParsedItem | null {
  const nameEn = pickName(it.names, 'en');
  if (!nameEn) return null;
  const nameKo = pickName(it.names, 'ko') ?? nameEn;
  const descEn = pickEffect(it.effect_entries, 'en') || pickFlavor(it.flavor_text_entries, 'en');
  const descKo = pickEffect(it.effect_entries, 'ko') || pickFlavor(it.flavor_text_entries, 'ko');
  return {
    id: it.id,
    nameEn,
    nameKo,
    descriptionEn: descEn,
    descriptionKo: descKo,
    effectMult: null,
  };
}
