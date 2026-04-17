import { MAX_EV, PERFECT_IV } from './constants';
import { physicalBulk, specialBulk } from './bulk';
import { damageOutput } from './damage';
import { hpStat, otherStat } from './stat';

export interface StatRange {
  min: number;
  norm: number;
  max: number;
}

export function statRange(base: number, level: number, isHp: boolean): StatRange {
  if (isHp) {
    const lo = hpStat(base, PERFECT_IV, 0, level);
    const hi = hpStat(base, PERFECT_IV, MAX_EV, level);
    return { min: lo, norm: lo, max: hi };
  }
  return {
    min: otherStat(base, PERFECT_IV, 0, level, 'reduce'),
    norm: otherStat(base, PERFECT_IV, 0, level, 'neutral'),
    max: otherStat(base, PERFECT_IV, MAX_EV, level, 'boost'),
  };
}

export function bulkRange(
  hpBase: number,
  defBase: number,
  level: number,
  kind: 'physical' | 'special',
): StatRange {
  const hp0 = hpStat(hpBase, PERFECT_IV, 0, level);
  const hpFull = hpStat(hpBase, PERFECT_IV, MAX_EV, level);
  const defReduce = otherStat(defBase, PERFECT_IV, 0, level, 'reduce');
  const defNeutral = otherStat(defBase, PERFECT_IV, 0, level, 'neutral');
  const defBoost = otherStat(defBase, PERFECT_IV, MAX_EV, level, 'boost');
  const fn = kind === 'physical' ? physicalBulk : specialBulk;
  return {
    min: fn(hp0, defReduce),
    norm: fn(hp0, defNeutral),
    max: fn(hpFull, defBoost),
  };
}

export function damageRange(
  attackBase: number,
  level: number,
  movePower: number,
  isSTAB: boolean,
  opts: {
    abilityMultiplier?: number;
    itemMultiplier?: number;
    hasAdaptability?: boolean;
  } = {},
): StatRange {
  const atkMin = otherStat(attackBase, PERFECT_IV, 0, level, 'reduce');
  const atkNorm = otherStat(attackBase, PERFECT_IV, 0, level, 'neutral');
  const atkMax = otherStat(attackBase, PERFECT_IV, MAX_EV, level, 'boost');
  const calc = (atk: number) =>
    damageOutput({ attackStat: atk, movePower, isSTAB, ...opts });
  return { min: calc(atkMin), norm: calc(atkNorm), max: calc(atkMax) };
}
