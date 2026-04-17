import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@pokesearch/db';
import { GetPokemonMovesResponse } from '@pokesearch/types';
import { normalizeType } from '../../../../../lib/team-mapping';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await ctx.params;
  const pokemonId = Number.parseInt(idStr, 10);
  if (!Number.isFinite(pokemonId) || pokemonId <= 0) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const rows = await prisma.pokemonLearnableMove.findMany({
    where: { pokemonId },
    include: { move: true },
    orderBy: { moveId: 'asc' },
  });

  const body = GetPokemonMovesResponse.parse({
    moves: rows.map((r) => ({
      id: r.move.id,
      nameEn: r.move.nameEn,
      nameKo: r.move.nameKo,
      type: normalizeType(r.move.type),
      category: r.move.category,
      power: r.move.power,
      accuracy: r.move.accuracy,
      pp: r.move.pp,
    })),
  });

  return NextResponse.json(body);
}
