import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import type {
  PokeApiAbility,
  PokeApiItem,
  PokeApiMove,
  PokeApiPokemon,
  PokeApiSpecies,
} from '../src/pokeapi.js';
import { buildAbilityRow } from '../src/parsers/ability.js';
import { buildItemRow } from '../src/parsers/item.js';
import { buildMoveRow } from '../src/parsers/move.js';
import { buildLearnset } from '../src/parsers/learnset.js';
import {
  buildPokemonRow,
  pickBilingualNames,
  planVarieties,
} from '../src/parsers/pokemon.js';

const here = path.dirname(fileURLToPath(import.meta.url));
function fixture<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(here, 'fixtures', name), 'utf8')) as T;
}

describe('pokemon parser', () => {
  const species = fixture<PokeApiSpecies>('species-charizard.json');
  const base = fixture<PokeApiPokemon>('pokemon-charizard.json');
  const megaX = fixture<PokeApiPokemon>('pokemon-charizard-mega-x.json');

  it('extracts bilingual species names', () => {
    const names = pickBilingualNames(species);
    expect(names).toEqual({ nameEn: 'Charizard', nameKo: '리자몽' });
  });

  it('returns null nameKo for older species missing Korean', () => {
    const noKo = fixture<PokeApiSpecies>('species-no-ko.json');
    expect(pickBilingualNames(noKo)).toEqual({ nameEn: 'MissingKo', nameKo: null });
  });

  it('builds a Pokémon row for the base form', () => {
    const plan = planVarieties(species)[0]!;
    const row = buildPokemonRow(species, base, plan);
    expect(row).toEqual({
      id: 600,
      nameEn: 'Charizard',
      nameKo: '리자몽',
      types: ['fire', 'flying'],
      baseH: 78,
      baseA: 84,
      baseB: 78,
      baseC: 109,
      baseD: 85,
      baseS: 100,
      spriteUrl: 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/6.png',
      formOf: null,
    });
  });

  it('decorates alt-form names and points form_of at the base', () => {
    const plan = planVarieties(species)[1]!;
    const row = buildPokemonRow(species, megaX, plan);
    expect(row?.id).toBe(601);
    expect(row?.formOf).toBe(600);
    expect(row?.nameEn).toBe('Charizard Mega X');
    expect(row?.nameKo).toBe('리자몽 Mega X');
    expect(row?.spriteUrl).toContain('/10034.png');
  });
});

describe('move parser', () => {
  it('parses a bilingual damaging move', () => {
    const row = buildMoveRow(fixture<PokeApiMove>('move-flamethrower.json'));
    expect(row).toEqual({
      id: 53,
      nameEn: 'Flamethrower',
      nameKo: '화염방사',
      type: 'fire',
      category: 'special',
      power: 90,
      accuracy: 100,
      pp: 15,
    });
  });

  it('drops moves with unknown damage_class', () => {
    const bogus = {
      ...fixture<PokeApiMove>('move-flamethrower.json'),
      damage_class: { name: 'mystery' },
    };
    expect(buildMoveRow(bogus as PokeApiMove)).toBeNull();
  });

  it('falls back to nameEn when nameKo is missing', () => {
    const noKo: PokeApiMove = {
      ...fixture<PokeApiMove>('move-flamethrower.json'),
      names: [{ language: { name: 'en' }, name: 'Flamethrower' }],
    };
    expect(buildMoveRow(noKo)?.nameKo).toBe('Flamethrower');
  });
});

describe('ability parser', () => {
  it('collapses newlines in flavor text', () => {
    const row = buildAbilityRow(fixture<PokeApiAbility>('ability-blaze.json'));
    expect(row?.descriptionEn).not.toContain('\n');
    expect(row?.nameKo).toBe('맹화');
  });
});

describe('item parser', () => {
  it('prefers short_effect over flavor text', () => {
    const row = buildItemRow(fixture<PokeApiItem>('item-leftovers.json'));
    expect(row?.descriptionEn).toContain("Heals the holder 1/16");
    expect(row?.nameKo).toBe('먹다남은밥');
  });
});

describe('learnset parser', () => {
  it('produces unique (pokemonId, moveId) rows', () => {
    const mon = fixture<PokeApiPokemon>('pokemon-charizard.json');
    const entries = buildLearnset(600, mon);
    expect(entries).toEqual([
      { pokemonId: 600, moveId: 53 },
      { pokemonId: 600, moveId: 403 },
      { pokemonId: 600, moveId: 89 },
    ]);
  });

  it('dedupes moves that appear multiple times', () => {
    const mon: PokeApiPokemon = {
      ...fixture<PokeApiPokemon>('pokemon-charizard.json'),
      moves: [
        { move: { name: 'a', url: 'https://pokeapi.co/api/v2/move/1/' } },
        { move: { name: 'a', url: 'https://pokeapi.co/api/v2/move/1/' } },
        { move: { name: 'b', url: 'https://pokeapi.co/api/v2/move/2/' } },
      ],
    };
    expect(buildLearnset(100, mon)).toHaveLength(2);
  });
});
