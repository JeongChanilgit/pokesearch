import { prisma, hashPassword } from '@pokesearch/db';
import type { CreateTeamRequest } from '@pokesearch/types';

export async function createTeamRecord(
  input: CreateTeamRequest,
): Promise<{ id: string }> {
  const hash = await hashPassword(input.password);

  const team = await prisma.$transaction(async (tx) => {
    const created = await tx.team.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        level: input.level,
        passwordHash: hash,
        pokemons: {
          create: input.pokemons.map((p) => ({
            slotOrder: p.slotOrder,
            pokemonId: p.pokemonId,
            abilityId: p.abilityId,
            itemId: p.itemId ?? null,
            natureId: p.natureId,
            evH: p.evs.h,
            evA: p.evs.a,
            evB: p.evs.b,
            evC: p.evs.c,
            evD: p.evs.d,
            evS: p.evs.s,
            ivH: p.ivs.h,
            ivA: p.ivs.a,
            ivB: p.ivs.b,
            ivC: p.ivs.c,
            ivD: p.ivs.d,
            ivS: p.ivs.s,
            teraType: p.teraType ?? null,
            moves: {
              create: p.moves.map((m) => ({
                moveId: m.moveId,
                slotOrder: m.slotOrder,
              })),
            },
          })),
        },
      },
      select: { id: true },
    });
    return created;
  });

  return { id: team.id };
}
