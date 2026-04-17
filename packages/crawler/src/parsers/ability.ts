import type { PokeApiAbility } from '../pokeapi.js';
import { pickName } from '../pokeapi.js';

export interface ParsedAbility {
  id: number;
  nameEn: string;
  nameKo: string;
  descriptionEn: string;
  descriptionKo: string;
}

function pickFlavor(entries: PokeApiAbility['flavor_text_entries'], lang: 'en' | 'ko'): string {
  const hit = entries.find((e) => e.language.name === lang);
  return (hit?.flavor_text ?? '').replace(/[\n\f]/g, ' ').trim();
}

export function buildAbilityRow(a: PokeApiAbility): ParsedAbility | null {
  const nameEn = pickName(a.names, 'en');
  if (!nameEn) return null;
  const nameKo = pickName(a.names, 'ko') ?? nameEn;
  return {
    id: a.id,
    nameEn,
    nameKo,
    descriptionEn: pickFlavor(a.flavor_text_entries, 'en'),
    descriptionKo: pickFlavor(a.flavor_text_entries, 'ko'),
  };
}
