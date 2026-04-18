import { z } from 'zod';
import { TypeName, MoveCategory } from './common';

export const Move = z.object({
  id: z.number().int().positive(),
  nameEn: z.string(),
  nameKo: z.string(),
  type: TypeName,
  category: MoveCategory,
  power: z.number().int().nonnegative().nullable(),
  accuracy: z.number().int().nonnegative().nullable(),
  pp: z.number().int().positive(),
  shortDescEn: z.string().optional().nullable(),
  shortDescKo: z.string().optional().nullable(),
});
export type Move = z.infer<typeof Move>;

export const GetPokemonMovesRequest = z.object({
  pokemonId: z.number().int().positive(),
});
export type GetPokemonMovesRequest = z.infer<typeof GetPokemonMovesRequest>;

export const GetPokemonMovesResponse = z.object({
  moves: z.array(Move),
});
export type GetPokemonMovesResponse = z.infer<typeof GetPokemonMovesResponse>;
