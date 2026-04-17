const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface Entry {
  failures: number;
  lockedUntil: number;
}

const store = new Map<string, Entry>();

export interface RateLimitState {
  locked: boolean;
  retryAfterSeconds: number;
  failures: number;
}

export function checkRateLimit(key: string, now: number = Date.now()): RateLimitState {
  const entry = store.get(key);
  if (!entry) return { locked: false, retryAfterSeconds: 0, failures: 0 };
  if (entry.lockedUntil > now) {
    return {
      locked: true,
      retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000),
      failures: entry.failures,
    };
  }
  if (entry.lockedUntil !== 0 && entry.lockedUntil <= now) {
    store.delete(key);
    return { locked: false, retryAfterSeconds: 0, failures: 0 };
  }
  return { locked: false, retryAfterSeconds: 0, failures: entry.failures };
}

export function recordFailure(key: string, now: number = Date.now()): RateLimitState {
  const existing = store.get(key) ?? { failures: 0, lockedUntil: 0 };
  existing.failures += 1;
  if (existing.failures >= MAX_FAILURES) {
    existing.lockedUntil = now + LOCKOUT_MS;
  }
  store.set(key, existing);
  return {
    locked: existing.lockedUntil > now,
    retryAfterSeconds:
      existing.lockedUntil > now
        ? Math.ceil((existing.lockedUntil - now) / 1000)
        : 0,
    failures: existing.failures,
  };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}

export function clearAllRateLimits(): void {
  store.clear();
}

export const RATE_LIMIT_MAX_FAILURES = MAX_FAILURES;
export const RATE_LIMIT_LOCKOUT_MS = LOCKOUT_MS;

export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
