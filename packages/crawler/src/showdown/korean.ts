// Korean translations for Champions-legal entities.
//
// Showdown doesn't ship Korean strings, so we maintain them by hand in
// `packages/crawler/data/ko/*.json`. The crawler expects every legal
// entity to have a Korean entry; a missing one throws (fail-fast) unless
// `--allow-missing-ko` is set, in which case missing slugs are collected
// into `data/ko/missing-slugs.txt` for the user to fill in.

import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface KoEntry {
  name: string;
  description?: string;
}

export type KoTable = Record<string, KoEntry>;

export interface KoTables {
  pokemon: KoTable;
  moves: KoTable;
  abilities: KoTable;
  items: KoTable;
  natures: KoTable;
}

const FILES: Record<keyof KoTables, string> = {
  pokemon: 'pokemon.json',
  moves: 'moves.json',
  abilities: 'abilities.json',
  items: 'items.json',
  natures: 'natures.json',
};

export function defaultKoDir(cwd = process.cwd()): string {
  return path.join(cwd, 'data', 'ko');
}

export async function loadKoTables(dir: string): Promise<KoTables> {
  const out: Partial<KoTables> = {};
  for (const key of Object.keys(FILES) as Array<keyof KoTables>) {
    const file = path.join(dir, FILES[key]);
    try {
      const raw = await fs.readFile(file, 'utf8');
      out[key] = JSON.parse(raw) as KoTable;
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        out[key] = {};
      } else {
        throw err;
      }
    }
  }
  return out as KoTables;
}

export interface MissingTracker {
  allowMissing: boolean;
  missing: Record<keyof KoTables, Array<{ slug: string; nameEn: string }>>;
}

export function createMissingTracker(allowMissing: boolean): MissingTracker {
  return {
    allowMissing,
    missing: {
      pokemon: [],
      moves: [],
      abilities: [],
      items: [],
      natures: [],
    },
  };
}

/**
 * Look up a Korean name/description for a slug. If missing, record in
 * the tracker; throw only when `--allow-missing-ko` is false and we're
 * about to finalize (see `finalizeMissingTracker`).
 */
export function lookupKo(
  tables: KoTables,
  tracker: MissingTracker,
  scope: keyof KoTables,
  slug: string,
  nameEn: string
): KoEntry {
  const entry = tables[scope][slug];
  if (entry && entry.name) return entry;
  tracker.missing[scope].push({ slug, nameEn });
  return { name: nameEn, description: '' };
}

/**
 * Called after all lookups are done. If any required translation is
 * missing and `--allow-missing-ko` is false, throws a formatted error.
 * Either way, writes `missing-slugs.txt` for the user to reference.
 */
export async function finalizeMissingTracker(
  tracker: MissingTracker,
  dir: string
): Promise<void> {
  const lines: string[] = [];
  let total = 0;
  for (const [scope, entries] of Object.entries(tracker.missing)) {
    if (entries.length === 0) continue;
    total += entries.length;
    lines.push(`# ${scope} (${entries.length} missing)`);
    for (const { slug, nameEn } of entries) {
      lines.push(`  ${slug}  — ${nameEn}`);
    }
    lines.push('');
  }

  if (total === 0) {
    await fs.rm(path.join(dir, 'missing-slugs.txt'), { force: true });
    return;
  }

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'missing-slugs.txt'), lines.join('\n'));

  if (!tracker.allowMissing) {
    throw new Error(
      `Korean translations missing for ${total} slug(s). ` +
        `See ${path.join(dir, 'missing-slugs.txt')} and fill in ${Object.values(FILES).join(', ')}. ` +
        `Re-run with --allow-missing-ko to skip this check during development.`
    );
  }
}
