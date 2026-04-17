import { describe, expect, it } from 'vitest';
import { parseShowdownFile } from '../src/showdown/parse.js';

const FIXTURE = `
export const TestData: SomeType = {
  bulbasaur: {
    num: 1,
    name: "Bulbasaur",
    types: ["Grass", "Poison"],
    baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    abilities: { 0: "Overgrow", H: "Chlorophyll" },
    isNonstandard: null,
  },
  charizard: {
    num: 6,
    name: "Charizard",
    types: ["Fire", "Flying"],
    baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    abilities: { 0: "Blaze", H: "Solar Power" },
    // function-valued props should be stripped:
    onStart(pokemon) {
      this.add('start');
    },
  },
};
`;

describe('parseShowdownFile', () => {
  it('parses a basic Showdown data object', () => {
    const result = parseShowdownFile(FIXTURE);
    expect(result.bulbasaur).toMatchObject({
      num: 1,
      name: 'Bulbasaur',
      types: ['Grass', 'Poison'],
    });
  });

  it('preserves nested objects', () => {
    const result = parseShowdownFile(FIXTURE);
    expect((result.bulbasaur as Record<string, unknown>).baseStats).toEqual({
      hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45,
    });
  });

  it('drops function-valued fields', () => {
    const result = parseShowdownFile(FIXTURE);
    const charizard = result.charizard as Record<string, unknown>;
    expect('onStart' in charizard).toBe(false);
    expect(charizard.name).toBe('Charizard');
  });

  it('preserves null values', () => {
    const result = parseShowdownFile(FIXTURE);
    expect((result.bulbasaur as Record<string, unknown>).isNonstandard).toBeNull();
  });

  it('parses arrays', () => {
    const result = parseShowdownFile(FIXTURE);
    expect((result.bulbasaur as Record<string, unknown>).types).toEqual(['Grass', 'Poison']);
  });

  it('throws on malformed input', () => {
    expect(() => parseShowdownFile('export const X = { unclosed;')).toThrow();
  });
});
