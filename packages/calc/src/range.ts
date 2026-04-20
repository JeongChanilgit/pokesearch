import { MAX_EV, PERFECT_IV } from './constants';
import { physicalBulk, specialBulk } from './bulk';
import { damageOutput } from './damage';
import { hpStat, otherStat } from './stat';
import { applyStage, type Stage } from './stage';

export interface StatRange {
  min: number;
  norm: number;
  high: number;
  max: number;
}

export function statRange(base: number, level: number, isHp: boolean): StatRange {
  if (isHp) {
    const lo = hpStat(base, PERFECT_IV, 0, level);
    const hi = hpStat(base, PERFECT_IV, MAX_EV, level);
    return { min: lo, norm: lo, high: hi, max: hi };
  }
  return {
    min: otherStat(base, PERFECT_IV, 0, level, 'reduce'),
    norm: otherStat(base, PERFECT_IV, 0, level, 'neutral'),
    high: otherStat(base, PERFECT_IV, MAX_EV, level, 'neutral'),
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
  const defNeutralMax = otherStat(defBase, PERFECT_IV, MAX_EV, level, 'neutral');
  const defBoost = otherStat(defBase, PERFECT_IV, MAX_EV, level, 'boost');
  const fn = kind === 'physical' ? physicalBulk : specialBulk;
  return {
    min: fn(hp0, defReduce),
    norm: fn(hp0, defNeutral),
    high: fn(hpFull, defNeutralMax),
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
  const atkHigh = otherStat(attackBase, PERFECT_IV, MAX_EV, level, 'neutral');
  const atkMax = otherStat(attackBase, PERFECT_IV, MAX_EV, level, 'boost');
  const calc = (atk: number) =>
    damageOutput({ attackStat: atk, movePower, isSTAB, ...opts });
  return {
    min: calc(atkMin),
    norm: calc(atkNorm),
    high: calc(atkHigh),
    max: calc(atkMax),
  };
}

export function statRangeWithStage(
  base: number,
  level: number,
  isHp: boolean,
  stage: Stage,
): StatRange {
  const base_ = statRange(base, level, isHp);
  return {
    min: applyStage(base_.min, stage),
    norm: applyStage(base_.norm, stage),
    high: applyStage(base_.high, stage),
    max: applyStage(base_.max, stage),
  };
}

export function bulkRangeWithStages(
  hpBase: number,
  defBase: number,
  level: number,
  kind: 'physical' | 'special',
  defStage: Stage,
): StatRange {
  // Recompute: apply stage to each def/spd column BEFORE bulk formula.
  // HP has no stage (fixed 0) per user decision.
  const hp0 = hpStat(hpBase, PERFECT_IV, 0, level);
  const hpFull = hpStat(hpBase, PERFECT_IV, MAX_EV, level);
  const defReduce = applyStage(otherStat(defBase, PERFECT_IV, 0, level, 'reduce'), defStage);
  const defNeutral = applyStage(otherStat(defBase, PERFECT_IV, 0, level, 'neutral'), defStage);
  const defNeutralMax = applyStage(otherStat(defBase, PERFECT_IV, MAX_EV, level, 'neutral'), defStage);
  const defBoost = applyStage(otherStat(defBase, PERFECT_IV, MAX_EV, level, 'boost'), defStage);
  const fn = kind === 'physical' ? physicalBulk : specialBulk;
  return {
    min: fn(hp0, defReduce),
    norm: fn(hp0, defNeutral),
    high: fn(hpFull, defNeutralMax),
    max: fn(hpFull, defBoost),
  };
}

export function damageRangeWithStage(
  attackBase: number,
  level: number,
  movePower: number,
  isSTAB: boolean,
  attackStage: Stage,
  opts: {
    abilityMultiplier?: number;
    itemMultiplier?: number;
    hasAdaptability?: boolean;
  } = {},
): StatRange {
  const atkMin = applyStage(otherStat(attackBase, PERFECT_IV, 0, level, 'reduce'), attackStage);
  const atkNorm = applyStage(otherStat(attackBase, PERFECT_IV, 0, level, 'neutral'), attackStage);
  const atkHigh = applyStage(otherStat(attackBase, PERFECT_IV, MAX_EV, level, 'neutral'), attackStage);
  const atkMax = applyStage(otherStat(attackBase, PERFECT_IV, MAX_EV, level, 'boost'), attackStage);
  const calc = (atk: number) =>
    damageOutput({ attackStat: atk, movePower, isSTAB, ...opts });
  return {
    min: calc(atkMin),
    norm: calc(atkNorm),
    high: calc(atkHigh),
    max: calc(atkMax),
  };
}
