// Hash-aware upsert helpers. Each writer hashes the row it's about to
// send and checks `crawler_hashes`; if the hash matches the stored one
// the write is skipped. This keeps re-runs cheap when the upstream data
// hasn't changed.

import { createHash } from 'node:crypto';
import type { PrismaClient } from '@pokesearch/db';
import type { ParsedPokemon } from './parsers/pokemon.js';
import type { ParsedMove } from './parsers/move.js';
import type { ParsedAbility } from './parsers/ability.js';
import type { ParsedItem } from './parsers/item.js';
import type { ParsedLearnsetEntry } from './parsers/learnset.js';
import type { ParsedNature } from './parsers/nature.js';

export type EntityType = 'pokemon' | 'move' | 'ability' | 'item' | 'learnset' | 'nature';

export interface WriteResult {
  written: number;
  skipped: number;
}

export function hashRow(row: unknown): string {
  const json = stableStringify(row);
  return createHash('sha256').update(json).digest('hex');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`
  );
  return `{${parts.join(',')}}`;
}

async function shouldWrite(
  prisma: PrismaClient,
  entityType: EntityType,
  entityId: string,
  hash: string
): Promise<boolean> {
  const existing = await prisma.crawlerHash.findUnique({
    where: { entityType_entityId: { entityType, entityId } },
  });
  return existing?.contentHash !== hash;
}

async function recordHash(
  prisma: PrismaClient,
  entityType: EntityType,
  entityId: string,
  hash: string
): Promise<void> {
  await prisma.crawlerHash.upsert({
    where: { entityType_entityId: { entityType, entityId } },
    create: { entityType, entityId, contentHash: hash },
    update: { contentHash: hash },
  });
}

// ---------- Writers ----------

export async function writePokemon(
  prisma: PrismaClient,
  row: ParsedPokemon
): Promise<boolean> {
  const hash = hashRow(row);
  const entityId = `pokemon:${row.id}`;
  if (!(await shouldWrite(prisma, 'pokemon', entityId, hash))) return false;
  await prisma.pokemon.upsert({
    where: { id: row.id },
    create: row,
    update: row,
  });
  await recordHash(prisma, 'pokemon', entityId, hash);
  return true;
}

export async function writeMove(
  prisma: PrismaClient,
  row: ParsedMove
): Promise<boolean> {
  const hash = hashRow(row);
  const entityId = `move:${row.id}`;
  if (!(await shouldWrite(prisma, 'move', entityId, hash))) return false;
  await prisma.move.upsert({
    where: { id: row.id },
    create: row,
    update: row,
  });
  await recordHash(prisma, 'move', entityId, hash);
  return true;
}

export async function writeAbility(
  prisma: PrismaClient,
  row: ParsedAbility
): Promise<boolean> {
  const hash = hashRow(row);
  const entityId = `ability:${row.id}`;
  if (!(await shouldWrite(prisma, 'ability', entityId, hash))) return false;
  await prisma.ability.upsert({
    where: { id: row.id },
    create: row,
    update: row,
  });
  await recordHash(prisma, 'ability', entityId, hash);
  return true;
}

export async function writeItem(
  prisma: PrismaClient,
  row: ParsedItem
): Promise<boolean> {
  const hash = hashRow(row);
  const entityId = `item:${row.id}`;
  if (!(await shouldWrite(prisma, 'item', entityId, hash))) return false;
  await prisma.item.upsert({
    where: { id: row.id },
    create: {
      id: row.id,
      nameEn: row.nameEn,
      nameKo: row.nameKo,
      descriptionEn: row.descriptionEn,
      descriptionKo: row.descriptionKo,
      effectMult: row.effectMult ?? undefined,
    },
    update: {
      nameEn: row.nameEn,
      nameKo: row.nameKo,
      descriptionEn: row.descriptionEn,
      descriptionKo: row.descriptionKo,
      effectMult: row.effectMult ?? undefined,
    },
  });
  await recordHash(prisma, 'item', entityId, hash);
  return true;
}

/**
 * Replace the learnset for a single Pokémon. We hash the full set so
 * additions/removals trigger a rewrite; if unchanged we leave the table
 * alone. Rewrites happen in a transaction to avoid half-updated state.
 */
export async function writeLearnset(
  prisma: PrismaClient,
  pokemonId: number,
  entries: ParsedLearnsetEntry[]
): Promise<boolean> {
  const sorted = [...entries].sort((a, b) => a.moveId - b.moveId);
  const hash = hashRow(sorted.map((e) => e.moveId));
  const entityId = `learnset:${pokemonId}`;
  if (!(await shouldWrite(prisma, 'learnset', entityId, hash))) return false;

  await prisma.$transaction([
    prisma.pokemonLearnableMove.deleteMany({ where: { pokemonId } }),
    ...(sorted.length > 0
      ? [prisma.pokemonLearnableMove.createMany({ data: sorted, skipDuplicates: true })]
      : []),
  ]);
  await recordHash(prisma, 'learnset', entityId, hash);
  return true;
}

export async function writeNature(
  prisma: PrismaClient,
  row: ParsedNature
): Promise<boolean> {
  const hash = hashRow(row);
  const entityId = `nature:${row.id}`;
  if (!(await shouldWrite(prisma, 'nature', entityId, hash))) return false;
  await prisma.nature.upsert({
    where: { id: row.id },
    create: row,
    update: row,
  });
  await recordHash(prisma, 'nature', entityId, hash);
  return true;
}
