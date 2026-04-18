// Orchestration for the Champions crawler.
//
// Single pipeline: natures → abilities → items → moves → pokemon → learnsets.
// Pokemon must come after moves because learnsets look up move IDs from
// the manifest that the moves step populates.

import path from 'node:path';
import type { PrismaClient } from '@pokesearch/db';
import { fetchShowdownFile, SHOWDOWN_PATHS } from './showdown/fetch.js';
import { parseShowdownFile } from './showdown/parse.js';
import { mergeModTable } from './showdown/merge.js';
import {
  defaultManifestPath,
  loadManifest,
  saveManifest,
} from './showdown/id-manifest.js';
import {
  defaultKoDir,
  loadKoTables,
  createMissingTracker,
  finalizeMissingTracker,
} from './showdown/korean.js';
import { buildLegalitySets } from './parsers/legality.js';
import { buildFormGroups, buildPokemonRow } from './parsers/pokemon.js';
import { buildMoveRow } from './parsers/move.js';
import { buildAbilityRow, buildPokemonAbilityLinks } from './parsers/ability.js';
import { buildItemRow, loadEffectMultMap } from './parsers/item.js';
import { buildLearnset } from './parsers/learnset.js';
import { buildNatureRows } from './parsers/nature.js';
import {
  writePokemon,
  writeMove,
  writeAbility,
  writeItem,
  writeLearnset,
  writeNature,
  writePokemonAbilities,
} from './writer.js';
import { isStepDone, saveState, stepDone, type CrawlerState } from './state.js';

export interface RunContext {
  prisma: PrismaClient;
  state: CrawlerState;
  statePath: string;
  resume: boolean;
  allowMissingKo: boolean;
  dataDir: string;
  log: (msg: string) => void;
}

export interface RunStats {
  attempted: number;
  written: number;
  skipped: number;
  failed: number;
}

function newStats(): RunStats {
  return { attempted: 0, written: 0, skipped: 0, failed: 0 };
}

export async function runChampions(ctx: RunContext): Promise<Record<string, RunStats>> {
  const totals: Record<string, RunStats> = {};

  ctx.log('Fetching Showdown data files…');
  const [
    rawPokedex,
    rawMoves,
    rawAbilities,
    rawItems,
    rawNatures,
    rawTextAbilities,
    rawTextItems,
    rawFormats,
    rawModMoves,
    rawModAbilities,
    rawModItems,
    rawModLearnsets,
  ] = await Promise.all([
    fetchShowdownFile(SHOWDOWN_PATHS.basePokedex),
    fetchShowdownFile(SHOWDOWN_PATHS.baseMoves),
    fetchShowdownFile(SHOWDOWN_PATHS.baseAbilities),
    fetchShowdownFile(SHOWDOWN_PATHS.baseItems),
    fetchShowdownFile(SHOWDOWN_PATHS.baseNatures),
    fetchShowdownFile(SHOWDOWN_PATHS.textAbilities),
    fetchShowdownFile(SHOWDOWN_PATHS.textItems),
    fetchShowdownFile(SHOWDOWN_PATHS.modFormats),
    fetchShowdownFile(SHOWDOWN_PATHS.modMoves),
    fetchShowdownFile(SHOWDOWN_PATHS.modAbilities),
    fetchShowdownFile(SHOWDOWN_PATHS.modItems),
    fetchShowdownFile(SHOWDOWN_PATHS.modLearnsets),
  ]);

  ctx.log('Parsing…');
  const basePokedex = parseShowdownFile(rawPokedex);
  const baseMoves = parseShowdownFile(rawMoves);
  const baseAbilities = parseShowdownFile(rawAbilities);
  const baseItems = parseShowdownFile(rawItems);
  const baseNatures = parseShowdownFile(rawNatures);
  const textAbilities = parseShowdownFile(rawTextAbilities);
  const textItems = parseShowdownFile(rawTextItems);
  const formatsData = parseShowdownFile(rawFormats);
  const modMoves = parseShowdownFile(rawModMoves);
  const modAbilities = parseShowdownFile(rawModAbilities);
  const modItems = parseShowdownFile(rawModItems);
  const modLearnsets = parseShowdownFile(rawModLearnsets);

  const mergedMoves = mergeModTable(baseMoves, modMoves);
  const mergedAbilities = mergeModTable(baseAbilities, modAbilities);
  const mergedItems = mergeModTable(baseItems, modItems);

  const legal = buildLegalitySets(basePokedex, formatsData, mergedMoves, mergedItems);
  ctx.log(
    `Legal: ${legal.pokemon.size} pokemon, ${legal.moves.size} moves, ` +
      `${legal.abilities.size} abilities, ${legal.items.size} items`
  );

  const manifestPath = defaultManifestPath(ctx.dataDir);
  const manifest = await loadManifest(manifestPath);
  const koDir = defaultKoDir(ctx.dataDir);
  const koTables = await loadKoTables(koDir);
  const tracker = createMissingTracker(ctx.allowMissingKo);
  const effectMults = await loadEffectMultMap(ctx.dataDir);

  // ---------- Natures ----------
  if (ctx.resume && isStepDone(ctx.state, 'natures')) {
    ctx.log('natures: skipped (already done)');
    totals.natures = newStats();
  } else {
    const stats = newStats();
    const natureRows = buildNatureRows(baseNatures, koTables, tracker);
    ctx.log(`natures: ${natureRows.length} to process`);
    for (const row of natureRows) {
      stats.attempted++;
      try {
        const wrote = await writeNature(ctx.prisma, row);
        if (wrote) stats.written++;
        else stats.skipped++;
      } catch (err) {
        stats.failed++;
        ctx.log(`nature ${row.nameEn} failed: ${(err as Error).message}`);
      }
    }
    stepDone(ctx.state, 'natures');
    await saveState(ctx.statePath, ctx.state);
    totals.natures = stats;
  }

  // ---------- Abilities ----------
  if (ctx.resume && isStepDone(ctx.state, 'abilities')) {
    ctx.log('abilities: skipped (already done)');
    totals.abilities = newStats();
  } else {
    const stats = newStats();
    const abilitySlugs = [...legal.abilities].sort();
    ctx.log(`abilities: ${abilitySlugs.length} to process`);
    for (const slug of abilitySlugs) {
      stats.attempted++;
      try {
        const row = buildAbilityRow(slug, mergedAbilities, textAbilities, manifest, koTables, tracker);
        if (!row) { stats.failed++; continue; }
        const wrote = await writeAbility(ctx.prisma, row);
        if (wrote) stats.written++;
        else stats.skipped++;
      } catch (err) {
        stats.failed++;
        ctx.log(`ability ${slug} failed: ${(err as Error).message}`);
      }
    }
    stepDone(ctx.state, 'abilities');
    await saveState(ctx.statePath, ctx.state);
    totals.abilities = stats;
  }

  // ---------- Items ----------
  if (ctx.resume && isStepDone(ctx.state, 'items')) {
    ctx.log('items: skipped (already done)');
    totals.items = newStats();
  } else {
    const stats = newStats();
    const itemSlugs = [...legal.items].sort();
    ctx.log(`items: ${itemSlugs.length} to process`);
    for (const slug of itemSlugs) {
      stats.attempted++;
      try {
        const row = buildItemRow(slug, mergedItems, textItems, effectMults, manifest, koTables, tracker);
        if (!row) { stats.failed++; continue; }
        const wrote = await writeItem(ctx.prisma, row);
        if (wrote) stats.written++;
        else stats.skipped++;
      } catch (err) {
        stats.failed++;
        ctx.log(`item ${slug} failed: ${(err as Error).message}`);
      }
    }
    stepDone(ctx.state, 'items');
    await saveState(ctx.statePath, ctx.state);
    totals.items = stats;
  }

  // ---------- Moves ----------
  if (ctx.resume && isStepDone(ctx.state, 'moves')) {
    ctx.log('moves: skipped (already done)');
    totals.moves = newStats();
  } else {
    const stats = newStats();
    const moveSlugs = [...legal.moves].sort();
    ctx.log(`moves: ${moveSlugs.length} to process`);

    // Fetch move text file for descriptions (reuse rawTextMoves if present).
    let textMoves = {} as import('./showdown/parse.js').ShowdownRecord;
    try {
      const rawTextMoves = await fetchShowdownFile('data/text/moves.ts');
      textMoves = parseShowdownFile(rawTextMoves);
    } catch {
      ctx.log('moves text file unavailable; names come from data/moves.ts');
    }

    for (const slug of moveSlugs) {
      stats.attempted++;
      try {
        const row = buildMoveRow(slug, mergedMoves, textMoves, manifest, koTables, tracker);
        if (!row) { stats.failed++; continue; }
        const wrote = await writeMove(ctx.prisma, row);
        if (wrote) stats.written++;
        else stats.skipped++;
      } catch (err) {
        stats.failed++;
        ctx.log(`move ${slug} failed: ${(err as Error).message}`);
      }
    }
    stepDone(ctx.state, 'moves');
    await saveState(ctx.statePath, ctx.state);
    totals.moves = stats;
  }

  // Save manifest after moves (IDs assigned).
  await saveManifest(manifestPath, manifest);

  // ---------- Pokémon ----------
  if (ctx.resume && isStepDone(ctx.state, 'pokemon')) {
    ctx.log('pokemon: skipped (already done)');
    totals.pokemon = newStats();
  } else {
    const stats = newStats();
    const formGroups = buildFormGroups(basePokedex, legal.pokemon);
    ctx.log(`pokemon: ${formGroups.length} forms to process`);
    for (const group of formGroups) {
      stats.attempted++;
      try {
        const row = buildPokemonRow(group.slug, group, basePokedex, koTables, tracker);
        if (!row) { stats.failed++; continue; }
        const wrote = await writePokemon(ctx.prisma, row);
        if (wrote) stats.written++;
        else stats.skipped++;
      } catch (err) {
        stats.failed++;
        ctx.log(`pokemon ${group.slug} failed: ${(err as Error).message}`);
      }
    }
    stepDone(ctx.state, 'pokemon');
    await saveState(ctx.statePath, ctx.state);
    totals.pokemon = stats;
  }

  // ---------- Pokémon Abilities ----------
  if (ctx.resume && isStepDone(ctx.state, 'pokemon_abilities')) {
    ctx.log('pokemon_abilities: skipped (already done)');
    totals.pokemon_abilities = newStats();
  } else {
    const stats = newStats();
    const formGroups = buildFormGroups(basePokedex, legal.pokemon);
    const links = buildPokemonAbilityLinks(formGroups, basePokedex, manifest);
    const byPokemon = new Map<number, number[]>();
    for (const { pokemonId, abilityId } of links) {
      const list = byPokemon.get(pokemonId) ?? [];
      list.push(abilityId);
      byPokemon.set(pokemonId, list);
    }
    ctx.log(`pokemon_abilities: ${byPokemon.size} pokemon to process`);
    for (const [pokemonId, abilityIds] of byPokemon) {
      stats.attempted++;
      try {
        const wrote = await writePokemonAbilities(ctx.prisma, pokemonId, abilityIds);
        if (wrote) stats.written++;
        else stats.skipped++;
      } catch (err) {
        stats.failed++;
        ctx.log(`pokemon_abilities ${pokemonId} failed: ${(err as Error).message}`);
      }
    }
    stepDone(ctx.state, 'pokemon_abilities');
    await saveState(ctx.statePath, ctx.state);
    totals.pokemon_abilities = stats;
  }

  // ---------- Learnsets ----------
  if (ctx.resume && isStepDone(ctx.state, 'learnsets')) {
    ctx.log('learnsets: skipped (already done)');
    totals.learnsets = newStats();
  } else {
    const stats = newStats();
    const formGroups = buildFormGroups(basePokedex, legal.pokemon);
    ctx.log(`learnsets: ${formGroups.length} forms to process`);
    for (const group of formGroups) {
      const ourId = group.dexNum * 100 + group.slot;
      stats.attempted++;
      try {
        const entries = buildLearnset(ourId, group.slug, group.baseSlug, modLearnsets, manifest);
        const wrote = await writeLearnset(ctx.prisma, ourId, entries);
        if (wrote) stats.written++;
        else stats.skipped++;
      } catch (err) {
        stats.failed++;
        ctx.log(`learnset ${group.slug} failed: ${(err as Error).message}`);
      }
    }
    stepDone(ctx.state, 'learnsets');
    await saveState(ctx.statePath, ctx.state);
    totals.learnsets = stats;
  }

  await finalizeMissingTracker(tracker, koDir);

  return totals;
}
