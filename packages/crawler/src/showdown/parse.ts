// Evaluates a Pokémon Showdown `.ts` data file and returns the exported
// object as plain JSON-ish data.
//
// Showdown data files look like:
//
//   export const Pokedex: import('...').SpeciesDataTable = {
//     bulbasaur: { num: 1, ... },
//     ...
//   };
//
// We don't care about Showdown's battle handlers (`onStart`, `onDamage`
// etc.) — we only need the static fields. Strategy:
//
// 1. Transpile the TypeScript source to plain JavaScript with esbuild
//    (drops type annotations, preserves all runtime values).
// 2. Extract the object literal from the transpiled JS.
// 3. Evaluate it in a sandboxed `vm` context. Function-valued properties
//    are evaluated to real functions but remain in the result; we filter
//    them out below via `scrubFunctions`.
// 4. Return a deep-cloned plain-object copy — functions dropped,
//    everything else kept as-is.

import vm from 'node:vm';
import { transformSync } from 'esbuild';

export type ShowdownRecord = Record<string, unknown>;

export function parseShowdownFile(source: string): ShowdownRecord {
  // Transpile TypeScript → JavaScript so vm can evaluate it without
  // choking on type annotations, generics, non-null assertions, etc.
  const { code: jsSource } = transformSync(source, {
    loader: 'ts',
    target: 'node18',
    format: 'esm',
    minify: false,
  });

  const body = extractObjectLiteral(jsSource);
  const sandbox: Record<string, unknown> = {};
  const context = vm.createContext(sandbox);
  const raw = vm.runInContext(`(${body})`, context, { timeout: 10000 }) as ShowdownRecord;
  return scrubFunctions(raw) as ShowdownRecord;
}

function extractObjectLiteral(source: string): string {
  // Remove single-line and block comments first so they don't confuse the
  // brace scanner.
  const withoutComments = stripComments(source);
  const braceStart = withoutComments.indexOf('{');
  if (braceStart === -1) throw new Error('parseShowdownFile: no `{` found in source');

  // Walk from the first `{` matching braces, ignoring those inside string
  // literals or template strings.
  let depth = 0;
  let inString: '"' | "'" | '`' | null = null;
  let escape = false;
  for (let i = braceStart; i < withoutComments.length; i++) {
    const ch = withoutComments[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch as '"' | "'" | '`';
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return withoutComments.slice(braceStart, i + 1);
    }
  }
  throw new Error('parseShowdownFile: unbalanced braces');
}

function stripComments(source: string): string {
  let out = '';
  let inString: '"' | "'" | '`' | null = null;
  let escape = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];
    if (escape) {
      out += ch;
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === '\\') {
        out += ch;
        escape = true;
        continue;
      }
      if (ch === inString) inString = null;
      out += ch;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch as '"' | "'" | '`';
      out += ch;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      if (i < source.length) out += source[i];
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < source.length - 1 && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i++;
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * Recursively replace function-valued properties with `undefined` (which
 * become missing keys after JSON round-tripping) so the result is pure
 * data. Arrays and nested objects are preserved.
 */
function scrubFunctions(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'function') return undefined;
  if (Array.isArray(value)) return value.map(scrubFunctions);
  if (typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const scrubbed = scrubFunctions(v);
    if (scrubbed !== undefined) out[k] = scrubbed;
  }
  return out;
}
