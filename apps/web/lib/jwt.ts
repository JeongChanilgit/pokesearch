import { SignJWT, jwtVerify, errors as joseErrors } from 'jose';

const TOKEN_TTL_SECONDS = 30 * 60; // 30 minutes
const ISSUER = 'pokesearch';
const AUDIENCE = 'pokesearch-team-verify';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET is not configured (needs ≥32 chars).');
  }
  return new TextEncoder().encode(secret);
}

export interface VerifyTokenPayload {
  teamId: string;
  iat: number;
  exp: number;
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
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(getSecret());
  return { token, expiresAt: new Date(exp * 1000) };
}

export type VerifyTokenResult =
  | { ok: true; payload: VerifyTokenPayload }
  | { ok: false; reason: 'expired' | 'invalid' };

export async function verifyVerifyToken(
  token: string,
  expectedTeamId: string,
): Promise<VerifyTokenResult> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    const teamId = payload.teamId;
    if (typeof teamId !== 'string' || teamId !== expectedTeamId) {
      return { ok: false, reason: 'invalid' };
    }
    if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') {
      return { ok: false, reason: 'invalid' };
    }
    return {
      ok: true,
      payload: { teamId, iat: payload.iat, exp: payload.exp },
    };
  } catch (err) {
    if (err instanceof joseErrors.JWTExpired) {
      return { ok: false, reason: 'expired' };
    }
    return { ok: false, reason: 'invalid' };
  }
}

export function extractBearer(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1]!.trim() : null;
}
