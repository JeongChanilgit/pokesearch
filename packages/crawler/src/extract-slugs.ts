// Standalone script to extract all Champions-legal slugs without DB.
// Run: tsx src/extract-slugs.ts > /tmp/slugs.json

import { fetchShowdownFile, SHOWDOWN_PATHS } from './showdown/fetch.js';
import { parseShowdownFile } from './showdown/parse.js';
import { mergeModTable } from './showdown/merge.js';
import { buildLegalitySets, toId } from './parsers/legality.js';
import { buildFormGroups } from './parsers/pokemon.js';

async function main() {
  process.stderr.write('Fetching Showdown data...\n');
  const [
    rawPokedex, rawMoves, rawAbilities, rawItems, rawNatures,
    rawFormats, rawModMoves, rawModAbilities, rawModItems,
  ] = await Promise.all([
    fetchShowdownFile(SHOWDOWN_PATHS.basePokedex),
    fetchShowdownFile(SHOWDOWN_PATHS.baseMoves),
    fetchShowdownFile(SHOWDOWN_PATHS.baseAbilities),
    fetchShowdownFile(SHOWDOWN_PATHS.baseItems),
    fetchShowdownFile(SHOWDOWN_PATHS.baseNatures),
    fetchShowdownFile(SHOWDOWN_PATHS.modFormats),
    fetchShowdownFile(SHOWDOWN_PATHS.modMoves),
    fetchShowdownFile(SHOWDOWN_PATHS.modAbilities),
    fetchShowdownFile(SHOWDOWN_PATHS.modItems),
  ]);

  process.stderr.write('Parsing...\n');
  const basePokedex = parseShowdownFile(rawPokedex);
  const baseMoves = parseShowdownFile(rawMoves);
  const baseAbilities = parseShowdownFile(rawAbilities);
  const baseItems = parseShowdownFile(rawItems);
  const baseNatures = parseShowdownFile(rawNatures);
  const formatsData = parseShowdownFile(rawFormats);
  const modMoves = parseShowdownFile(rawModMoves);
  const modAbilities = parseShowdownFile(rawModAbilities);
  const modItems = parseShowdownFile(rawModItems);

  const mergedMoves = mergeModTable(baseMoves, modMoves);
  const mergedAbilities = mergeModTable(baseAbilities, modAbilities);
  const mergedItems = mergeModTable(baseItems, modItems);

  const legal = buildLegalitySets(basePokedex, formatsData, mergedMoves, mergedItems);
  process.stderr.write(`Legal: ${legal.pokemon.size} pokemon, ${legal.moves.size} moves, ${legal.abilities.size} abilities, ${legal.items.size} items\n`);

  function getNameEn(record: Record<string, unknown>, slug: string): string {
    const entry = record[slug] as Record<string, unknown> | undefined;
    return typeof entry?.name === 'string' ? entry.name : slug;
  }

  const formGroups = buildFormGroups(basePokedex, legal.pokemon);
  const pokemonList = formGroups.map(g => ({ slug: g.slug, nameEn: getNameEn(basePokedex, g.slug) }));
  const movesList = [...legal.moves].sort().map(s => ({ slug: s, nameEn: getNameEn(mergedMoves, s) }));
  const abilitiesList = [...legal.abilities].sort().map(s => ({ slug: s, nameEn: getNameEn(mergedAbilities, s) }));
  const itemsList = [...legal.items].sort().map(s => ({ slug: s, nameEn: getNameEn(mergedItems, s) }));
  const naturesList = Object.keys(baseNatures).sort().map(s => ({ slug: s, nameEn: getNameEn(baseNatures, s) }));

  process.stderr.write(`pokemon:${pokemonList.length} moves:${movesList.length} abilities:${abilitiesList.length} items:${itemsList.length} natures:${naturesList.length}\n`);

  const result = { pokemon: pokemonList, moves: movesList, abilities: abilitiesList, items: itemsList, natures: naturesList };
  process.stdout.write(JSON.stringify(result, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
