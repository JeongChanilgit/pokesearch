import { z } from 'zod';

export const Ability = z.object({
  id: z.number().int().positive(),
  nameEn: z.string(),
  nameKo: z.string(),
  descriptionEn: z.string().optional(),
  descriptionKo: z.string().optional(),
});
export type Ability = z.infer<typeof Ability>;

export const ListAbilitiesRequest = z.object({
  pokemonId: z.number().int().positive().optional(),
});
export type ListAbilitiesRequest = z.infer<typeof ListAbilitiesRequest>;
export type ListAbilitiesInput = z.input<typeof ListAbilitiesRequest>;

export const ListAbilitiesResponse = z.object({
  items: z.array(Ability),
});
export type ListAbilitiesResponse = z.infer<typeof ListAbilitiesResponse>;
