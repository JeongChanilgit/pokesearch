import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const COMMENT_WINDOW_SECONDS = 60;
const VERIFY_MAX_FAILURES = 5;
const VERIFY_LOCKOUT_SECONDS = 15 * 60;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasUpstash = Boolean(redisUrl && redisToken);

const redis = hasUpstash
  ? new Redis({ url: redisUrl!, token: redisToken! })
  : null;

const commentLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(1, `${COMMENT_WINDOW_SECONDS} s`),
      prefix: 'rl:comment',
      analytics: false,
    })
  : null;

// --- In-memory fallback (local dev without Upstash) ---

const memCommentHits = new Map<string, number>();
const memVerifyEntries = new Map<
  string,
  { failures: number; lockedUntil: number | null }
>();

function memCheckComment(ip: string, now: number): boolean {
  const last = memCommentHits.get(ip);
  if (last !== undefined && now - last < COMMENT_WINDOW_SECONDS * 1000) {
    return false;
  }
  memCommentHits.set(ip, now);
  if (memCommentHits.size > 10_000) {
    for (const [k, t] of memCommentHits) {
      if (now - t >= COMMENT_WINDOW_SECONDS * 1000) memCommentHits.delete(k);
    }
  }
  return true;
}

export async function checkCommentRateLimit(ip: string): Promise<boolean> {
  if (commentLimiter) {
    try {
      const res = await commentLimiter.limit(ip);
      return res.success;
    } catch {
      // fail open on Redis outages rather than block all comments
      return true;
    }
  }
  return memCheckComment(ip, Date.now());
}

// --- Verify limiter (5 failures / 15 min lockout per key) ---

export type VerifyCheckResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

function verifyKey(key: string): string {
  return `rl:verify:${key}`;
}

export async function checkVerifyRateLimit(
  key: string,
): Promise<VerifyCheckResult> {
  if (redis) {
    try {
      const k = verifyKey(key);
      const [countRaw, ttl] = await Promise.all([
        redis.get<number | string | null>(k),
        redis.ttl(k),
      ]);
      const count = typeof countRaw === 'string' ? Number(countRaw) : (countRaw ?? 0);
      if (count >= VERIFY_MAX_FAILURES && ttl > 0) {
        return { allowed: false, retryAfterSeconds: ttl };
      }
      return { allowed: true };
    } catch {
      return { allowed: true };
    }
  }

  const now = Date.now();
  const entry = memVerifyEntries.get(key);
  if (!entry) return { allowed: true };
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }
  if (entry.lockedUntil && entry.lockedUntil <= now) {
    memVerifyEntries.delete(key);
  }
  return { allowed: true };
}

export async function recordVerifyFailure(
  key: string,
): Promise<VerifyCheckResult> {
  if (redis) {
    try {
      const k = verifyKey(key);
      const count = await redis.incr(k);
      if (count === 1) await redis.expire(k, VERIFY_LOCKOUT_SECONDS);
      if (count >= VERIFY_MAX_FAILURES) {
        const ttl = await redis.ttl(k);
        return {
          allowed: false,
          retryAfterSeconds: ttl > 0 ? ttl : VERIFY_LOCKOUT_SECONDS,
        };
      }
      return { allowed: true };
    } catch {
      return { allowed: true };
    }
  }

  const now = Date.now();
  const prev = memVerifyEntries.get(key);
  const failures = (prev?.failures ?? 0) + 1;
  if (failures >= VERIFY_MAX_FAILURES) {
    const lockedUntil = now + VERIFY_LOCKOUT_SECONDS * 1000;
    memVerifyEntries.set(key, { failures, lockedUntil });
    return { allowed: false, retryAfterSeconds: VERIFY_LOCKOUT_SECONDS };
  }
  memVerifyEntries.set(key, { failures, lockedUntil: null });
  return { allowed: true };
}

export async function recordVerifySuccess(key: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(verifyKey(key));
    } catch {
      /* best-effort */
    }
    return;
  }
  memVerifyEntries.delete(key);
}
