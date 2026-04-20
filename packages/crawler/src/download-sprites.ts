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
import { fileURLToPath } from "node:url";
import { prisma } from "@pokesearch/db";

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const FORCE = process.argv.includes("--force");

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
// Resolve workspace root (packages/crawler/src → ../../.. = repo root)
const WORKSPACE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
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

// Special cases where PokeAPI uses unusual slugs that the suffix map cannot
// reach. Longest/most-specific keys should be tried first in lookup.
const SPECIAL_SLUGS: Record<string, string> = {
  gourgeist: "gourgeist-average",
  gourgeistsmall: "gourgeist-small",
  gourgeistlarge: "gourgeist-large",
  gourgeistsuper: "gourgeist-super",
  pumpkaboo: "pumpkaboo-average",
  pumpkaboosmall: "pumpkaboo-small",
  pumpkaboolarge: "pumpkaboo-large",
  pumpkaboosuper: "pumpkaboo-super",
  lycanroc: "lycanroc-midday",
  lycanrocmidnight: "lycanroc-midnight",
  lycanrocdusk: "lycanroc-dusk",
  mimikyu: "mimikyu-disguised",
  kommoo: "kommo-o",
  hakamoo: "hakamo-o",
  jangmoo: "jangmo-o",
  mrrime: "mr-rime",
  mrmime: "mr-mime",
  mrmimegalar: "mr-mime-galar",
  mimejr: "mime-jr",
  morpeko: "morpeko-full-belly",
  basculegion: "basculegion-male",
  basculegionf: "basculegion-female",
  maushold: "maushold-family-of-four",
  palafin: "palafin-zero",
  indeedee: "indeedee-male",
  indeedeef: "indeedee-female",
  meowsticf: "meowstic-female",
  meowstic: "meowstic-male",
  nidoranf: "nidoran-f",
  nidoranm: "nidoran-m",
  porygonz: "porygon-z",
  typenull: "type-null",
  tapukoko: "tapu-koko",
  tapulele: "tapu-lele",
  tapubulu: "tapu-bulu",
  tapufini: "tapu-fini",
  oricorio: "oricorio-baile",
  oricoriopompom: "oricorio-pom-pom",
  oricoriopau: "oricorio-pau",
  oricoriosensu: "oricorio-sensu",
  toxtricity: "toxtricity-amped",
  toxtricitylowkey: "toxtricity-low-key",
  aegislash: "aegislash-shield",
  rotomheat: "rotom-heat",
  rotomwash: "rotom-wash",
  rotomfrost: "rotom-frost",
  rotomfan: "rotom-fan",
  rotommow: "rotom-mow",
  taurospaldeacombat: "tauros-paldea-combat-breed",
  taurospaldeablaze: "tauros-paldea-blaze-breed",
  taurospaldeaaqua: "tauros-paldea-aqua-breed",
};

// Explicit fallback overrides for fringe cases where stripping the suffix
// yields an ID we don't actually have a sprite for.
const FALLBACK_BASE: Record<string, string> = {
  meowsticmmega: "meowstic",
  meowsticfmega: "meowstic",
};

/** Strip any known form suffix to derive the base showdownId. */
function stripFormSuffix(showdownId: string): string | null {
  if (FALLBACK_BASE[showdownId]) {
    return FALLBACK_BASE[showdownId];
  }
  for (const [suffix] of SUFFIXES) {
    if (showdownId.endsWith(suffix)) {
      return showdownId.slice(0, showdownId.length - suffix.length);
    }
  }
  return null;
}

/**
 * Convert a Showdown ID (e.g. "charizardmegax") to a PokeAPI slug
 * (e.g. "charizard-mega-x").
 */
function showdownIdToSlug(showdownId: string): string {
  if (SPECIAL_SLUGS[showdownId]) {
    return SPECIAL_SLUGS[showdownId];
  }
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
      'official-artwork'?: {
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
  // Prefer the cleaner "home" render; fall back to official artwork for forms
  // (e.g. Floette-Eternal, some Mega forms) where PokeAPI has no home sprite.
  const url =
    data?.sprites?.other?.home?.front_default ??
    data?.sprites?.other?.['official-artwork']?.front_default ??
    null;
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

  const pokemons: { id: number; showdownId: string | null; nameEn: string }[] =
    await prisma.pokemon.findMany({
      select: { id: true, showdownId: true, nameEn: true },
      orderBy: { id: "asc" },
    });

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
      // Fallback: for Champions-exclusive forms (e.g. hawluchamega) that
      // don't exist on PokeAPI, copy the base-form sprite if we already have
      // it locally. Strip any known form suffix to derive the base showdownId.
      const baseId = stripFormSuffix(pokemon.showdownId);
      if (baseId && baseId !== pokemon.showdownId) {
        const basePath = path.join(OUTPUT_DIR, `${baseId}.png`);
        if (fs.existsSync(basePath)) {
          await fs.promises.copyFile(basePath, destPath);
          downloaded++;
          console.log(
            `${progress} FALLBK  ${pokemon.showdownId}.png (← ${baseId}.png)`
          );
          continue;
        }
      }
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
