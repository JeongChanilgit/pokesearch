import { z } from 'zod';
import { TypeName, Level, AttackingCategory, MoveCategory } from './common';
import { PokemonFull, PokemonSuggestion } from './pokemon';

export const QuickSearchRequest = z.object({
  q: z.string().min(1).max(32),
  level: Level.optional().default(50),
});
export type QuickSearchRequest = z.infer<typeof QuickSearchRequest>;
export type QuickSearchInput = z.input<typeof QuickSearchRequest>;

export const StatRange = z.object({
  min: z.number().int().nonnegative(),
  norm: z.number().int().nonnegative(),
  high: z.number().int().nonnegative(),
  max: z.number().int().nonnegative(),
});
export type StatRange = z.infer<typeof StatRange>;

export const QuickSearchMove = z.object({
  id: z.number().int(),
  nameEn: z.string(),
  nameKo: z.string(),
  type: TypeName,
  category: MoveCategory,
  power: z.number().int().positive().nullable(),
  accuracy: z.number().int().nonnegative().nullable(),
  shortDescEn: z.string().optional().nullable(),
  shortDescKo: z.string().optional().nullable(),
  damage: StatRange.nullable(),
});
export type QuickSearchMove = z.infer<typeof QuickSearchMove>;

export const QuickSearchPokemon = PokemonFull.extend({
  weaknesses: z.array(TypeName),
  resistances: z.array(TypeName),
  immunities: z.array(TypeName),
});
export type QuickSearchPokemon = z.infer<typeof QuickSearchPokemon>;

export const QuickSearchResponse = z.object({
  pokemon: QuickSearchPokemon.nullable(),
  bulk: z
    .object({
      physical: StatRange,
      special: StatRange,
    })
    .optional(),
  speed: StatRange.optional(),
  moves: z.array(QuickSearchMove),
});
export type QuickSearchResponse = z.infer<typeof QuickSearchResponse>;

export const SuggestPokemonRequest = z.object({
  q: z.string().min(1).max(32),
  limit: z.number().int().min(1).max(20).optional().default(10),
});
export type SuggestPokemonRequest = z.infer<typeof SuggestPokemonRequest>;
export type SuggestPokemonInput = z.input<typeof SuggestPokemonRequest>;

export const SuggestPokemonResponse = z.object({
  items: z.array(PokemonSuggestion),
});
export type SuggestPokemonResponse = z.infer<typeof SuggestPokemonResponse>;
