import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import type { PokeApiSpecies } from '../src/pokeapi.js';
import { planVarieties } from '../src/parsers/pokemon.js';

const here = path.dirname(fileURLToPath(import.meta.url));
function fixture<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(here, 'fixtures', name), 'utf8')) as T;
}

describe('planVarieties — dex*100 + form_number scheme', () => {
  it('maps Charizard varieties exhaustively', () => {
    const species = fixture<PokeApiSpecies>('species-charizard.json');
    const plans = planVarieties(species);

    expect(plans).toHaveLength(4);
    expect(plans.map((p) => p.ourId)).toEqual([600, 601, 602, 603]);
    expect(plans.map((p) => p.formOf)).toEqual([null, 600, 600, 600]);
    expect(plans.map((p) => p.pokeapiId)).toEqual([6, 10034, 10035, 10192]);
    expect(plans.map((p) => p.isDefault)).toEqual([true, false, false, false]);
  });

  it('maps Alolan Raichu to dex*100+1 with form_of pointing at base', () => {
    const species = fixture<PokeApiSpecies>('species-raichu.json');
    const plans = planVarieties(species);
    expect(plans).toHaveLength(2);
    expect(plans[0]).toMatchObject({ ourId: 2600, formOf: null, pokeapiId: 26 });
    expect(plans[1]).toMatchObject({ ourId: 2601, formOf: 2600, pokeapiId: 10100 });
  });

  it('lifts the default variety into slot 0 even if listed later', () => {
    const scrambled: PokeApiSpecies = {
      id: 50,
      name: 'fake',
      names: [{ language: { name: 'en' }, name: 'Fake' }],
      varieties: [
        {
          is_default: false,
          pokemon: { name: 'fake-alt', url: 'https://pokeapi.co/api/v2/pokemon/10500/' },
        },
        {
          is_default: true,
          pokemon: { name: 'fake', url: 'https://pokeapi.co/api/v2/pokemon/50/' },
        },
      ],
    };
    const plans = planVarieties(scrambled);
    expect(plans[0].isDefault).toBe(true);
    expect(plans[0].ourId).toBe(5000);
    expect(plans[0].formOf).toBeNull();
    expect(plans[1].ourId).toBe(5001);
    expect(plans[1].formOf).toBe(5000);
  });

  it('guarantees form_of is null for exactly one variety per species', () => {
    const fixtures = ['species-charizard.json', 'species-raichu.json', 'species-no-ko.json'];
    for (const f of fixtures) {
      const plans = planVarieties(fixture<PokeApiSpecies>(f));
      const bases = plans.filter((p) => p.formOf === null);
      expect(bases).toHaveLength(1);
      expect(bases[0]!.ourId % 100).toBe(0);
    }
  });

  it('generates unique IDs across all forms', () => {
    const species = fixture<PokeApiSpecies>('species-charizard.json');
    const plans = planVarieties(species);
    const ids = new Set(plans.map((p) => p.ourId));
    expect(ids.size).toBe(plans.length);
  });
});
