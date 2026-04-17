import { BULK_COEFFICIENT } from './constants';

function assertNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite number, got ${value}`);
  }
}

export function physicalBulk(hp: number, def: number): number {
  assertNonNegative(hp, 'hp');
  assertNonNegative(def, 'def');
  return Math.floor((hp * def) / BULK_COEFFICIENT);
}

export function specialBulk(hp: number, spd: number): number {
  assertNonNegative(hp, 'hp');
  assertNonNegative(spd, 'spd');
  return Math.floor((hp * spd) / BULK_COEFFICIENT);
}
