import { natureMultiplier } from './nature';
import type { NatureEffect } from './types';

function assertNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite number, got ${value}`);
  }
}

export function hpStat(base: number, iv: number, ev: number, level: number): number {
  assertNonNegative(base, 'base');
  assertNonNegative(iv, 'iv');
  assertNonNegative(ev, 'ev');
  assertNonNegative(level, 'level');
  return (
    Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10
  );
}

export function otherStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  nature: NatureEffect,
): number {
  assertNonNegative(base, 'base');
  assertNonNegative(iv, 'iv');
  assertNonNegative(ev, 'ev');
  assertNonNegative(level, 'level');
  const raw =
    Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  return Math.floor(raw * natureMultiplier(nature));
}
