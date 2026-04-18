#!/usr/bin/env node
// Download item sprites from PokeAPI GitHub raw to apps/web/public/sprites/items/.
//
// Usage:
//   pnpm --filter @pokesearch/crawler download-item-sprites
//   pnpm --filter @pokesearch/crawler download-item-sprites --force

import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { prisma } from '@pokesearch/db';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Repo root: packages/crawler/src -> up three levels = repo root.
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const OUT_DIR = path.join(REPO_ROOT, 'apps', 'web', 'public', 'sprites', 'items');
const POKEAPI_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';

/** Convert an English item name to the slug used by PokeAPI sprite filenames. */
function itemSlugFromName(nameEn: string): string {
  return nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Simple rate-limiter: resolve at most `rps` times per second. */
function makeRateLimiter(rps: number) {
  const intervalMs = 1000 / rps;
  let lastTick = 0;

  return async function throttle(): Promise<void> {
    const now = Date.now();
    const wait = intervalMs - (now - lastTick);
    if (wait > 0) {
      await new Promise<void>((res) => setTimeout(res, wait));
    }
    lastTick = Date.now();
  };
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force');

  console.log(`Output dir : ${OUT_DIR}`);
  console.log(`Force mode : ${force ? 'yes (overwrite existing)' : 'no (skip existing)'}`);

  // Ensure output directory exists.
  await fs.mkdir(OUT_DIR, { recursive: true });

  // Fetch all items from DB.
  const items = await prisma.item.findMany({
    select: { id: true, nameEn: true },
    orderBy: { id: 'asc' },
  });

  console.log(`Items in DB: ${items.length}`);

  const throttle = makeRateLimiter(3);

  let downloaded = 0;
  let skippedExisting = 0;
  let missing404 = 0;
  let errors = 0;

  for (const item of items) {
    const slug = itemSlugFromName(item.nameEn);
    const destPath = path.join(OUT_DIR, `${slug}.png`);

    // Skip if already downloaded (unless --force).
    if (!force) {
      try {
        await fs.access(destPath);
        skippedExisting++;
        continue;
      } catch {
        // File does not exist — proceed with download.
      }
    }

    await throttle();

    const url = `${POKEAPI_BASE}/${slug}.png`;

    try {
      const res = await fetch(url);

      if (res.status === 404) {
        console.warn(`  404  ${slug} (id=${item.id}, name="${item.nameEn}")`);
        missing404++;
        continue;
      }

      if (!res.ok) {
        console.error(`  ERR  ${slug} — HTTP ${res.status} ${res.statusText}`);
        errors++;
        continue;
      }

      const buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(destPath, buf);
      console.log(`  OK   ${slug}`);
      downloaded++;
    } catch (err) {
      console.error(`  ERR  ${slug} — ${(err as Error).message}`);
      errors++;
    }
  }

  await prisma.$disconnect();

  console.log('\n--- Summary ---');
  console.log(`  Downloaded      : ${downloaded}`);
  console.log(`  Skipped (exist) : ${skippedExisting}`);
  console.log(`  Not found (404) : ${missing404}`);
  console.log(`  Errors          : ${errors}`);

  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
