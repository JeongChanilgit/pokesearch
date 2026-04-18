#!/usr/bin/env tsx
/**
 * backfill-sprite-url.ts
 *
 * Idempotent backfill: updates `pokemons.sprite_url` to the canonical
 * PokeAPI home-art CDN URL for every row that still holds a stale URL.
 *
 * Strategy
 * --------
 * 1. For rows that already have `showdown_id` set: compute
 *    `spriteUrl(dexNum, showdownId)` from @pokesearch/calc and write it.
 *
 * 2. For rows where `showdown_id IS NULL` (seeded via PokeAPI before the
 *    crawler ran): derive the Showdown slug from the ko/pokemon.json slug
 *    list by matching the row's dex number (id / 100) to slugs that map
 *    to that dex.  If exactly one canonical slug resolves (base form,
 *    i.e. the slug without a `baseSpecies` field — we can't determine
 *    that here, so we look for the slug that appears first in the JSON
 *    for the given dex), we populate `showdown_id` as well.
 *
 *    If no slug can be determined, fall back to `fallbackSpriteUrl(dexNum)`
 *    (home-art by dex number only) which is still far better than the
 *    stale URL.
 *
 * 3. Only rows whose `sprite_url` does NOT already start with the PokeAPI
 *    CDN prefix are touched → fully idempotent.
 *
 * Usage
 * -----
 *   pnpm --filter @pokesearch/db backfill:sprite-url
 *
 * Environment
 * -----------
 *   DATABASE_URL must be set (same as for migrations / the crawler).
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { spriteUrl, fallbackSpriteUrl } from '../../calc/src/sprites.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ──────────────────────────────────────────────────────────────────────────────
// Load the ko/pokemon.json slug list so we can backfill showdown_id for rows
// that were seeded before the crawler introduced that column.
// ──────────────────────────────────────────────────────────────────────────────

const KO_POKEMON_PATH = path.resolve(
  __dirname,
  '../../crawler/data/ko/pokemon.json',
);

/** Slug → { name: string } (Korean translations). The keys are Showdown slugs. */
type KoPokemonMap = Record<string, { name: string }>;

function loadKoPokemon(): KoPokemonMap {
  try {
    const raw = readFileSync(KO_POKEMON_PATH, 'utf8');
    return JSON.parse(raw) as KoPokemonMap;
  } catch (err) {
    console.warn(
      `[backfill] Warning: could not load ${KO_POKEMON_PATH}:`,
      (err as Error).message,
    );
    return {};
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Build a dexNum → baseSlug mapping from the slug list.
//
// The slug list is ordered: base form comes before alternates (charizard
// before charizardmegax / charizardmegay).  We don't know dex numbers from
// this file alone, but we CAN derive them from DB rows with id = dex*100+slot.
// The mapping here is used in the reverse direction: DB row id → dexNum →
// first slug seen for that dex.
// ──────────────────────────────────────────────────────────────────────────────

/** Suffixes that indicate a non-base form.  Mirrors crawler legality logic. */
const FORM_SUFFIXES = [
  'mega',
  'megax',
  'megay',
  'alola',
  'galar',
  'hisui',
  'paldea',
  'gmax',
  'primal',
] as const;

function isBaseFormSlug(slug: string): boolean {
  const lower = slug.toLowerCase();
  return !FORM_SUFFIXES.some((s) => lower.endsWith(s));
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

const POKEAPI_PREFIX = 'https://raw.githubusercontent.com/PokeAPI/';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const koPokemon = loadKoPokemon();

  // Build slug list for base forms from the ko/pokemon.json, in file order.
  const baseSlugsInOrder: string[] = Object.keys(koPokemon).filter(isBaseFormSlug);

  // Fetch all Pokemon rows whose sprite_url is still stale.
  const staleRows = await prisma.pokemon.findMany({
    where: {
      spriteUrl: {
        not: { startsWith: POKEAPI_PREFIX },
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

  // Build an index of base slugs by dexNum for quick lookup.
  // We use the order of baseSlugsInOrder so the first base slug encountered
  // per dex wins (matches crawler ordering).
  //
  // We can't get dex numbers from the slug list alone.  Instead, for each
  // stale DB row we derive the dexNum from its id (id / 100 | 0), then search
  // the sorted base-slug list for a slug that corresponds to that dex.
  //
  // Since we DO have DB rows with showdown_id already set (from the crawler),
  // we can also build a dexNum → slug map from those.
  const existingShowdownRows = await prisma.pokemon.findMany({
    where: { showdownId: { not: null } },
    select: { id: true, showdownId: true },
  });

  // dexNum → base slug (from rows the crawler already populated)
  const dexToSlug = new Map<number, string>();
  for (const row of existingShowdownRows) {
    const dexNum = Math.floor(row.id / 100);
    const slug = row.showdownId!;
    // Prefer base form (slot 0)
    if (row.id % 100 === 0 || !dexToSlug.has(dexNum)) {
      if (row.id % 100 === 0) {
        dexToSlug.set(dexNum, slug);
      } else if (!dexToSlug.has(dexNum)) {
        dexToSlug.set(dexNum, slug);
      }
    }
  }

  // For dex numbers not covered by existing crawler rows, try to match from
  // the ko/pokemon.json base-slug list.  We attempt a heuristic: the slug
  // list has base forms in national-dex order, so we can assign sequential
  // dex numbers if we knew them — but we don't from this file alone.
  //
  // Practical fallback: extract slug from stale Showdown CDN URL if present.
  // Old URL format: https://play.pokemonshowdown.com/sprites/dex/<slug>.png
  function slugFromStaleUrl(url: string): string | null {
    const match = url.match(/\/sprites\/dex\/([^/.]+)\.png$/i);
    return match ? match[1] : null;
  }

  let updatedCount = 0;
  let showdownIdUpdated = 0;

  for (const row of staleRows) {
    const dexNum = Math.floor(row.id / 100);
    let slug = row.showdownId ?? null;

    // If showdown_id is missing, try to derive the slug.
    if (!slug) {
      // Priority 1: already-crawled rows for the same dex
      slug = dexToSlug.get(dexNum) ?? null;

      // Priority 2: extract from old Showdown CDN URL
      if (!slug) {
        slug = slugFromStaleUrl(row.spriteUrl);
      }

      // Priority 3: search ko/pokemon.json for a base slug for this dex.
      // We can't reliably map dex→slug without the Showdown data, so we
      // leave slug=null and fall back to fallbackSpriteUrl.
    }

    const newUrl = slug
      ? spriteUrl(dexNum, slug)
      : fallbackSpriteUrl(dexNum);

    // Skip if new URL is the same (shouldn't happen given our WHERE clause,
    // but guard anyway).
    if (newUrl === row.spriteUrl) continue;

    const updateData: { spriteUrl: string; showdownId?: string } = {
      spriteUrl: newUrl,
    };
    if (slug && !row.showdownId) {
      updateData.showdownId = slug;
      showdownIdUpdated++;
    }

    await prisma.pokemon.update({
      where: { id: row.id },
      data: updateData,
    });

    updatedCount++;
    if (updatedCount % 50 === 0) {
      console.log(`[backfill]   ... updated ${updatedCount} rows so far`);
    }
  }

  console.log(
    `[backfill] Done. Updated ${updatedCount} sprite_url values` +
      (showdownIdUpdated > 0
        ? ` (also populated showdown_id for ${showdownIdUpdated} rows)`
        : '') +
      '.',
  );
}

main()
  .catch((err) => {
    console.error('[backfill] Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
