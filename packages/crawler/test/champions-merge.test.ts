import { describe, expect, it } from 'vitest';
import { mergeModTable } from '../src/showdown/merge.js';

describe('mergeModTable', () => {
  it('keeps base-only entries unchanged', () => {
    const base = { tackle: { basePower: 40, category: 'Physical' } };
    const mod = {};
    expect(mergeModTable(base, mod)).toEqual(base);
  });

  it('overrides basePower when mod has inherit:true', () => {
    const base = { anchorshot: { basePower: 80, type: 'Steel' } };
    const mod = { anchorshot: { inherit: true, basePower: 90 } };
    const result = mergeModTable(base, mod);
    expect((result.anchorshot as Record<string, unknown>).basePower).toBe(90);
    expect((result.anchorshot as Record<string, unknown>).type).toBe('Steel');
  });

  it('strips the inherit key from output', () => {
    const base = { tackle: { basePower: 40 } };
    const mod = { tackle: { inherit: true, pp: 30 } };
    const result = mergeModTable(base, mod);
    expect('inherit' in (result.tackle as Record<string, unknown>)).toBe(false);
  });

  it('fully replaces entry when mod has no inherit', () => {
    const base = { move: { basePower: 40, type: 'Normal' } };
    const mod = { move: { basePower: 99 } };
    const result = mergeModTable(base, mod);
    expect((result.move as Record<string, unknown>).type).toBeUndefined();
    expect((result.move as Record<string, unknown>).basePower).toBe(99);
  });

  it('adds mod-only entries (e.g. new Champions moves)', () => {
    const base = {};
    const mod = { newmove: { inherit: true, basePower: 100 } };
    const result = mergeModTable(base, mod);
    expect(result.newmove).toBeDefined();
    expect('inherit' in (result.newmove as Record<string, unknown>)).toBe(false);
  });

  it('sets isNonstandard null to mark Champions-legal items', () => {
    const base = { lifeorb: { isNonstandard: 'Unobtainable', name: 'Life Orb' } };
    const mod = { lifeorb: { inherit: true, isNonstandard: null } };
    const result = mergeModTable(base, mod);
    expect((result.lifeorb as Record<string, unknown>).isNonstandard).toBeNull();
  });
});
