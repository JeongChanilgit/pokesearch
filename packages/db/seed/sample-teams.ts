// Idempotent sample teams for local/dev and E2E tests. Skipped if a team
// with the same name already exists. Only uses seeded master data (dex 1-100).

import type { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/password.js';

interface SampleSlot {
  dex: number;
  evs: { h: number; a: number; b: number; c: number; d: number; s: number };
}

interface SampleTeamSpec {
  name: string;
  description: string;
  level: 50 | 100;
  likesCount: number;
  views: number;
  slots: SampleSlot[];
}

const SAMPLE_TEAMS: SampleTeamSpec[] = [
  {
    name: 'Kanto Starters',
    description: 'Classic Gen 1 starter trio plus three fan favorites.',
    level: 50,
    likesCount: 75,
    views: 100,
    slots: [
      { dex: 3, evs: { h: 252, a: 0, b: 4, c: 252, d: 0, s: 0 } },
      { dex: 6, evs: { h: 0, a: 0, b: 4, c: 252, d: 0, s: 252 } },
      { dex: 9, evs: { h: 252, a: 0, b: 252, c: 0, d: 4, s: 0 } },
      { dex: 25, evs: { h: 0, a: 4, b: 0, c: 252, d: 0, s: 252 } },
      { dex: 65, evs: { h: 0, a: 0, b: 4, c: 252, d: 0, s: 252 } },
      { dex: 94, evs: { h: 0, a: 0, b: 4, c: 252, d: 0, s: 252 } },
    ],
  },
  {
    name: 'Defensive Wall',
    description: 'Bulky team built around Blastoise and Venusaur.',
    level: 50,
    likesCount: 60,
    views: 98,
    slots: [
      { dex: 9, evs: { h: 252, a: 0, b: 252, c: 0, d: 4, s: 0 } },
      { dex: 3, evs: { h: 252, a: 0, b: 0, c: 4, d: 252, s: 0 } },
      { dex: 76, evs: { h: 252, a: 252, b: 4, c: 0, d: 0, s: 0 } },
      { dex: 95, evs: { h: 252, a: 4, b: 252, c: 0, d: 0, s: 0 } },
      { dex: 68, evs: { h: 4, a: 252, b: 0, c: 0, d: 0, s: 252 } },
      { dex: 65, evs: { h: 0, a: 0, b: 4, c: 252, d: 0, s: 252 } },
    ],
  },
  {
    name: 'Speed Demon',
    description: 'Fast attackers optimized for offensive pressure.',
    level: 100,
    likesCount: 45,
    views: 82,
    slots: [
      { dex: 25, evs: { h: 0, a: 4, b: 0, c: 252, d: 0, s: 252 } },
      { dex: 65, evs: { h: 0, a: 0, b: 4, c: 252, d: 0, s: 252 } },
      { dex: 6, evs: { h: 0, a: 0, b: 4, c: 252, d: 0, s: 252 } },
      { dex: 94, evs: { h: 0, a: 0, b: 4, c: 252, d: 0, s: 252 } },
      { dex: 38, evs: { h: 0, a: 0, b: 4, c: 252, d: 0, s: 252 } },
      { dex: 97, evs: { h: 0, a: 0, b: 4, c: 252, d: 0, s: 252 } },
    ],
  },
];

export async function seedSampleTeams(prisma: PrismaClient): Promise<number> {
  const ability = await prisma.ability.findFirst({ orderBy: { id: 'asc' } });
  const item = await prisma.item.findFirst({ orderBy: { id: 'asc' } });
  const neutralNature = await prisma.nature.findFirst({
    where: { boostStat: null, reduceStat: null },
    orderBy: { id: 'asc' },
  });
  if (!ability || !item || !neutralNature) {
    console.warn('  sample teams: master data missing, skipping');
    return 0;
  }
  const hashed = await hashPassword('test1234');

  let created = 0;
  for (const spec of SAMPLE_TEAMS) {
    const existing = await prisma.team.findFirst({ where: { name: spec.name } });
    if (existing) continue;

    const pokemonData: Array<{
      slot: SampleSlot;
      slotOrder: number;
      pokemonId: number;
      moveIds: number[];
    }> = [];
    let allFound = true;
    for (let i = 0; i < spec.slots.length; i++) {
      const slot = spec.slots[i];
      const pokemonId = slot.dex * 100;
      const p = await prisma.pokemon.findUnique({ where: { id: pokemonId } });
      if (!p) {
        allFound = false;
        break;
      }
      const learnable = await prisma.pokemonLearnableMove.findMany({
        where: { pokemonId },
        take: 4,
        orderBy: { moveId: 'asc' },
      });
      if (learnable.length === 0) {
        allFound = false;
        break;
      }
      pokemonData.push({
        slot,
        slotOrder: i + 1,
        pokemonId,
        moveIds: learnable.map((l) => l.moveId),
      });
    }
    if (!allFound) continue;

    await prisma.team.create({
      data: {
        name: spec.name,
        description: spec.description,
        level: spec.level,
        passwordHash: hashed,
        likesCount: spec.likesCount,
        views: spec.views,
        pokemons: {
          create: pokemonData.map((d) => ({
            slotOrder: d.slotOrder,
            pokemonId: d.pokemonId,
            abilityId: ability.id,
            itemId: item.id,
            natureId: neutralNature.id,
            evH: d.slot.evs.h,
            evA: d.slot.evs.a,
            evB: d.slot.evs.b,
            evC: d.slot.evs.c,
            evD: d.slot.evs.d,
            evS: d.slot.evs.s,
            moves: {
              create: d.moveIds.map((moveId, idx) => ({
                moveId,
                slotOrder: idx + 1,
              })),
            },
          })),
        },
      },
    });
    created++;
  }
  return created;
}
