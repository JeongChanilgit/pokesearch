import { describe, expect, it } from 'vitest';
import { hpStat, otherStat } from '../src/stat';

describe('hpStat', () => {
  it('Mega Altaria HP @ level 50 (B=75, IV=31, EV=4) → 151', () => {
    expect(hpStat(75, 31, 4, 50)).toBe(151);
  });

  it('Mega Altaria HP @ level 100 (B=75, IV=31, EV=4) → 292', () => {
    expect(hpStat(75, 31, 4, 100)).toBe(292);
  });

  it('minimum investment (IV 0, EV 0) @ level 50', () => {
    expect(hpStat(75, 0, 0, 50)).toBe(135);
  });

  it('maximum investment (IV 31, EV 252) @ level 50', () => {
    expect(hpStat(75, 31, 252, 50)).toBe(182);
  });

  it('EVs floor at 4-step granularity (EV 3 → same as EV 0)', () => {
    expect(hpStat(75, 31, 3, 50)).toBe(hpStat(75, 31, 0, 50));
  });

  it('throws TypeError on negative base', () => {
    expect(() => hpStat(-1, 31, 0, 50)).toThrow(TypeError);
  });

  it('throws TypeError on negative IV', () => {
    expect(() => hpStat(75, -1, 0, 50)).toThrow(TypeError);
  });

  it('throws TypeError on negative EV', () => {
    expect(() => hpStat(75, 31, -4, 50)).toThrow(TypeError);
  });

  it('throws TypeError on negative level', () => {
    expect(() => hpStat(75, 31, 0, -50)).toThrow(TypeError);
  });

  it('throws TypeError on NaN', () => {
    expect(() => hpStat(NaN, 31, 0, 50)).toThrow(TypeError);
  });
});

describe('otherStat', () => {
  it('Mega Altaria C @ level 50 (B=110, IV=31, EV=244, boost) → 177', () => {
    expect(otherStat(110, 31, 244, 50, 'boost')).toBe(177);
  });

  it('Mega Altaria S @ level 50 (B=80, IV=31, EV=0, reduce) → 90', () => {
    expect(otherStat(80, 31, 0, 50, 'reduce')).toBe(90);
  });

  it('Mega Altaria C @ level 100 (boost) → 348', () => {
    expect(otherStat(110, 31, 244, 100, 'boost')).toBe(348);
  });

  it('Mega Altaria S @ level 100 (reduce) → 176', () => {
    expect(otherStat(80, 31, 0, 100, 'reduce')).toBe(176);
  });

  it('neutral nature at base 100, IV 31, EV 0, level 50 → 120', () => {
    expect(otherStat(100, 31, 0, 50, 'neutral')).toBe(120);
  });

  it('boost 1.1 multiplier applied after raw floor', () => {
    // base 100, IV 31, EV 252, level 50: raw = ⌊(294)/2⌋+5 = 152 → ⌊152×1.1⌋ = 167
    expect(otherStat(100, 31, 252, 50, 'boost')).toBe(167);
  });

  it('reduce 0.9 multiplier', () => {
    // base 100, IV 31, EV 0, level 50: raw 120 → ⌊120×0.9⌋ = 108
    expect(otherStat(100, 31, 0, 50, 'reduce')).toBe(108);
  });

  it('throws TypeError on negative base', () => {
    expect(() => otherStat(-10, 31, 0, 50, 'neutral')).toThrow(TypeError);
  });

  it('throws TypeError on negative level', () => {
    expect(() => otherStat(100, 31, 0, -1, 'neutral')).toThrow(TypeError);
  });

  it('throws TypeError on negative EV', () => {
    expect(() => otherStat(100, 31, -5, 50, 'neutral')).toThrow(TypeError);
  });

  it('throws TypeError on negative IV', () => {
    expect(() => otherStat(100, -5, 0, 50, 'neutral')).toThrow(TypeError);
  });
});
