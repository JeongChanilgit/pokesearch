// Slug → numeric ID persistence.
//
// Showdown identifies moves/abilities/items by slug, but our DB uses
// numeric primary keys. To keep IDs stable across crawls we persist a
// slug→id map in `packages/crawler/data/id-manifest.json`. On each run:
//
// 1. Load the manifest (empty object on first run).
// 2. For each new slug not in the manifest, assign the next free id and
//    record it.
// 3. Write the manifest back after the crawl.
//
// IDs for Pokémon are NOT in the manifest — they follow the
// `dex * 100 + form_slot` scheme derived from Showdown's `num` field.

import { promises as fs } from 'node:fs';
import path from 'node:path';

export type ManifestScope = 'move' | 'ability' | 'item';

export interface IdManifest {
  move: Record<string, number>;
  ability: Record<string, number>;
  item: Record<string, number>;
}

const EMPTY_MANIFEST: IdManifest = { move: {}, ability: {}, item: {} };

export function defaultManifestPath(cwd = process.cwd()): string {
  return path.join(cwd, 'data', 'id-manifest.json');
}

export async function loadManifest(file: string): Promise<IdManifest> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as Partial<IdManifest>;
    return {
      move: parsed.move ?? {},
      ability: parsed.ability ?? {},
      item: parsed.item ?? {},
    };
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { ...EMPTY_MANIFEST, move: {}, ability: {}, item: {} };
    }
    throw err;
  }
}

export async function saveManifest(file: string, manifest: IdManifest): Promise<void> {
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * Return the numeric id for a slug, assigning a fresh one if unseen.
 * New slugs get the next integer after the current max. Mutates the
 * manifest in-place — call `saveManifest` after the crawl finishes.
 */
export function assignId(manifest: IdManifest, scope: ManifestScope, slug: string): number {
  const table = manifest[scope];
  const existing = table[slug];
  if (existing !== undefined) return existing;
  const maxId = Object.values(table).reduce((a, b) => (b > a ? b : a), 0);
  const next = maxId + 1;
  table[slug] = next;
  return next;
}
