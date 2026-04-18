import { describe, expect, it } from 'vitest';
import { spriteUrl } from '../src/sprites';

describe('spriteUrl', () => {
  it('returns local path for base form (charizard)', () => {
    expect(spriteUrl('charizard')).toBe('/sprites/pokemon/charizard.png');
  });

  it('returns local path for mega-x form (charizardmegax)', () => {
    expect(spriteUrl('charizardmegax')).toBe('/sprites/pokemon/charizardmegax.png');
  });

  it('returns local path for regional form (rattataalola)', () => {
    expect(spriteUrl('rattataalola')).toBe('/sprites/pokemon/rattataalola.png');
  });

  it('returns local path for mega-y form (charizardmegay)', () => {
    expect(spriteUrl('charizardmegay')).toBe('/sprites/pokemon/charizardmegay.png');
  });

  it('returns local path for galarian form (slowbrogalar)', () => {
    expect(spriteUrl('slowbrogalar')).toBe('/sprites/pokemon/slowbrogalar.png');
  });

  it('returns local path for primal form (kyogreprimal)', () => {
    expect(spriteUrl('kyogreprimal')).toBe('/sprites/pokemon/kyogreprimal.png');
  });
});
