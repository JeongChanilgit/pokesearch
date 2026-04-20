import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@pokesearch/db';
import type { Prisma } from '@pokesearch/db';
import {
  ListPokemonsRequest,
  ListPokemonsResponse,
} from '@pokesearch/types';
import { normalizeTypes } from '../../../lib/team-mapping';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = {
    q: searchParams.get('q') ?? undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    cursor: searchParams.get('cursor') ? Number(searchParams.get('cursor')) : undefined,
  };
  const parsed = ListPokemonsRequest.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_query', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { q, limit, cursor } = parsed.data;
  const where: Prisma.PokemonWhereInput = {};
  if (q && q.length > 0) {
    where.OR = [
      { nameEn: { contains: q, mode: 'insensitive' } },
      { nameKo: { contains: q } },
    ];
  }
  if (cursor !== undefined) {
    where.id = { gt: cursor };
  }

  const rows = await prisma.pokemon.findMany({
    where,
    orderBy: { id: 'asc' },
    take: limit + 1,
    select: {
      id: true,
      nameEn: true,
      nameKo: true,
      types: true,
      spriteUrl: true,
      showdownId: true,
    },
  });

  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);

  const body = ListPokemonsResponse.parse({
    items: page.map((p) => ({
      id: p.id,
      nameEn: p.nameEn,
      nameKo: p.nameKo,
      types: normalizeTypes(p.types),
      spriteUrl: p.spriteUrl,
      showdownId: p.showdownId,
    })),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  });

  return NextResponse.json(body);
}
