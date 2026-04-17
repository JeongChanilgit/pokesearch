import type { NatureEffect } from './types';

export const NATURE_MULTIPLIER: Record<NatureEffect, number> = {
  boost: 1.1,
  neutral: 1.0,
  reduce: 0.9,
};

export function natureMultiplier(effect: NatureEffect): number {
  return NATURE_MULTIPLIER[effect];
}
