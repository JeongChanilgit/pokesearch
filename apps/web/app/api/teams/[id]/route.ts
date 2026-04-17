import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@pokesearch/db';
import { UuidSchema } from '@pokesearch/types';
import {
  VIEW_DEDUP_COOKIE_PREFIX,
  VIEW_DEDUP_MAX_AGE_SECONDS,
} from '../../../../lib/team-mapping';
import { queryTeamDetail } from '../../../../lib/team-queries';

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
