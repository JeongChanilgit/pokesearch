import type { StatKey as PrismaStatKey } from '@pokesearch/db';
import type { TypeName } from '@pokesearch/types';

export const VIEW_DEDUP_COOKIE_PREFIX = 'viewed_';
export const VIEW_DEDUP_MAX_AGE_SECONDS = 60 * 30;

const PRISMA_TO_SHORT: Record<PrismaStatKey, 'h' | 'a' | 'b' | 'c' | 'd' | 's'> = {
  hp: 'h',
  atk: 'a',
  def: 'b',
  spa: 'c',
  spd: 'd',
  spe: 's',
};

export function prismaStatToShort(
  key: PrismaStatKey | null,
): 'h' | 'a' | 'b' | 'c' | 'd' | 's' | null {
  return key ? PRISMA_TO_SHORT[key] : null;
}

export function normalizeTypes(types: string[]): TypeName[] {
  return types.map((t) => t.toLowerCase() as TypeName);
}

export function normalizeType(type: string): TypeName {
  return type.toLowerCase() as TypeName;
}
