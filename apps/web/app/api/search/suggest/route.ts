import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@pokesearch/db';
import { SuggestPokemonRequest, SuggestPokemonResponse } from '@pokesearch/types';

type SuggestRow = {
  id: number;
  name_en: string;
  name_ko: string;
  sprite_url: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawLimit = searchParams.get('limit');
  const parsed = SuggestPokemonRequest.safeParse({
    q: searchParams.get('q') ?? '',
    limit: rawLimit ? Number(rawLimit) : undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_PARAMS', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { q, limit } = parsed.data;

  const rows = await prisma.$queryRaw<SuggestRow[]>`
    SELECT id, name_en, name_ko, sprite_url
    FROM pokemons
    WHERE name_en ILIKE ${q} || '%' OR name_ko ILIKE ${q} || '%'
    ORDER BY
      GREATEST(similarity(name_en, ${q}), similarity(name_ko, ${q})) DESC,
      length(coalesce(name_en, name_ko)) ASC
    LIMIT ${limit}
  `;

  const response = SuggestPokemonResponse.parse({
    items: rows.map((r) => ({
      id: r.id,
      nameEn: r.name_en,
      nameKo: r.name_ko,
      spriteUrl: r.sprite_url,
    })),
  });

  return NextResponse.json(response);
}
