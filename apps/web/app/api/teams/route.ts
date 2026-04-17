import { NextResponse, type NextRequest } from 'next/server';
import { CreateTeamRequest, ListTeamsRequest } from '@pokesearch/types';
import { queryTeamList } from '../../../lib/team-queries';
import { createTeamRecord } from '../../../lib/team-create';

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

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = CreateTeamRequest.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const { id } = await createTeamRecord(parsed.data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'server_error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
