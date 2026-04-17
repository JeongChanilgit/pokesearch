import { SignJWT, jwtVerify } from 'jose';

const TOKEN_TTL_SECONDS = 30 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET is not configured (min 32 chars).');
  }
  return new TextEncoder().encode(secret);
}

export interface VerifyTokenPayload {
  teamId: string;
}

export async function signVerifyToken(teamId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + TOKEN_TTL_SECONDS;
  const token = await new SignJWT({ teamId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .setSubject(teamId)
    .sign(getSecret());
  return { token, expiresAt: new Date(exp * 1000) };
}

export async function verifyVerifyToken(
  token: string,
  expectedTeamId: string,
): Promise<VerifyTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ['HS256'],
    });
    const teamId =
      typeof payload.teamId === 'string' ? payload.teamId : payload.sub;
    if (!teamId || teamId !== expectedTeamId) return null;
    return { teamId };
  } catch {
    return null;
  }
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  return match ? match[1].trim() : null;
}

export const VERIFY_TOKEN_TTL_SECONDS = TOKEN_TTL_SECONDS;
