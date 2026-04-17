import type { PokeApiMove } from '../pokeapi.js';
import { pickName } from '../pokeapi.js';

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

export function buildMoveRow(m: PokeApiMove): ParsedMove | null {
  const nameEn = pickName(m.names, 'en');
  if (!nameEn) return null;
  const nameKo = pickName(m.names, 'ko') ?? nameEn;
  const category = m.damage_class.name;
  if (category !== 'physical' && category !== 'special' && category !== 'status') {
    return null;
  }
  return {
    id: m.id,
    nameEn,
    nameKo,
    type: m.type.name,
    category,
    power: m.power,
    accuracy: m.accuracy,
    pp: m.pp,
  };
}
