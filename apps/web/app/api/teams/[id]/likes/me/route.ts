import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@pokesearch/db';
import { UuidSchema, type LikeStatusResponse } from '@pokesearch/types';
import { computeClientFp } from '../../../../../../lib/client-fp';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!UuidSchema.safeParse(id).success) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'invalid team id' } },
      { status: 400 },
    );
  }

  const clientFp = computeClientFp(req);
  const [team, like] = await Promise.all([
    prisma.team.findUnique({ where: { id }, select: { likesCount: true } }),
    prisma.like.findUnique({
      where: { teamId_clientFp: { teamId: id, clientFp } },
      select: { id: true },
    }),
  ]);
  if (!team) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'team not found' } },
      { status: 404 },
    );
  }
  const body: LikeStatusResponse = {
    liked: like !== null,
    likesCount: team.likesCount,
  };
  return NextResponse.json(body);
}
