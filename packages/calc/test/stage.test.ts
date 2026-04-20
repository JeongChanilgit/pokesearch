import { describe, expect, it } from 'vitest';
import { applyStage, stageMultiplier } from '../src/stage';

describe('stageMultiplier', () => {
  it('stage 0 → 1 (no change)', () => {
    expect(stageMultiplier(0)).toBe(1);
  });

  it('stage 6 → 4 (maximum boost)', () => {
    expect(stageMultiplier(6)).toBe(4);
  });

  it('stage -6 → 0.25 (maximum drop)', () => {
    expect(stageMultiplier(-6)).toBe(0.25);
  });

  it('stage 2 → 2', () => {
    expect(stageMultiplier(2)).toBe(2);
  });

  it('stage -2 → 0.5', () => {
    expect(stageMultiplier(-2)).toBe(0.5);
  });

  it('throws TypeError for stage 7 (above max)', () => {
    expect(() => stageMultiplier(7)).toThrow(TypeError);
  });

  it('throws TypeError for stage -7 (below min)', () => {
    expect(() => stageMultiplier(-7)).toThrow(TypeError);
  });

  it('throws TypeError for non-integer stage (1.5)', () => {
    expect(() => stageMultiplier(1.5)).toThrow(TypeError);
  });
});

describe('applyStage', () => {
  it('applyStage(100, 0) → 100 (no change)', () => {
    expect(applyStage(100, 0)).toBe(100);
  });

  it('applyStage(100, 6) → 400 (maximum boost)', () => {
    expect(applyStage(100, 6)).toBe(400);
  });

  it('applyStage(100, -6) → 25 (maximum drop)', () => {
    expect(applyStage(100, -6)).toBe(25);
  });

  it('applyStage(152, 1) → 228 (152 × 1.5 = 228)', () => {
    expect(applyStage(152, 1)).toBe(228);
  });

  it('applyStage(100, -1) → 66 (Math.floor(100 × 2/3))', () => {
    expect(applyStage(100, -1)).toBe(Math.floor(100 * 2 / 3));
    expect(applyStage(100, -1)).toBe(66);
  });

  it('throws TypeError for negative value', () => {
    expect(() => applyStage(-1, 0)).toThrow(TypeError);
  });
});
