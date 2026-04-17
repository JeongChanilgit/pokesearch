import { describe, it, expect } from 'vitest';
import { abilityMultiplier, reclassifyMoveType } from '../src/ability-multipliers';

describe('abilityMultiplier', () => {
  it('returns 1 for an unknown ability', () => {
    expect(abilityMultiplier('Does Not Exist', 'fairy')).toBe(1);
  });

  it('applies Pixilate 1.2× to a normal-move reclassified to fairy', () => {
    expect(abilityMultiplier('Pixilate', 'fairy')).toBeCloseTo(1.2);
  });

  it('applies Technician 1.5× regardless of move type', () => {
    expect(abilityMultiplier('Technician', 'water')).toBeCloseTo(1.5);
    expect(abilityMultiplier('Technician', 'psychic')).toBeCloseTo(1.5);
  });

  it('applies Sand Force 1.3× only to matching type', () => {
    expect(abilityMultiplier('Sand Force', 'rock')).toBeCloseTo(1.3);
    expect(abilityMultiplier('Sand Force', 'water')).toBe(1);
  });

  it('applies Huge Power 2.0×', () => {
    expect(abilityMultiplier('Huge Power', 'fighting')).toBeCloseTo(2);
  });
});

describe('reclassifyMoveType', () => {
  it('passes through when the ability does not reclassify', () => {
    expect(reclassifyMoveType('Technician', 'normal')).toBe('normal');
  });

  it('rewrites normal → fairy under Pixilate', () => {
    expect(reclassifyMoveType('Pixilate', 'normal')).toBe('fairy');
  });

  it('rewrites normal → flying under Aerilate but leaves other types alone', () => {
    expect(reclassifyMoveType('Aerilate', 'normal')).toBe('flying');
    expect(reclassifyMoveType('Aerilate', 'fire')).toBe('fire');
  });
});
