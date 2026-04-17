import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@pokesearch/db';
import { GetPokemonResponse } from '@pokesearch/types';
import { normalizeTypes } from '../../../../lib/team-mapping';

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
  const row = await prisma.pokemon.findUnique({ where: { id: pokemonId } });
  if (!row) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const body = GetPokemonResponse.parse({
    id: row.id,
    nameEn: row.nameEn,
    nameKo: row.nameKo,
    types: normalizeTypes(row.types),
    spriteUrl: row.spriteUrl,
    baseH: row.baseH,
    baseA: row.baseA,
    baseB: row.baseB,
    baseC: row.baseC,
    baseD: row.baseD,
    baseS: row.baseS,
    formOf: row.formOf,
  });
  return NextResponse.json(body);
}
