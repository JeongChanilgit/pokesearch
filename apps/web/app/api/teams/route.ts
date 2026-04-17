import { NextResponse, type NextRequest } from 'next/server';
import { ListTeamsRequest } from '@pokesearch/types';
import { queryTeamList } from '../../../lib/team-queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = {
    sort: searchParams.get('sort') ?? undefined,
    pokemonId: searchParams.get('pokemonId')
      ? Number(searchParams.get('pokemonId'))
      : undefined,
    cursor: searchParams.get('cursor') ?? undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
  };
  const parsed = ListTeamsRequest.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_query', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = await queryTeamList(parsed.data);
  return NextResponse.json(body);
}
