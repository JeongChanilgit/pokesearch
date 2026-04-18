const POKE_API_SPRITES_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home';

const SUFFIXES = [
  ['megax', 'mega-x'],
  ['megay', 'mega-y'],
  ['mega', 'mega'],
  ['alola', 'alola'],
  ['galar', 'galar'],
  ['hisui', 'hisui'],
  ['paldea', 'paldea'],
  ['gmax', 'gmax'],
  ['primal', 'primal'],
] as const;

export function toPokeApiSpriteId(dexNum: number, showdownId: string): string {
  const slug = showdownId.toLowerCase();
  for (const [suffix, formTag] of SUFFIXES) {
    if (slug.endsWith(suffix)) {
      return `${dexNum}-${formTag}`;
    }
  }
  return String(dexNum);
}

export function spriteUrl(dexNum: number, showdownId: string): string {
  const id = toPokeApiSpriteId(dexNum, showdownId);
  return `${POKE_API_SPRITES_BASE}/${id}.png`;
}

// Same logic as spriteUrl — preserves form so the fallback isn't lossy.
export function fallbackSpriteUrl(dexNum: number, showdownId: string): string {
  return `${POKE_API_SPRITES_BASE}/${toPokeApiSpriteId(dexNum, showdownId)}.png`;
}
