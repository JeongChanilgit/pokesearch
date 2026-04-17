// Orchestration for the crawler. Each `run*` function walks a PokeAPI
// listing, parses rows, and upserts them through hash-aware writers.
// Progress is written back to the on-disk state file after each entity
// so a Ctrl-C leaves a resumable trail.

import type { PrismaClient } from '@pokesearch/db';
import {
  fetchAbility,
  fetchAbilityList,
  fetchItem,
  fetchItemList,
  fetchMove,
  fetchMoveList,
  fetchPokemon,
  fetchSpecies,
  fetchSpeciesList,
  idFromUrl,
} from './pokeapi.js';
import { buildAbilityRow } from './parsers/ability.js';
import { buildItemRow } from './parsers/item.js';
import { buildMoveRow } from './parsers/move.js';
import { buildLearnset } from './parsers/learnset.js';
import { buildPokemonRow, planVarieties } from './parsers/pokemon.js';
import type { CrawlerState } from './state.js';
import { markDone, saveState } from './state.js';
import {
  writeAbility,
  writeItem,
  writeLearnset,
  writeMove,
  writePokemon,
} from './writer.js';

export interface RunContext {
  prisma: PrismaClient;
  state: CrawlerState;
  statePath: string;
  resume: boolean;
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

// ---------- Pokémon ----------

export async function runPokemon(ctx: RunContext): Promise<RunStats> {
  const stats = newStats();
  const listing = await fetchSpeciesList();
  ctx.log(`pokemon: ${listing.results.length} species to process`);

  for (const entry of listing.results) {
    const dex = idFromUrl(entry.url);
    if (ctx.resume && ctx.state.pokemon.doneDex.includes(dex)) continue;
    stats.attempted++;

    try {
      const species = await fetchSpecies(dex);
      const plans = planVarieties(species);
      for (const plan of plans) {
        const mon = await fetchPokemon(plan.pokeapiId);
        const row = buildPokemonRow(species, mon, plan);
        if (!row) {
          stats.failed++;
          continue;
        }
        const wrote = await writePokemon(ctx.prisma, row);
        if (wrote) stats.written++;
        else stats.skipped++;
      }
      ctx.state.pokemon.doneDex = markDone(ctx.state.pokemon.doneDex, dex);
      if (stats.attempted % 25 === 0) await saveState(ctx.statePath, ctx.state);
    } catch (err) {
      stats.failed++;
      ctx.log(`pokemon dex=${dex} failed: ${(err as Error).message}`);
    }
  }

  await saveState(ctx.statePath, ctx.state);
  return stats;
}

// ---------- Moves ----------

export async function runMoves(ctx: RunContext): Promise<RunStats> {
  const stats = newStats();
  const listing = await fetchMoveList();
  ctx.log(`moves: ${listing.results.length} to process`);

  for (const entry of listing.results) {
    const id = idFromUrl(entry.url);
    if (ctx.resume && ctx.state.moves.doneIds.includes(id)) continue;
    stats.attempted++;

    try {
      const raw = await fetchMove(id);
      const row = buildMoveRow(raw);
      if (!row) {
        stats.failed++;
        continue;
      }
      const wrote = await writeMove(ctx.prisma, row);
      if (wrote) stats.written++;
      else stats.skipped++;
      ctx.state.moves.doneIds = markDone(ctx.state.moves.doneIds, id);
      if (stats.attempted % 50 === 0) await saveState(ctx.statePath, ctx.state);
    } catch (err) {
      stats.failed++;
      ctx.log(`move id=${id} failed: ${(err as Error).message}`);
    }
  }

  await saveState(ctx.statePath, ctx.state);
  return stats;
}

// ---------- Abilities ----------

export async function runAbilities(ctx: RunContext): Promise<RunStats> {
  const stats = newStats();
  const listing = await fetchAbilityList();
  ctx.log(`abilities: ${listing.results.length} to process`);

  for (const entry of listing.results) {
    const id = idFromUrl(entry.url);
    if (ctx.resume && ctx.state.abilities.doneIds.includes(id)) continue;
    stats.attempted++;

    try {
      const raw = await fetchAbility(id);
      const row = buildAbilityRow(raw);
      if (!row) {
        stats.failed++;
        continue;
      }
      const wrote = await writeAbility(ctx.prisma, row);
      if (wrote) stats.written++;
      else stats.skipped++;
      ctx.state.abilities.doneIds = markDone(ctx.state.abilities.doneIds, id);
      if (stats.attempted % 50 === 0) await saveState(ctx.statePath, ctx.state);
    } catch (err) {
      stats.failed++;
      ctx.log(`ability id=${id} failed: ${(err as Error).message}`);
    }
  }

  await saveState(ctx.statePath, ctx.state);
  return stats;
}

// ---------- Items ----------

export async function runItems(ctx: RunContext): Promise<RunStats> {
  const stats = newStats();
  const listing = await fetchItemList();
  ctx.log(`items: ${listing.results.length} to process`);

  for (const entry of listing.results) {
    const id = idFromUrl(entry.url);
    if (ctx.resume && ctx.state.items.doneIds.includes(id)) continue;
    stats.attempted++;

    try {
      const raw = await fetchItem(id);
      const row = buildItemRow(raw);
      if (!row) {
        stats.failed++;
        continue;
      }
      const wrote = await writeItem(ctx.prisma, row);
      if (wrote) stats.written++;
      else stats.skipped++;
      ctx.state.items.doneIds = markDone(ctx.state.items.doneIds, id);
      if (stats.attempted % 50 === 0) await saveState(ctx.statePath, ctx.state);
    } catch (err) {
      stats.failed++;
      ctx.log(`item id=${id} failed: ${(err as Error).message}`);
    }
  }

  await saveState(ctx.statePath, ctx.state);
  return stats;
}

// ---------- Learnsets ----------

/**
 * Iterates the local `pokemons` table — learnsets only make sense for
 * Pokémon we've already imported. For each row we fetch PokeAPI's
 * `/pokemon/{variety}` to read the moves list, then replace the set.
 */
export async function runLearnsets(ctx: RunContext): Promise<RunStats> {
  const stats = newStats();
  const ours = await ctx.prisma.pokemon.findMany({ select: { id: true } });
  ctx.log(`learnsets: ${ours.length} Pokémon to process`);

  for (const { id: ourId } of ours) {
    if (ctx.resume && ctx.state.learnsets.donePokemonIds.includes(ourId)) continue;
    stats.attempted++;

    const dex = Math.floor(ourId / 100);
    const formNumber = ourId % 100;

    try {
      const species = await fetchSpecies(dex);
      const plans = planVarieties(species);
      const plan = plans[formNumber];
      if (!plan) {
        stats.failed++;
        continue;
      }
      const mon = await fetchPokemon(plan.pokeapiId);
      const entries = buildLearnset(ourId, mon);
      const wrote = await writeLearnset(ctx.prisma, ourId, entries);
      if (wrote) stats.written++;
      else stats.skipped++;
      ctx.state.learnsets.donePokemonIds = markDone(
        ctx.state.learnsets.donePokemonIds,
        ourId
      );
      if (stats.attempted % 25 === 0) await saveState(ctx.statePath, ctx.state);
    } catch (err) {
      stats.failed++;
      ctx.log(`learnset id=${ourId} failed: ${(err as Error).message}`);
    }
  }

  await saveState(ctx.statePath, ctx.state);
  return stats;
}
