import { z } from 'zod';

export const Locale = z.enum(['en', 'ko']);
export type Locale = z.infer<typeof Locale>;

export const UuidSchema = z.string().uuid();
export type Uuid = z.infer<typeof UuidSchema>;

export const TypeName = z.enum([
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]);
export type TypeName = z.infer<typeof TypeName>;

export const StatKey = z.enum(['h', 'a', 'b', 'c', 'd', 's']);
export type StatKey = z.infer<typeof StatKey>;

export const Level = z.union([z.literal(50), z.literal(100)]);
export type Level = z.infer<typeof Level>;

export const MoveCategory = z.enum(['physical', 'special', 'status']);
export type MoveCategory = z.infer<typeof MoveCategory>;

export const AttackingCategory = z.enum(['physical', 'special']);
export type AttackingCategory = z.infer<typeof AttackingCategory>;

export const EVs = z.object({
  h: z.number().int().min(0).max(252),
  a: z.number().int().min(0).max(252),
  b: z.number().int().min(0).max(252),
  c: z.number().int().min(0).max(252),
  d: z.number().int().min(0).max(252),
  s: z.number().int().min(0).max(252),
});
export type EVs = z.infer<typeof EVs>;

export const IVs = z.object({
  h: z.number().int().min(0).max(31),
  a: z.number().int().min(0).max(31),
  b: z.number().int().min(0).max(31),
  c: z.number().int().min(0).max(31),
  d: z.number().int().min(0).max(31),
  s: z.number().int().min(0).max(31),
});
export type IVs = z.infer<typeof IVs>;
