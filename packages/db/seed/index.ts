// Bilingual sample seed: 100 Pokémon + ~200 moves + ~80 abilities +
// 50 items + 25 natures + a minimal learnable-moves map. Safe to re-run.

import { PrismaClient } from '@prisma/client';
import { items } from './data/items.js';
import { uniqueMoveSlugs } from './data/move-slugs.js';
import { uniqueAbilitySlugs } from './data/ability-slugs.js';
import { natureSlugs } from './data/nature-slugs.js';
import {
  batchFetch,
  fetchAbility,
  fetchMove,
  fetchNature,
  fetchPokemon,
} from './data/poke-api.js';

const prisma = new PrismaClient();

const POKEMON_COUNT = 100;
const MOVES_PER_POKEMON = 12;

async function seedNatures() {
  const fetched = await batchFetch(natureSlugs, fetchNature, {
    concurrency: 8,
    label: 'natures',
  });
  for (const n of fetched) {
    await prisma.nature.upsert({
      where: { id: n.id },
      create: n,
      update: n,
    });
  }
  if (fetched.length !== 25) {
    throw new Error(`Expected 25 natures from PokeAPI, got ${fetched.length}`);
  }
  const neutral = fetched.filter((n) => n.boostStat === null && n.reduceStat === null);
  if (neutral.length !== 5) {
    throw new Error(`Expected exactly 5 neutral natures, got ${neutral.length}`);
  }
  return fetched.length;
}

async function seedItems() {
  for (const it of items) {
    await prisma.item.upsert({
      where: { id: it.id },
      create: {
        id: it.id,
        nameEn: it.nameEn,
        nameKo: it.nameKo,
        descriptionEn: it.descriptionEn,
        descriptionKo: it.descriptionKo,
        effectMult: it.effectMult ?? undefined,
      },
      update: {
        nameEn: it.nameEn,
        nameKo: it.nameKo,
        descriptionEn: it.descriptionEn,
        descriptionKo: it.descriptionKo,
        effectMult: it.effectMult ?? undefined,
      },
    });
  }
}

async function seedPokemons() {
  const dexIds = Array.from({ length: POKEMON_COUNT }, (_, i) => i + 1);
  const fetched = await batchFetch(dexIds, fetchPokemon, {
    concurrency: 8,
    label: 'pokemon',
  });

  for (const p of fetched) {
    const id = p.dex * 100;
    const data = {
      id,
      nameEn: p.nameEn,
      nameKo: p.nameKo,
      types: p.types,
      baseH: p.baseH,
      baseA: p.baseA,
      baseB: p.baseB,
      baseC: p.baseC,
      baseD: p.baseD,
      baseS: p.baseS,
      spriteUrl: p.spriteUrl,
      formOf: null as number | null,
    };
    await prisma.pokemon.upsert({
      where: { id },
      create: data,
      update: data,
    });
  }
  return fetched.length;
}

async function seedMoves() {
  const fetched = await batchFetch(uniqueMoveSlugs, fetchMove, {
    concurrency: 8,
    label: 'moves',
  });
  for (const m of fetched) {
    await prisma.move.upsert({
      where: { id: m.id },
      create: m,
      update: m,
    });
  }
  return fetched.length;
}

async function seedAbilities() {
  const fetched = await batchFetch(uniqueAbilitySlugs, fetchAbility, {
    concurrency: 8,
    label: 'abilities',
  });
  for (const a of fetched) {
    await prisma.ability.upsert({
      where: { id: a.id },
      create: a,
      update: a,
    });
  }
  return fetched.length;
}

// Placeholder learnable-moves map: every seeded pokemon learns the first
// MOVES_PER_POKEMON available moves. The real data lands in slice 10.
async function seedLearnableMoves() {
  const pokemons = await prisma.pokemon.findMany({ select: { id: true } });
  const moves = await prisma.move.findMany({ select: { id: true }, take: MOVES_PER_POKEMON });
  if (pokemons.length === 0 || moves.length === 0) return 0;
  let count = 0;
  for (const p of pokemons) {
    for (const m of moves) {
      await prisma.pokemonLearnableMove.upsert({
        where: { pokemonId_moveId: { pokemonId: p.id, moveId: m.id } },
        create: { pokemonId: p.id, moveId: m.id },
        update: {},
      });
      count++;
    }
  }
  return count;
}

async function main() {
  console.log('Seeding PokeSearch master data…');

  const natureCount = await seedNatures();
  console.log(`  natures: ${natureCount} ✓`);

  await seedItems();
  console.log(`  items: ${items.length} ✓`);

  const pokemonCount = await seedPokemons();
  const moveCount = await seedMoves();
  const abilityCount = await seedAbilities();
  const learnCount = await seedLearnableMoves();

  console.log(
    `Seeded ${pokemonCount} pokemons, ${moveCount} moves, ${abilityCount} abilities, ${items.length} items, ${natureCount} natures (${learnCount} learnable-move rows)`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
