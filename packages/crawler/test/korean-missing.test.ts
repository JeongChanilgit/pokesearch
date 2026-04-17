import { describe, expect, it } from 'vitest';
import { createMissingTracker, lookupKo } from '../src/showdown/korean.js';
import type { KoTables } from '../src/showdown/korean.js';

const EMPTY_TABLES: KoTables = {
  pokemon: {},
  moves: {},
  abilities: {},
  items: {},
  natures: {},
};

const PARTIAL_TABLES: KoTables = {
  pokemon: { venusaur: { name: '이상해꽃' } },
  moves: {},
  abilities: {},
  items: {},
  natures: {},
};

describe('lookupKo', () => {
  it('returns the Korean entry when present', () => {
    const tracker = createMissingTracker(false);
    const result = lookupKo(PARTIAL_TABLES, tracker, 'pokemon', 'venusaur', 'Venusaur');
    expect(result.name).toBe('이상해꽃');
    expect(tracker.missing.pokemon).toHaveLength(0);
  });

  it('falls back to English name when translation is missing', () => {
    const tracker = createMissingTracker(true);
    const result = lookupKo(EMPTY_TABLES, tracker, 'pokemon', 'bulbasaur', 'Bulbasaur');
    expect(result.name).toBe('Bulbasaur');
    expect(tracker.missing.pokemon).toHaveLength(1);
    expect(tracker.missing.pokemon[0].slug).toBe('bulbasaur');
  });

  it('records all missing slugs across scopes', () => {
    const tracker = createMissingTracker(true);
    lookupKo(EMPTY_TABLES, tracker, 'pokemon', 'bulbasaur', 'Bulbasaur');
    lookupKo(EMPTY_TABLES, tracker, 'moves', 'tackle', 'Tackle');
    expect(tracker.missing.pokemon).toHaveLength(1);
    expect(tracker.missing.moves).toHaveLength(1);
  });
});
