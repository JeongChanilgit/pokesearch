import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@pokesearch/db';
import { UuidSchema, UpdateTeamRequest } from '@pokesearch/types';
import {
  VIEW_DEDUP_COOKIE_PREFIX,
  VIEW_DEDUP_MAX_AGE_SECONDS,
} from '../../../../lib/team-mapping';
import { queryTeamDetail } from '../../../../lib/team-queries';
import {
  deleteTeamRecord,
  updateTeamRecord,
} from '../../../../lib/team-create';
import { extractBearerToken, verifyVerifyToken } from '../../../../lib/jwt';

export const dynamic = 'force-dynamic';

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

async function requireVerifyToken(
  req: NextRequest,
  teamId: string,
): Promise<NextResponse | null> {
  const token = extractBearerToken(req.headers.get('authorization'));
  if (!token) {
    return NextResponse.json({ error: 'missing_token' }, { status: 401 });
  }
  const payload = await verifyVerifyToken(token, teamId);
  if (!payload) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }
  return null;
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

  const guard = await requireVerifyToken(req, id);
  if (guard) return guard;

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

  try {
    await updateTeamRecord(id, parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'server_error';
    if (message === 'not_found') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
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

  const guard = await requireVerifyToken(req, id);
  if (guard) return guard;

  const deleted = await deleteTeamRecord(id);
  if (!deleted) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
