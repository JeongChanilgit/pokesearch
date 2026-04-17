import { NextResponse, type NextRequest } from 'next/server';
import { prisma, verifyPassword } from '@pokesearch/db';
import { UuidSchema, VerifyTeamPasswordRequest } from '@pokesearch/types';
import {
  checkVerifyRateLimit,
  recordVerifyFailure,
  recordVerifySuccess,
} from '../../../../../lib/rate-limit';
import { getClientIp } from '../../../../../lib/request-ip';
import { signVerifyToken } from '../../../../../lib/jwt';

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
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const ip = getClientIp(req);
  const rlKey = `${ip}:${id}`;

  const pre = checkVerifyRateLimit(rlKey);
  if (!pre.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfter: pre.retryAfterSeconds },
      { status: 429, headers: { 'Retry-After': String(pre.retryAfterSeconds) } },
    );
  }

  const team = await prisma.team.findUnique({
    where: { id },
    select: { id: true, passwordHash: true },
  });
  if (!team) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const ok = await verifyPassword(parsed.data.password, team.passwordHash);
  if (!ok) {
    const result = recordVerifyFailure(rlKey);
    if (!result.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', retryAfter: result.retryAfterSeconds },
        {
          status: 429,
          headers: { 'Retry-After': String(result.retryAfterSeconds) },
        },
      );
    }
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
  }

  recordVerifySuccess(rlKey);

  const { token, expiresAt } = await signVerifyToken(id);
  return NextResponse.json({ token, expiresAt: expiresAt.toISOString() });
}
