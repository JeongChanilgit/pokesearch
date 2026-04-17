import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@pokesearch/db';
import { UuidSchema, type LikeMutationResponse } from '@pokesearch/types';
import { computeClientFp } from '../../../../../lib/client-fp';

export const dynamic = 'force-dynamic';

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!UuidSchema.safeParse(id).success) {
    return jsonError('BAD_REQUEST', 'invalid team id', 400);
  }

  const team = await prisma.team.findUnique({ where: { id }, select: { id: true } });
  if (!team) return jsonError('NOT_FOUND', 'team not found', 404);

  const clientFp = computeClientFp(req);

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.like.create({ data: { teamId: id, clientFp } });
      const updated = await tx.team.update({
        where: { id },
        data: { likesCount: { increment: 1 } },
        select: { likesCount: true },
      });
      return updated;
    });
    const body: LikeMutationResponse = { likesCount: result.likesCount };
    return NextResponse.json(body, { status: 201 });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: string }).code === 'P2002'
    ) {
      return jsonError('CONFLICT', 'already liked', 409);
    }
    throw err;
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!UuidSchema.safeParse(id).success) {
    return jsonError('BAD_REQUEST', 'invalid team id', 400);
  }

  const clientFp = computeClientFp(req);

  const existing = await prisma.like.findUnique({
    where: { teamId_clientFp: { teamId: id, clientFp } },
    select: { id: true },
  });
  if (!existing) {
    const team = await prisma.team.findUnique({
      where: { id },
      select: { likesCount: true },
    });
    if (!team) return jsonError('NOT_FOUND', 'team not found', 404);
    const body: LikeMutationResponse = { likesCount: team.likesCount };
    return NextResponse.json(body);
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.like.delete({ where: { id: existing.id } });
    const updated = await tx.team.update({
      where: { id },
      data: { likesCount: { decrement: 1 } },
      select: { likesCount: true },
    });
    return updated;
  });
  const body: LikeMutationResponse = { likesCount: Math.max(0, result.likesCount) };
  return NextResponse.json(body);
}
