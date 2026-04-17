import { prisma, hashPassword } from '@pokesearch/db';
import type { CreateTeamRequest, UpdateTeamRequest } from '@pokesearch/types';

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

export async function updateTeamRecord(
  id: string,
  input: UpdateTeamRequest,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.team.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new Error('not_found');

    await tx.teamPokemonMove.deleteMany({
      where: { teamPokemon: { teamId: id } },
    });
    await tx.teamPokemon.deleteMany({ where: { teamId: id } });

    await tx.team.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description ?? null,
        level: input.level,
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
  });
}

export async function deleteTeamRecord(id: string): Promise<boolean> {
  try {
    await prisma.team.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
