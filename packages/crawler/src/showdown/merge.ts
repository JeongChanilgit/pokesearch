// Merge a Showdown base data table with a Champions mod override.
//
// Semantics (matches what `Dex.mod()` does at runtime):
// - If a slug exists in the mod and has `inherit: true`, base fields are
//   kept and the mod's other fields override them.
// - If a slug exists in the mod without `inherit`, the mod entry fully
//   replaces the base entry (rare in practice).
// - Slugs only in the base are kept as-is.
// - Slugs only in the mod are added verbatim (after stripping `inherit`).
//
// The `inherit` key itself is always removed from the output.

import type { ShowdownRecord } from './parse.js';

export function mergeModTable(
  base: ShowdownRecord,
  mod: ShowdownRecord
): ShowdownRecord {
  const out: ShowdownRecord = {};

  for (const [slug, baseEntry] of Object.entries(base)) {
    const modEntry = mod[slug];
    if (modEntry === undefined) {
      out[slug] = baseEntry;
      continue;
    }
    out[slug] = combineEntry(baseEntry, modEntry);
  }

  for (const [slug, modEntry] of Object.entries(mod)) {
    if (slug in out) continue;
    out[slug] = stripInherit(modEntry);
  }

  return out;
}

function combineEntry(baseEntry: unknown, modEntry: unknown): unknown {
  if (!isPlainObject(baseEntry) || !isPlainObject(modEntry)) return modEntry;
  const inherit = modEntry.inherit === true;
  if (!inherit) return stripInherit(modEntry);
  const merged: Record<string, unknown> = { ...baseEntry };
  for (const [k, v] of Object.entries(modEntry)) {
    if (k === 'inherit') continue;
    merged[k] = v;
  }
  return merged;
}

function stripInherit(entry: unknown): unknown {
  if (!isPlainObject(entry)) return entry;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(entry)) {
    if (k === 'inherit') continue;
    out[k] = v;
  }
  return out;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
