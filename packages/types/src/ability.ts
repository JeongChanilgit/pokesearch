import { z } from 'zod';

export const Ability = z.object({
  id: z.number().int().positive(),
  nameEn: z.string(),
  nameKo: z.string(),
  descriptionEn: z.string().optional(),
  descriptionKo: z.string().optional(),
});
export type Ability = z.infer<typeof Ability>;
