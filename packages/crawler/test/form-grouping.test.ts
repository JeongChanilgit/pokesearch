import { describe, expect, it } from 'vitest';
import { buildFormGroups } from '../src/parsers/pokemon.js';
import type { ShowdownRecord } from '../src/showdown/parse.js';

const MINI_POKEDEX: ShowdownRecord = {
  charizard: {
    num: 6,
    name: 'Charizard',
    types: ['Fire', 'Flying'],
    baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    abilities: { 0: 'Blaze' },
    formeOrder: ['Charizard', 'Charizard-Mega-X', 'Charizard-Mega-Y'],
    otherFormes: ['Charizard-Mega-X', 'Charizard-Mega-Y'],
  },
  charizardmegax: {
    num: 6,
    name: 'Charizard-Mega-X',
    baseSpecies: 'Charizard',
    forme: 'Mega-X',
    types: ['Fire', 'Dragon'],
    baseStats: { hp: 78, atk: 130, def: 111, spa: 130, spd: 85, spe: 100 },
    abilities: { 0: 'Tough Claws' },
  },
  charizardmegay: {
    num: 6,
    name: 'Charizard-Mega-Y',
    baseSpecies: 'Charizard',
    forme: 'Mega-Y',
    types: ['Fire', 'Flying'],
    baseStats: { hp: 78, atk: 104, def: 78, spa: 159, spd: 115, spe: 100 },
    abilities: { 0: 'Drought' },
  },
  venusaur: {
    num: 3,
    name: 'Venusaur',
    types: ['Grass', 'Poison'],
    baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
    abilities: { 0: 'Overgrow' },
  },
};

const LEGAL = new Set(['charizard', 'charizardmegax', 'charizardmegay', 'venusaur']);

describe('buildFormGroups', () => {
  it('assigns dex*100+slot IDs', () => {
    const groups = buildFormGroups(MINI_POKEDEX, LEGAL);
    const charizardGroups = groups.filter((g) => g.dexNum === 6);
    expect(charizardGroups.map((g) => g.dexNum * 100 + g.slot)).toEqual([600, 601, 602]);
  });

  it('base form is always slot 0', () => {
    const groups = buildFormGroups(MINI_POKEDEX, LEGAL);
    const base = groups.find((g) => g.slug === 'charizard');
    expect(base?.slot).toBe(0);
  });

  it('alt forms point to base via baseSlug', () => {
    const groups = buildFormGroups(MINI_POKEDEX, LEGAL);
    const megaX = groups.find((g) => g.slug === 'charizardmegax');
    expect(megaX?.baseSlug).toBe('charizard');
    expect(megaX?.slot).toBeGreaterThan(0);
  });

  it('respects formeOrder for alt ordering', () => {
    const groups = buildFormGroups(MINI_POKEDEX, LEGAL);
    const chars = groups.filter((g) => g.dexNum === 6).sort((a, b) => a.slot - b.slot);
    expect(chars[0].slug).toBe('charizard');
    expect(chars[1].slug).toBe('charizardmegax');
    expect(chars[2].slug).toBe('charizardmegay');
  });

  it('handles single-form species (no alts)', () => {
    const groups = buildFormGroups(MINI_POKEDEX, LEGAL);
    const venus = groups.filter((g) => g.dexNum === 3);
    expect(venus).toHaveLength(1);
    expect(venus[0].slot).toBe(0);
  });

  it('excludes illegal slugs', () => {
    const legal = new Set(['charizard']); // only base
    const groups = buildFormGroups(MINI_POKEDEX, legal);
    expect(groups.every((g) => g.slug === 'charizard')).toBe(true);
    expect(groups).toHaveLength(1);
  });
});
