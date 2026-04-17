import { describe, expect, it } from 'vitest';
import { bulkRange, damageRange, statRange } from '../src/range';

describe('statRange (HP)', () => {
  it('HP base 100 @ level 50 — min = norm (no nature), max uses 252 EV', () => {
    // EV 0: ⌊231 × 0.5⌋ + 60 = 115 + 60 = 175
    // EV 252: ⌊294 × 0.5⌋ + 60 = 147 + 60 = 207
    expect(statRange(100, 50, true)).toEqual({
      min: 175,
      norm: 175,
      max: 207,
    });
  });

  it('HP base 100 @ level 100', () => {
    // EV 0: ⌊231⌋ + 110 = 341
    // EV 252: ⌊294⌋ + 110 = 404
    expect(statRange(100, 100, true)).toEqual({
      min: 341,
      norm: 341,
      max: 404,
    });
  });
});

describe('statRange (non-HP)', () => {
  it('speed base 100 @ level 50', () => {
    // reduce EV 0: ⌊120 × 0.9⌋ = 108
    // neutral EV 0: 120
    // boost EV 252: ⌊152 × 1.1⌋ = 167
    expect(statRange(100, 50, false)).toEqual({
      min: 108,
      norm: 120,
      max: 167,
    });
  });

  it('speed base 100 @ level 100', () => {
    // EV 0 neutral: 236. reduce: ⌊236 × 0.9⌋ = 212.
    // EV 252 boost: ⌊299 × 1.1⌋ = 328.
    expect(statRange(100, 100, false)).toEqual({
      min: 212,
      norm: 236,
      max: 328,
    });
  });
});

describe('bulkRange', () => {
  it('physical bulk for HP 100 / Def 100 @ level 50', () => {
    // hp(EV 0) = 175, hp(EV 252) = 207
    // def reduce 108, neutral 120, boost 167
    // min = ⌊175 × 108 / 0.411⌋ = 45985
    // norm = ⌊175 × 120 / 0.411⌋ = 51094
    // max = ⌊207 × 167 / 0.411⌋ = 84109
    expect(bulkRange(100, 100, 50, 'physical')).toEqual({
      min: 45985,
      norm: 51094,
      max: 84109,
    });
  });

  it('special bulk for HP 100 / SpD 100 @ level 50 matches physical pattern', () => {
    expect(bulkRange(100, 100, 50, 'special')).toEqual({
      min: 45985,
      norm: 51094,
      max: 84109,
    });
  });

  it('physical bulk for HP 100 / Def 100 @ level 100', () => {
    // hp(EV 0) = 341, hp(EV 252) = 404
    // def reduce: ⌊236 × 0.9⌋ = 212
    // def neutral: 236
    // def boost: ⌊299 × 1.1⌋ = 328
    expect(bulkRange(100, 100, 100, 'physical')).toEqual({
      min: Math.floor((341 * 212) / 0.411),
      norm: Math.floor((341 * 236) / 0.411),
      max: Math.floor((404 * 328) / 0.411),
    });
  });
});

describe('damageRange', () => {
  it('base 100 attack, power 80, no STAB @ level 50', () => {
    expect(damageRange(100, 50, 80, false)).toEqual({
      min: 108 * 80,
      norm: 120 * 80,
      max: 167 * 80,
    });
  });

  it('base 100 attack, power 80, STAB @ level 50', () => {
    expect(damageRange(100, 50, 80, true)).toEqual({
      min: Math.floor(108 * 80 * 1.5),
      norm: Math.floor(120 * 80 * 1.5),
      max: Math.floor(167 * 80 * 1.5),
    });
  });

  it('STAB + ability + item applies to all three tiers', () => {
    const r = damageRange(100, 50, 80, true, {
      abilityMultiplier: 1.2,
      itemMultiplier: 1.3,
    });
    expect(r).toEqual({
      min: Math.floor(108 * 80 * 1.5 * 1.2 * 1.3),
      norm: Math.floor(120 * 80 * 1.5 * 1.2 * 1.3),
      max: Math.floor(167 * 80 * 1.5 * 1.2 * 1.3),
    });
  });

  it('Adaptability overrides STAB in range', () => {
    const r = damageRange(100, 50, 80, true, { hasAdaptability: true });
    expect(r).toEqual({
      min: 108 * 80 * 2,
      norm: 120 * 80 * 2,
      max: 167 * 80 * 2,
    });
  });
});
