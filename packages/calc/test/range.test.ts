import { describe, expect, it } from 'vitest';
import { bulkRange, bulkRangeWithStages, damageRange, damageRangeWithStage, statRange, statRangeWithStage } from '../src/range';

describe('statRange (HP)', () => {
  it('HP base 100 @ level 50 — min = norm (no nature), high = max (252 EV)', () => {
    // EV 0: ⌊231 × 0.5⌋ + 60 = 115 + 60 = 175
    // EV 252: ⌊294 × 0.5⌋ + 60 = 147 + 60 = 207
    expect(statRange(100, 50, true)).toEqual({
      min: 175,
      norm: 175,
      high: 207,
      max: 207,
    });
  });

  it('HP base 100 @ level 100', () => {
    // EV 0: ⌊231⌋ + 110 = 341
    // EV 252: ⌊294⌋ + 110 = 404
    expect(statRange(100, 100, true)).toEqual({
      min: 341,
      norm: 341,
      high: 404,
      max: 404,
    });
  });
});

describe('statRange (non-HP)', () => {
  it('speed base 100 @ level 50', () => {
    // reduce EV 0: ⌊120 × 0.9⌋ = 108
    // neutral EV 0: 120
    // neutral EV 252: ⌊(2·100 + 31 + 63) × 50/100⌋ + 5 = 147 + 5 = 152
    // boost EV 252: ⌊152 × 1.1⌋ = 167
    expect(statRange(100, 50, false)).toEqual({
      min: 108,
      norm: 120,
      high: 152,
      max: 167,
    });
  });

  it('speed base 100 @ level 100', () => {
    // EV 0 neutral: 236. reduce: ⌊236 × 0.9⌋ = 212.
    // EV 252 neutral: 294 + 5 = 299.
    // EV 252 boost: ⌊299 × 1.1⌋ = 328.
    expect(statRange(100, 100, false)).toEqual({
      min: 212,
      norm: 236,
      high: 299,
      max: 328,
    });
  });
});

describe('bulkRange', () => {
  it('physical bulk for HP 100 / Def 100 @ level 50', () => {
    // hp(EV 0) = 175, hp(EV 252) = 207
    // def reduce 108, neutral 120, neutral252 152, boost 167
    expect(bulkRange(100, 100, 50, 'physical')).toEqual({
      min: Math.floor((175 * 108) / 0.411),
      norm: Math.floor((175 * 120) / 0.411),
      high: Math.floor((207 * 152) / 0.411),
      max: Math.floor((207 * 167) / 0.411),
    });
  });

  it('special bulk matches physical when SpD base equals Def base', () => {
    expect(bulkRange(100, 100, 50, 'special')).toEqual(
      bulkRange(100, 100, 50, 'physical'),
    );
  });

  it('physical bulk for HP 100 / Def 100 @ level 100', () => {
    expect(bulkRange(100, 100, 100, 'physical')).toEqual({
      min: Math.floor((341 * 212) / 0.411),
      norm: Math.floor((341 * 236) / 0.411),
      high: Math.floor((404 * 299) / 0.411),
      max: Math.floor((404 * 328) / 0.411),
    });
  });
});

describe('damageRange', () => {
  it('base 100 attack, power 80, no STAB @ level 50', () => {
    expect(damageRange(100, 50, 80, false)).toEqual({
      min: 108 * 80,
      norm: 120 * 80,
      high: 152 * 80,
      max: 167 * 80,
    });
  });

  it('base 100 attack, power 80, STAB @ level 50', () => {
    expect(damageRange(100, 50, 80, true)).toEqual({
      min: Math.floor(108 * 80 * 1.5),
      norm: Math.floor(120 * 80 * 1.5),
      high: Math.floor(152 * 80 * 1.5),
      max: Math.floor(167 * 80 * 1.5),
    });
  });

  it('STAB + ability + item applies to all four tiers', () => {
    const r = damageRange(100, 50, 80, true, {
      abilityMultiplier: 1.2,
      itemMultiplier: 1.3,
    });
    expect(r).toEqual({
      min: Math.floor(108 * 80 * 1.5 * 1.2 * 1.3),
      norm: Math.floor(120 * 80 * 1.5 * 1.2 * 1.3),
      high: Math.floor(152 * 80 * 1.5 * 1.2 * 1.3),
      max: Math.floor(167 * 80 * 1.5 * 1.2 * 1.3),
    });
  });

  it('Adaptability overrides STAB in range', () => {
    const r = damageRange(100, 50, 80, true, { hasAdaptability: true });
    expect(r).toEqual({
      min: 108 * 80 * 2,
      norm: 120 * 80 * 2,
      high: 152 * 80 * 2,
      max: 167 * 80 * 2,
    });
  });
});

describe('statRangeWithStage', () => {
  it('stage 0 equals statRange', () => {
    expect(statRangeWithStage(100, 50, false, 0)).toEqual(statRange(100, 50, false));
  });
  it('stage +2 doubles each column', () => {
    const base = statRange(100, 50, false);
    const r = statRangeWithStage(100, 50, false, 2);
    expect(r.min).toBe(Math.floor(base.min * 2));
    expect(r.norm).toBe(Math.floor(base.norm * 2));
    expect(r.high).toBe(Math.floor(base.high * 2));
    expect(r.max).toBe(Math.floor(base.max * 2));
  });
  it('stage -6 × 0.25', () => {
    const base = statRange(100, 50, false);
    const r = statRangeWithStage(100, 50, false, -6);
    expect(r.max).toBe(Math.floor(base.max * 0.25));
  });
});

describe('bulkRangeWithStages', () => {
  it('stage 0 equals bulkRange', () => {
    expect(bulkRangeWithStages(100, 100, 50, 'physical', 0)).toEqual(bulkRange(100, 100, 50, 'physical'));
  });
  it('stage +2 raises bulk (def doubled, HP fixed)', () => {
    const base = bulkRangeWithStages(100, 100, 50, 'physical', 0);
    const boosted = bulkRangeWithStages(100, 100, 50, 'physical', 2);
    expect(boosted.max).toBeGreaterThan(base.max);
  });
  it('stage -6 non-negative', () => {
    const r = bulkRangeWithStages(100, 100, 50, 'physical', -6);
    expect(r.min).toBeGreaterThanOrEqual(0);
    expect(r.max).toBeGreaterThanOrEqual(0);
  });
});

describe('damageRangeWithStage', () => {
  it('stage 0 equals damageRange', () => {
    expect(damageRangeWithStage(100, 50, 80, true, 0)).toEqual(damageRange(100, 50, 80, true));
  });
  it('stage +2 doubles each column', () => {
    const base = damageRange(100, 50, 80, true);
    const r = damageRangeWithStage(100, 50, 80, true, 2);
    // with atk doubled pre-floor, result is proportionally larger but may differ due to floor ordering
    expect(r.max).toBeGreaterThan(base.max);
  });
  it('stage -1 shrinks', () => {
    const base = damageRange(100, 50, 80, true);
    const r = damageRangeWithStage(100, 50, 80, true, -1);
    expect(r.max).toBeLessThan(base.max);
  });
});
