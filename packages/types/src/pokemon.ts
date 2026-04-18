import { z } from 'zod';
import { TypeName } from './common';

export const PokemonSummary = z.object({
  id: z.number().int().positive(),
  nameEn: z.string(),
  nameKo: z.string(),
  types: z.array(TypeName).min(1).max(2),
  spriteUrl: z.string(),
});
export type PokemonSummary = z.infer<typeof PokemonSummary>;

export const PokemonFull = PokemonSummary.extend({
  baseH: z.number().int(),
  baseA: z.number().int(),
  baseB: z.number().int(),
  baseC: z.number().int(),
  baseD: z.number().int(),
  baseS: z.number().int(),
  formOf: z.number().int().nullable(),
});
export type PokemonFull = z.infer<typeof PokemonFull>;

export const GetPokemonRequest = z.object({
  pokemonId: z.number().int().positive(),
});
export type GetPokemonRequest = z.infer<typeof GetPokemonRequest>;

export const GetPokemonResponse = PokemonFull;
export type GetPokemonResponse = z.infer<typeof GetPokemonResponse>;

export const PokemonSuggestion = z.object({
  id: z.number().int().positive(),
  nameEn: z.string(),
  nameKo: z.string(),
  spriteUrl: z.string(),
});
export type PokemonSuggestion = z.infer<typeof PokemonSuggestion>;

export const ListPokemonsRequest = z.object({
  q: z.string().max(32).optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  cursor: z.number().int().optional(),
});
export type ListPokemonsRequest = z.infer<typeof ListPokemonsRequest>;
export type ListPokemonsInput = z.input<typeof ListPokemonsRequest>;

export const ListPokemonsResponse = z.object({
  items: z.array(PokemonSummary),
  nextCursor: z.number().int().nullable(),
});
export type ListPokemonsResponse = z.infer<typeof ListPokemonsResponse>;
