import { z } from 'zod';

export const ItemEffectMult = z.record(z.string(), z.number());
export type ItemEffectMult = z.infer<typeof ItemEffectMult>;

export const Item = z.object({
  id: z.number().int().positive(),
  nameEn: z.string(),
  nameKo: z.string(),
  descriptionEn: z.string().optional(),
  descriptionKo: z.string().optional(),
  effectMult: ItemEffectMult.nullable().optional(),
});
export type Item = z.infer<typeof Item>;
