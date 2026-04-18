import { describe, it, expect } from 'vitest';
import { buildLearnset } from '../src/parsers/learnset.js';
import type { ShowdownRecord } from '../src/showdown/parse.js';
import type { IdManifest } from '../src/showdown/id-manifest.js';

const manifest: IdManifest = {
  move: { tackle: 1, flamethrower: 2, earthquake: 3 },
  ability: {},
  item: {},
};

const modLearnsets: ShowdownRecord = {
  charizard: {
    learnset: { tackle: ['9L1'], flamethrower: ['9L40'] },
  },
  charizardmegax: {
    learnset: { earthquake: ['9L1'] },
  },
  charizardmegay: {},
};

describe('buildLearnset', () => {
  it('returns own moves when form has a non-empty learnset', () => {
    const entries = buildLearnset(600, 'charizardmegax', 'charizard', modLearnsets, manifest);
    expect(entries.map((e) => e.moveId).sort()).toEqual([3]);
  });

  it('falls back to base form moves when form has no entry or empty learnset', () => {
    const entries = buildLearnset(600, 'charizardmegay', 'charizard', modLearnsets, manifest);
    expect(entries.map((e) => e.moveId).sort()).toEqual([1, 2]);
  });

  it('returns empty array when neither form nor base has entries', () => {
    const entries = buildLearnset(600, 'missingmon', 'alsoMissing', modLearnsets, manifest);
    expect(entries).toEqual([]);
  });
});
