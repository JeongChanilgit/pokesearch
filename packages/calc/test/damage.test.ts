import { describe, expect, it } from 'vitest';
import { damageOutput } from '../src/damage';

describe('damageOutput', () => {
  it('Mega Altaria Hyper Voice (177 × 90 × 1.5 × 1.2 × 1.3) → 37,276', () => {
    expect(
      damageOutput({
        attackStat: 177,
        movePower: 90,
        isSTAB: true,
        abilityMultiplier: 1.2,
        itemMultiplier: 1.3,
      }),
    ).toBe(37276);
  });

  it('no STAB, no ability, no item → ⌊attack × power⌋', () => {
    expect(
      damageOutput({ attackStat: 100, movePower: 80, isSTAB: false }),
    ).toBe(8000);
  });

  it('STAB multiplies by 1.5', () => {
    expect(
      damageOutput({ attackStat: 100, movePower: 80, isSTAB: true }),
    ).toBe(12000);
  });

  it('Adaptability replaces STAB 1.5 with 2.0 (does not stack)', () => {
    const dmg = damageOutput({
      attackStat: 100,
      movePower: 80,
      isSTAB: true,
      hasAdaptability: true,
    });
    expect(dmg).toBe(16000);
    expect(dmg).not.toBe(24000);
  });

  it('Adaptability without STAB has no effect', () => {
    expect(
      damageOutput({
        attackStat: 100,
        movePower: 80,
        isSTAB: false,
        hasAdaptability: true,
      }),
    ).toBe(8000);
  });

  it('Life Orb (×1.3) only', () => {
    expect(
      damageOutput({
        attackStat: 100,
        movePower: 80,
        isSTAB: false,
        itemMultiplier: 1.3,
      }),
    ).toBe(10400);
  });

  it('ability (×1.5) only', () => {
    expect(
      damageOutput({
        attackStat: 100,
        movePower: 80,
        isSTAB: false,
        abilityMultiplier: 1.5,
      }),
    ).toBe(12000);
  });

  it('ability and item stack', () => {
    expect(
      damageOutput({
        attackStat: 100,
        movePower: 80,
        isSTAB: false,
        abilityMultiplier: 1.5,
        itemMultiplier: 1.3,
      }),
    ).toBe(15600);
  });

  it('zero move power → 0', () => {
    expect(
      damageOutput({ attackStat: 100, movePower: 0, isSTAB: true }),
    ).toBe(0);
  });

  it('throws TypeError on negative attackStat', () => {
    expect(() =>
      damageOutput({ attackStat: -1, movePower: 80, isSTAB: false }),
    ).toThrow(TypeError);
  });

  it('throws TypeError on negative movePower', () => {
    expect(() =>
      damageOutput({ attackStat: 100, movePower: -1, isSTAB: false }),
    ).toThrow(TypeError);
  });

  it('throws TypeError on negative abilityMultiplier', () => {
    expect(() =>
      damageOutput({
        attackStat: 100,
        movePower: 80,
        isSTAB: false,
        abilityMultiplier: -1,
      }),
    ).toThrow(TypeError);
  });

  it('throws TypeError on negative itemMultiplier', () => {
    expect(() =>
      damageOutput({
        attackStat: 100,
        movePower: 80,
        isSTAB: false,
        itemMultiplier: -1,
      }),
    ).toThrow(TypeError);
  });
});
