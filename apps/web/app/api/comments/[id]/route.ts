import { NextResponse, type NextRequest } from 'next/server';
import { prisma, verifyPassword } from '@pokesearch/db';
import { UuidSchema } from '@pokesearch/types';

export const dynamic = 'force-dynamic';

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!UuidSchema.safeParse(id).success) {
    return jsonError('BAD_REQUEST', 'invalid comment id', 400);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError('BAD_REQUEST', 'invalid json', 400);
  }
  const password =
    raw && typeof raw === 'object' && 'password' in raw
      ? (raw as { password: unknown }).password
      : undefined;
  if (typeof password !== 'string' || password.length < 1 || password.length > 64) {
    return jsonError('VALIDATION_ERROR', 'password required', 400);
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { id: true, passwordHash: true },
  });
  if (!comment) {
    return jsonError('NOT_FOUND', 'comment not found', 404);
  }

  const ok = await verifyPassword(password, comment.passwordHash);
  if (!ok) {
    return jsonError('UNAUTHORIZED', 'wrong password', 401);
  }

  await prisma.comment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
