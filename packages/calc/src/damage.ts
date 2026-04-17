import { ADAPTABILITY_STAB, STAB } from './constants';

export interface DamageInput {
  attackStat: number;
  movePower: number;
  isSTAB: boolean;
  hasAdaptability?: boolean;
  abilityMultiplier?: number;
  itemMultiplier?: number;
}

function assertNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite number, got ${value}`);
  }
}

export function damageOutput(input: DamageInput): number {
  const {
    attackStat,
    movePower,
    isSTAB,
    hasAdaptability = false,
    abilityMultiplier = 1,
    itemMultiplier = 1,
  } = input;

  assertNonNegative(attackStat, 'attackStat');
  assertNonNegative(movePower, 'movePower');
  assertNonNegative(abilityMultiplier, 'abilityMultiplier');
  assertNonNegative(itemMultiplier, 'itemMultiplier');

  const stabMult = isSTAB ? (hasAdaptability ? ADAPTABILITY_STAB : STAB) : 1;

  return Math.floor(
    attackStat * movePower * stabMult * abilityMultiplier * itemMultiplier,
  );
}
