/**
 * download-sprites.ts
 *
 * Downloads every Pokémon sprite from PokeAPI and saves it to
 * apps/web/public/sprites/pokemon/<showdownId>.png
 *
 * Usage:
 *   DATABASE_URL=... pnpm --filter @pokesearch/crawler download-sprites
 *   DATABASE_URL=... pnpm --filter @pokesearch/crawler download-sprites --force
 */

import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const FORCE = process.argv.includes("--force");

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
// Resolve workspace root (packages/crawler/src → ../../.. = repo root)
const WORKSPACE_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
  ".."
);
const OUTPUT_DIR = path.join(
  WORKSPACE_ROOT,
  "apps",
  "web",
  "public",
  "sprites",
  "pokemon"
);

// ---------------------------------------------------------------------------
// Suffix map — kept self-contained; do NOT import from @pokesearch/calc
// Longest-match first so "megax" wins over "mega" and "alola" wins over "al".
// ---------------------------------------------------------------------------
const SUFFIXES: readonly [string, string][] = [
  ["megax", "mega-x"],
  ["megay", "mega-y"],
  ["mega", "mega"],
  ["gmax", "gmax"],
  ["primal", "primal"],
  ["alola", "alola"],
  ["galar", "galar"],
  ["hisui", "hisui"],
  ["paldea", "paldea"],
];

/**
 * Convert a Showdown ID (e.g. "charizardmegax") to a PokeAPI slug
 * (e.g. "charizard-mega-x").
 */
function showdownIdToSlug(showdownId: string): string {
  for (const [suffix, hyphenated] of SUFFIXES) {
    if (showdownId.endsWith(suffix)) {
      const base = showdownId.slice(0, showdownId.length - suffix.length);
      return `${base}-${hyphenated}`;
    }
  }
  // No suffix matched — base form, slug equals showdownId as-is
  return showdownId;
}

// ---------------------------------------------------------------------------
// Rate limiter — token bucket, max 3 requests/sec
// ---------------------------------------------------------------------------
const RATE_LIMIT_RPS = 3;
const TOKEN_INTERVAL_MS = Math.ceil(1000 / RATE_LIMIT_RPS); // ~334 ms

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Minimal sequential token-bucket: awaits the appropriate gap between calls. */
class RateLimiter {
  private lastCallAt = 0;

  async acquire(): Promise<void> {
    const now = Date.now();
    const wait = TOKEN_INTERVAL_MS - (now - this.lastCallAt);
    if (wait > 0) {
      await sleep(wait);
    }
    this.lastCallAt = Date.now();
  }
}

// ---------------------------------------------------------------------------
// PokeAPI helpers
// ---------------------------------------------------------------------------
const POKEAPI_BASE = "https://pokeapi.co/api/v2/pokemon";

interface PokeApiPokemon {
  sprites: {
    other: {
      home: {
        front_default: string | null;
      };
    };
  };
}

async function fetchSpriteUrl(
  slug: string
): Promise<{ url: string } | { missing: true } | { error: string }> {
  const res = await fetch(`${POKEAPI_BASE}/${slug}`);
  if (res.status === 404) {
    return { missing: true };
  }
  if (!res.ok) {
    return { error: `HTTP ${res.status}` };
  }
  const data = (await res.json()) as PokeApiPokemon;
  const url = data?.sprites?.other?.home?.front_default ?? null;
  if (!url) {
    return { missing: true };
  }
  return { url };
}

async function downloadPng(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download PNG (${res.status}): ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(destPath, buf);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // Ensure output directory exists
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  const prisma = new PrismaClient();

  let pokemons: { id: number; showdownId: string | null; nameEn: string }[];
  try {
    pokemons = await prisma.pokemon.findMany({
      select: { id: true, showdownId: true, nameEn: true },
      orderBy: { id: "asc" },
    });
  } finally {
    await prisma.$disconnect();
  }

  const total = pokemons.length;
  let downloaded = 0;
  let skippedExisting = 0;
  let missing = 0;
  let errors = 0;

  const rateLimiter = new RateLimiter();

  console.log(`Found ${total} Pokémon rows. Output dir: ${OUTPUT_DIR}`);
  if (FORCE) {
    console.log("--force flag set: re-downloading existing sprites.");
  }

  for (let i = 0; i < pokemons.length; i++) {
    const pokemon = pokemons[i];
    const progress = `[${i + 1}/${total}]`;

    if (!pokemon.showdownId) {
      console.log(`${progress} SKIP (no showdownId) id=${pokemon.id} ${pokemon.nameEn}`);
      continue;
    }

    const destPath = path.join(OUTPUT_DIR, `${pokemon.showdownId}.png`);

    if (!FORCE && fs.existsSync(destPath)) {
      skippedExisting++;
      console.log(`${progress} EXISTS  ${pokemon.showdownId}.png`);
      continue;
    }

    const slug = showdownIdToSlug(pokemon.showdownId);

    await rateLimiter.acquire();

    const result = await fetchSpriteUrl(slug);

    if ("missing" in result) {
      missing++;
      console.warn(`${progress} MISSING ${pokemon.showdownId} (slug: ${slug})`);
      continue;
    }

    if ("error" in result) {
      errors++;
      console.error(
        `${progress} ERROR   ${pokemon.showdownId} (slug: ${slug}): ${result.error}`
      );
      continue;
    }

    // We have a URL — download the PNG
    try {
      await downloadPng(result.url, destPath);
      downloaded++;
      console.log(`${progress} OK      ${pokemon.showdownId}.png`);
    } catch (err) {
      errors++;
      console.error(
        `${progress} DLERR   ${pokemon.showdownId}: ${(err as Error).message}`
      );
    }
  }

  console.log(
    `\nDone. downloaded=${downloaded} skipped-existing=${skippedExisting} missing=${missing} errors=${errors}`
  );

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
