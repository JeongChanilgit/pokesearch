import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@pokesearch/db';
import { ListAbilitiesRequest, ListAbilitiesResponse } from '@pokesearch/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = {
    pokemonId: searchParams.get('pokemonId')
      ? Number(searchParams.get('pokemonId'))
      : undefined,
  };
  const parsed = ListAbilitiesRequest.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_query', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // For v1: the master schema does not yet track per-pokemon ability
  // assignments, so pokemonId is accepted but ignored; we return the full
  // ability list. A later slice can narrow this once the pokemon_abilities
  // join table is seeded by the crawler.
  const rows = await prisma.ability.findMany({
    orderBy: { id: 'asc' },
  });

  const body = ListAbilitiesResponse.parse({
    items: rows.map((a) => ({
      id: a.id,
      nameEn: a.nameEn,
      nameKo: a.nameKo,
      descriptionEn: a.descriptionEn,
      descriptionKo: a.descriptionKo,
    })),
  });
  return NextResponse.json(body);
}
