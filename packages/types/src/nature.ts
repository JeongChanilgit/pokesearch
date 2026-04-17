import { z } from 'zod';
import { StatKey } from './common';

export const Nature = z.object({
  id: z.number().int().min(1).max(25),
  nameEn: z.string(),
  nameKo: z.string(),
  boostStat: StatKey.nullable(),
  reduceStat: StatKey.nullable(),
});
export type Nature = z.infer<typeof Nature>;

export const ListNaturesResponse = z.object({
  items: z.array(Nature),
});
export type ListNaturesResponse = z.infer<typeof ListNaturesResponse>;
