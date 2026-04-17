import { NextResponse, type NextRequest } from 'next/server';
import { prisma, verifyPassword } from '@pokesearch/db';
import {
  UuidSchema,
  VerifyTeamPasswordRequest,
  VerifyTeamPasswordResponse,
} from '@pokesearch/types';
import { signVerifyToken } from '../../../../../lib/jwt';
import {
  checkRateLimit,
  getClientIp,
  recordFailure,
  resetRateLimit,
} from '../../../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const validId = UuidSchema.safeParse(id);
  if (!validId.success) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = VerifyTeamPasswordRequest.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const ip = getClientIp(req.headers);
  const key = `verify:${id}:${ip}`;
  const state = checkRateLimit(key);
  if (state.locked) {
    return NextResponse.json(
      { error: 'too_many_attempts', retryAfterSeconds: state.retryAfterSeconds },
      {
        status: 429,
        headers: { 'Retry-After': String(state.retryAfterSeconds) },
      },
    );
  }

  const team = await prisma.team.findUnique({
    where: { id },
    select: { passwordHash: true },
  });
  if (!team) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const ok = await verifyPassword(parsed.data.password, team.passwordHash);
  if (!ok) {
    const after = recordFailure(key);
    if (after.locked) {
      return NextResponse.json(
        {
          error: 'too_many_attempts',
          retryAfterSeconds: after.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(after.retryAfterSeconds) },
        },
      );
    }
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
  }

  resetRateLimit(key);
  const { token, expiresAt } = await signVerifyToken(id);
  const body = VerifyTeamPasswordResponse.parse({
    token,
    expiresAt: expiresAt.toISOString(),
  });
  return NextResponse.json(body);
}
