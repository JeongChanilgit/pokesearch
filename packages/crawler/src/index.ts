#!/usr/bin/env node
// CLI entry for the PokeSearch crawler.
//
//   pnpm --filter @pokesearch/crawler crawl --all
//   pnpm --filter @pokesearch/crawler crawl --pokemon
//   pnpm --filter @pokesearch/crawler crawl --moves
//   pnpm --filter @pokesearch/crawler crawl --abilities
//   pnpm --filter @pokesearch/crawler crawl --items
//   pnpm --filter @pokesearch/crawler crawl --learnsets
//   pnpm --filter @pokesearch/crawler crawl --resume

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { prisma } from '@pokesearch/db';
import { defaultStatePath, loadState, resetState } from './state.js';
import {
  runAbilities,
  runItems,
  runLearnsets,
  runMoves,
  runPokemon,
  type RunContext,
  type RunStats,
} from './run.js';

interface CliArgs {
  all: boolean;
  pokemon: boolean;
  moves: boolean;
  abilities: boolean;
  items: boolean;
  learnsets: boolean;
  resume: boolean;
  state: string;
}

async function main(): Promise<void> {
  const argv = (await yargs(hideBin(process.argv))
    .scriptName('crawl')
    .option('all', { type: 'boolean', default: false, describe: 'Run every step' })
    .option('pokemon', { type: 'boolean', default: false, describe: 'Crawl pokemons + varieties' })
    .option('moves', { type: 'boolean', default: false, describe: 'Crawl moves' })
    .option('abilities', { type: 'boolean', default: false, describe: 'Crawl abilities' })
    .option('items', { type: 'boolean', default: false, describe: 'Crawl items' })
    .option('learnsets', { type: 'boolean', default: false, describe: 'Crawl learnsets' })
    .option('resume', { type: 'boolean', default: false, describe: 'Skip already-done IDs' })
    .option('state', {
      type: 'string',
      default: defaultStatePath(),
      describe: 'Path to resume state JSON',
    })
    .help()
    .strict()
    .parse()) as unknown as CliArgs;

  const steps = argv.all
    ? { pokemon: true, moves: true, abilities: true, items: true, learnsets: true }
    : {
        pokemon: argv.pokemon,
        moves: argv.moves,
        abilities: argv.abilities,
        items: argv.items,
        learnsets: argv.learnsets,
      };

  if (!Object.values(steps).some(Boolean)) {
    console.error('No steps selected. Use --all or one of --pokemon, --moves, --abilities, --items, --learnsets.');
    process.exit(2);
  }

  const state = argv.resume ? await loadState(argv.state) : resetState();
  const ctx: RunContext = {
    prisma,
    state,
    statePath: argv.state,
    resume: argv.resume,
    log: (msg: string) => console.log(msg),
  };

  const totals: Record<string, RunStats> = {};
  const started = Date.now();

  try {
    if (steps.pokemon) totals.pokemon = await runPokemon(ctx);
    if (steps.moves) totals.moves = await runMoves(ctx);
    if (steps.abilities) totals.abilities = await runAbilities(ctx);
    if (steps.items) totals.items = await runItems(ctx);
    if (steps.learnsets) totals.learnsets = await runLearnsets(ctx);
  } finally {
    await prisma.$disconnect();
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s`);
  for (const [step, s] of Object.entries(totals)) {
    console.log(
      `  ${step.padEnd(10)} attempted=${s.attempted} written=${s.written} skipped=${s.skipped} failed=${s.failed}`
    );
  }

  const anyFailed = Object.values(totals).some((s) => s.failed > 0);
  process.exit(anyFailed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
