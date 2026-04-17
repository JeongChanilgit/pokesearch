import { describe, expect, it } from 'vitest';
import { physicalBulk, specialBulk } from '../src/bulk';

describe('physicalBulk', () => {
  it('Reuniclus (HP 215, Def 75) → 39,233', () => {
    expect(physicalBulk(215, 75)).toBe(39233);
  });

  it('minimum bulk (1, 1) → 2', () => {
    // ⌊1 × 1 / 0.411⌋ = ⌊2.433…⌋ = 2
    expect(physicalBulk(1, 1)).toBe(2);
  });

  it('zero HP → 0', () => {
    expect(physicalBulk(0, 100)).toBe(0);
  });

  it('throws TypeError on negative HP', () => {
    expect(() => physicalBulk(-1, 100)).toThrow(TypeError);
  });

  it('throws TypeError on negative Def', () => {
    expect(() => physicalBulk(100, -1)).toThrow(TypeError);
  });
});

describe('specialBulk', () => {
  it('Reuniclus (HP 215, SpD 85) → 44,464', () => {
    expect(specialBulk(215, 85)).toBe(44464);
  });

  it('minimum bulk (1, 1) → 2', () => {
    expect(specialBulk(1, 1)).toBe(2);
  });

  it('zero SpD → 0', () => {
    expect(specialBulk(100, 0)).toBe(0);
  });

  it('throws TypeError on NaN HP', () => {
    expect(() => specialBulk(NaN, 100)).toThrow(TypeError);
  });

  it('throws TypeError on negative SpD', () => {
    expect(() => specialBulk(100, -5)).toThrow(TypeError);
  });
});
