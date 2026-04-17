import type { TypeName } from './types';

export interface AbilityLookupKey {
  abilityNameEn: string;
  moveType?: TypeName | string;
  moveCategory?: 'physical' | 'special' | 'status';
}

export interface AbilityReclassification {
  newType?: TypeName;
  powerMultiplier?: number;
}

type StaticRule = {
  multiplier?: number;
  matchType?: TypeName | 'normal';
  reclassifyTypeFrom?: TypeName | 'normal';
  reclassifyTypeTo?: TypeName;
};

const ABILITY_RULES: Record<string, StaticRule[]> = {
  pixilate: [
    { reclassifyTypeFrom: 'normal', reclassifyTypeTo: 'fairy', multiplier: 1.2 },
  ],
  aerilate: [
    { reclassifyTypeFrom: 'normal', reclassifyTypeTo: 'flying', multiplier: 1.2 },
  ],
  refrigerate: [
    { reclassifyTypeFrom: 'normal', reclassifyTypeTo: 'ice', multiplier: 1.2 },
  ],
  'pixel power': [
    { reclassifyTypeFrom: 'normal', reclassifyTypeTo: 'fairy', multiplier: 1.3 },
  ],
  'sand force': [{ matchType: 'rock', multiplier: 1.3 }],
  'iron fist': [{ multiplier: 1.2 }],
  'tough claws': [{ multiplier: 1.3 }],
  'strong jaw': [{ multiplier: 1.5 }],
  'mega launcher': [{ multiplier: 1.5 }],
  'sheer force': [{ multiplier: 1.3 }],
  'technician': [{ multiplier: 1.5 }],
  'huge power': [{ multiplier: 2.0 }],
  'pure power': [{ multiplier: 2.0 }],
};

export function abilityMultiplier(
  abilityNameEn: string,
  moveType: string,
): number {
  const key = abilityNameEn.toLowerCase();
  const rules = ABILITY_RULES[key];
  if (!rules) return 1;
  let mult = 1;
  for (const r of rules) {
    if (r.reclassifyTypeFrom && moveType === r.reclassifyTypeTo) {
      // after reclassification, the move's type equals the target
      if (r.multiplier) mult *= r.multiplier;
    } else if (r.matchType && r.matchType === moveType) {
      if (r.multiplier) mult *= r.multiplier;
    } else if (!r.reclassifyTypeFrom && !r.matchType && r.multiplier) {
      mult *= r.multiplier;
    }
  }
  return mult;
}

export function reclassifyMoveType(
  abilityNameEn: string,
  moveType: string,
): string {
  const key = abilityNameEn.toLowerCase();
  const rules = ABILITY_RULES[key];
  if (!rules) return moveType;
  for (const r of rules) {
    if (r.reclassifyTypeFrom && r.reclassifyTypeTo && moveType === r.reclassifyTypeFrom) {
      return r.reclassifyTypeTo;
    }
  }
  return moveType;
}
