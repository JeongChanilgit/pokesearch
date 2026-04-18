import { describe, expect, it } from 'vitest';
import { toPokeApiSpriteId, spriteUrl, fallbackSpriteUrl } from '../src/sprites';

const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home';

describe('toPokeApiSpriteId', () => {
  it('returns dex number string for a base form (charizard)', () => {
    expect(toPokeApiSpriteId(6, 'charizard')).toBe('6');
  });

  it('handles mega-x suffix (charizardmegax)', () => {
    expect(toPokeApiSpriteId(6, 'charizardmegax')).toBe('6-mega-x');
  });

  it('handles mega-y suffix (charizardmegay)', () => {
    expect(toPokeApiSpriteId(6, 'charizardmegay')).toBe('6-mega-y');
  });

  it('handles plain mega suffix (kangaskhanmega)', () => {
    expect(toPokeApiSpriteId(115, 'kangaskhanmega')).toBe('115-mega');
  });

  it('handles alolan suffix (ninetalesalola)', () => {
    expect(toPokeApiSpriteId(38, 'ninetalesalola')).toBe('38-alola');
  });

  it('handles galarian suffix (slowbrogalar)', () => {
    expect(toPokeApiSpriteId(80, 'slowbrogalar')).toBe('80-galar');
  });

  it('handles hisuian suffix (zoroarkhisui)', () => {
    expect(toPokeApiSpriteId(571, 'zoroarkhisui')).toBe('571-hisui');
  });

  it('handles paldean suffix (wooperpaldea)', () => {
    expect(toPokeApiSpriteId(194, 'wooperpaldea')).toBe('194-paldea');
  });

  it('handles gmax suffix (charizardgmax)', () => {
    expect(toPokeApiSpriteId(6, 'charizardgmax')).toBe('6-gmax');
  });

  it('handles primal suffix (kyogreprimal)', () => {
    expect(toPokeApiSpriteId(382, 'kyogreprimal')).toBe('382-primal');
  });

  it('is case-insensitive for the slug input', () => {
    expect(toPokeApiSpriteId(38, 'NinetalesALOLA')).toBe('38-alola');
  });
});

describe('spriteUrl', () => {
  it('builds correct URL for base form', () => {
    expect(spriteUrl(6, 'charizard')).toBe(`${BASE}/6.png`);
  });

  it('builds correct URL for mega-x form', () => {
    expect(spriteUrl(6, 'charizardmegax')).toBe(`${BASE}/6-mega-x.png`);
  });

  it('builds correct URL for alolan form', () => {
    expect(spriteUrl(38, 'ninetalesalola')).toBe(`${BASE}/38-alola.png`);
  });
});

describe('fallbackSpriteUrl', () => {
  it('preserves mega-x form for charizardmegax', () => {
    expect(fallbackSpriteUrl(6, 'charizardmegax')).toBe(`${BASE}/6-mega-x.png`);
  });

  it('returns base dex URL for plain form', () => {
    expect(fallbackSpriteUrl(6, 'charizard')).toBe(`${BASE}/6.png`);
  });

  it('preserves mega form for kangaskhanmega', () => {
    expect(fallbackSpriteUrl(115, 'kangaskhanmega')).toBe(`${BASE}/115-mega.png`);
  });
});
