#!/usr/bin/env node
// CLI entry for the PokeSearch Champions crawler.
//
//   pnpm --filter @pokesearch/crawler crawl
//   pnpm --filter @pokesearch/crawler crawl --resume
//   pnpm --filter @pokesearch/crawler crawl --allow-missing-ko

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { prisma } from '@pokesearch/db';
import { defaultStatePath, loadState, resetState } from './state.js';
import { runChampions, type RunContext } from './run.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Package root; helpers (defaultKoDir, defaultManifestPath) append `data/` themselves.
const DEFAULT_DATA_DIR = path.resolve(__dirname, '..');

async function main(): Promise<void> {
  const argv = await yargs(hideBin(process.argv))
    .scriptName('crawl')
    .option('resume', {
      type: 'boolean',
      default: false,
      describe: 'Skip steps already marked done in the state file',
    })
    .option('allow-missing-ko', {
      type: 'boolean',
      default: false,
      describe: 'Continue even when Korean translations are missing (dev mode)',
    })
    .option('state', {
      type: 'string',
      default: defaultStatePath(),
      describe: 'Path to resume state JSON',
    })
    .option('data-dir', {
      type: 'string',
      default: DEFAULT_DATA_DIR,
      describe: 'Directory containing data/ko/*.json and id-manifest.json',
    })
    .help()
    .strict()
    .parse();

  const state = argv.resume ? await loadState(argv.state as string) : resetState();

  const ctx: RunContext = {
    prisma,
    state,
    statePath: argv.state as string,
    resume: argv.resume as boolean,
    allowMissingKo: argv['allow-missing-ko'] as boolean,
    dataDir: argv['data-dir'] as string,
    log: (msg: string) => console.log(msg),
  };

  const started = Date.now();
  let totals: Record<string, { attempted: number; written: number; skipped: number; failed: number }> = {};

  try {
    totals = await runChampions(ctx);
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
