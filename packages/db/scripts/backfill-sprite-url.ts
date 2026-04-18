#!/usr/bin/env tsx
/**
 * backfill-sprite-url.ts
 *
 * Idempotent backfill: updates `pokemons.sprite_url` to the new local
 * relative path `/sprites/pokemon/<showdownId>.png` for every row that
 * does not already use this format.
 *
 * Strategy
 * --------
 * For each Pokemon row with a non-null `showdown_id`, set:
 *   sprite_url = '/sprites/pokemon/' + showdownId + '.png'
 *
 * Rows where `showdown_id IS NULL` are logged and skipped — this should
 * not happen after the crawler has run, but we guard defensively.
 *
 * Only rows whose `sprite_url` does NOT already start with `/sprites/`
 * are touched → fully idempotent.
 *
 * Usage
 * -----
 *   pnpm --filter @pokesearch/db backfill:sprite-url
 *
 * Environment
 * -----------
 *   DATABASE_URL must be set (same as for migrations / the crawler).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Fetch all Pokemon rows whose sprite_url does not yet use the local path.
  const staleRows = await prisma.pokemon.findMany({
    where: {
      NOT: {
        spriteUrl: { startsWith: '/sprites/' },
      },
    },
    select: {
      id: true,
      spriteUrl: true,
      showdownId: true,
    },
    orderBy: { id: 'asc' },
  });

  if (staleRows.length === 0) {
    console.log('[backfill] Nothing to do — all sprite_url values are up to date.');
    return;
  }

  console.log(`[backfill] Found ${staleRows.length} rows with stale sprite_url.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const row of staleRows) {
    if (!row.showdownId) {
      console.warn(
        `[backfill] Skipping id=${row.id}: showdown_id is null. Run the crawler first.`,
      );
      skippedCount++;
      continue;
    }

    const newUrl = `/sprites/pokemon/${row.showdownId}.png`;

    await prisma.pokemon.update({
      where: { id: row.id },
      data: { spriteUrl: newUrl },
    });

    updatedCount++;
    if (updatedCount % 50 === 0) {
      console.log(`[backfill]   ... updated ${updatedCount} rows so far`);
    }
  }

  console.log(
    `[backfill] Done. Updated ${updatedCount} sprite_url values.` +
      (skippedCount > 0
        ? ` Skipped ${skippedCount} rows with null showdown_id.`
        : ''),
  );
}

main()
  .catch((err) => {
    console.error('[backfill] Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
