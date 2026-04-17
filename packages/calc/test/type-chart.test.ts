import { describe, expect, it } from 'vitest';
import {
  effectivenessAgainst,
  getImmunities,
  getResistances,
  getWeaknesses,
  typeEffectiveness,
} from '../src/type-chart';

describe('typeEffectiveness (single type)', () => {
  it('fire → grass = 2', () => {
    expect(typeEffectiveness('fire', 'grass')).toBe(2);
  });

  it('water → fire = 2', () => {
    expect(typeEffectiveness('water', 'fire')).toBe(2);
  });

  it('electric → ground = 0', () => {
    expect(typeEffectiveness('electric', 'ground')).toBe(0);
  });

  it('normal → ghost = 0', () => {
    expect(typeEffectiveness('normal', 'ghost')).toBe(0);
  });

  it('normal → rock = 0.5', () => {
    expect(typeEffectiveness('normal', 'rock')).toBe(0.5);
  });

  it('normal → normal = 1 (no entry)', () => {
    expect(typeEffectiveness('normal', 'normal')).toBe(1);
  });

  it('fairy → dragon = 2', () => {
    expect(typeEffectiveness('fairy', 'dragon')).toBe(2);
  });

  it('dragon → fairy = 0', () => {
    expect(typeEffectiveness('dragon', 'fairy')).toBe(0);
  });

  it('fighting → psychic = 0.5 (psychic resists fighting)', () => {
    expect(typeEffectiveness('fighting', 'psychic')).toBe(0.5);
  });
});

describe('effectivenessAgainst (multi-type)', () => {
  it('ground vs fire/flying = 0 (flying immunity)', () => {
    expect(effectivenessAgainst('ground', ['fire', 'flying'])).toBe(0);
  });

  it('rock vs fire/flying = 4 (double super-effective)', () => {
    expect(effectivenessAgainst('rock', ['fire', 'flying'])).toBe(4);
  });

  it('water vs fire/flying = 2', () => {
    expect(effectivenessAgainst('water', ['fire', 'flying'])).toBe(2);
  });

  it('grass vs fire/flying = 0.25', () => {
    expect(effectivenessAgainst('grass', ['fire', 'flying'])).toBe(0.25);
  });

  it('single-type wrapper matches typeEffectiveness', () => {
    expect(effectivenessAgainst('fire', ['grass'])).toBe(2);
  });

  it('empty defender list → 1 (no effect)', () => {
    expect(effectivenessAgainst('fire', [])).toBe(1);
  });
});

describe('getWeaknesses', () => {
  it('Charizard (fire/flying) weak to rock (4×), water, electric', () => {
    const w = getWeaknesses(['fire', 'flying']);
    expect(w).toContain('rock');
    expect(w).toContain('water');
    expect(w).toContain('electric');
    // ground is immunity, not weakness
    expect(w).not.toContain('ground');
    // resisted attackers
    expect(w).not.toContain('fire');
    expect(w).not.toContain('grass');
  });

  it('Reuniclus (psychic) weak to bug, ghost, dark', () => {
    const w = getWeaknesses(['psychic']);
    expect(w).toEqual(expect.arrayContaining(['bug', 'ghost', 'dark']));
    expect(w).not.toContain('fighting');
    expect(w).not.toContain('psychic');
  });

  it('single-type fire: weak to water, ground, rock', () => {
    const w = getWeaknesses(['fire']);
    expect(w).toEqual(expect.arrayContaining(['water', 'ground', 'rock']));
    expect(w).not.toContain('fire');
  });
});

describe('getResistances', () => {
  it('Charizard (fire/flying) resists fighting (0.5), bug (0.25), grass (0.25)', () => {
    const r = getResistances(['fire', 'flying']);
    expect(r).toContain('fighting');
    expect(r).toContain('bug');
    expect(r).toContain('grass');
    // 0× is immunity, not resistance
    expect(r).not.toContain('ground');
  });

  it('Reuniclus (psychic) resists fighting and psychic', () => {
    const r = getResistances(['psychic']);
    expect(r).toContain('fighting');
    expect(r).toContain('psychic');
  });

  it('resistance excludes 0× matchups', () => {
    // Normal vs ghost is 0 → in immunities, NOT resistances
    expect(getResistances(['ghost'])).not.toContain('normal');
    expect(getImmunities(['ghost'])).toContain('normal');
  });
});

describe('getImmunities', () => {
  it('Charizard (fire/flying) immune to ground', () => {
    expect(getImmunities(['fire', 'flying'])).toEqual(['ground']);
  });

  it('Reuniclus (psychic) has no immunities', () => {
    expect(getImmunities(['psychic'])).toEqual([]);
  });

  it('Normal immune to ghost', () => {
    expect(getImmunities(['normal'])).toEqual(['ghost']);
  });

  it('Dark immune to psychic', () => {
    expect(getImmunities(['dark'])).toEqual(['psychic']);
  });

  it('Fairy immune to dragon', () => {
    expect(getImmunities(['fairy'])).toEqual(['dragon']);
  });
});
