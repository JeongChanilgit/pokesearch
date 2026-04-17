import { NextResponse, type NextRequest } from 'next/server';
import { prisma, hashPassword } from '@pokesearch/db';
import { UpdateTeamRequest, UuidSchema } from '@pokesearch/types';
import {
  VIEW_DEDUP_COOKIE_PREFIX,
  VIEW_DEDUP_MAX_AGE_SECONDS,
} from '../../../../lib/team-mapping';
import { queryTeamDetail } from '../../../../lib/team-queries';
import { extractBearer, verifyVerifyToken } from '../../../../lib/jwt';

export const dynamic = 'force-dynamic';

async function authorize(
  req: NextRequest,
  teamId: string,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const token = extractBearer(req.headers.get('authorization'));
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'missing_token' },
        { status: 401 },
      ),
    };
  }
  const result = await verifyVerifyToken(token, teamId);
  if (!result.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: result.reason === 'expired' ? 'token_expired' : 'invalid_token' },
        { status: 401 },
      ),
    };
  }
  return { ok: true };
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const validId = UuidSchema.safeParse(id);
  if (!validId.success) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const cookieName = `${VIEW_DEDUP_COOKIE_PREFIX}${id}`;
  const alreadyViewed = req.cookies.get(cookieName)?.value === '1';

  if (!alreadyViewed) {
    await prisma.team
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => {});
  }

  const body = await queryTeamDetail(id);
  if (!body) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const res = NextResponse.json(body);
  if (!alreadyViewed) {
    res.cookies.set(cookieName, '1', {
      path: '/',
      maxAge: VIEW_DEDUP_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: 'lax',
    });
  }
  return res;
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const validId = UuidSchema.safeParse(id);
  if (!validId.success) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const auth = await authorize(req, id);
  if (!auth.ok) return auth.response;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = UpdateTeamRequest.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.team.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const input = parsed.data;
  const newPasswordHash = input.password
    ? await hashPassword(input.password)
    : null;

  try {
    await prisma.$transaction(async (tx) => {
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
          ...(newPasswordHash ? { passwordHash: newPasswordHash } : {}),
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
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'server_error';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const body = await queryTeamDetail(id);
  if (!body) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json(body);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const validId = UuidSchema.safeParse(id);
  if (!validId.success) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  const auth = await authorize(req, id);
  if (!auth.ok) return auth.response;

  const existing = await prisma.team.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  try {
    await prisma.team.delete({ where: { id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'server_error';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
