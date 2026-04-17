const WINDOW_MS = 60_000;
const recent = new Map<string, number>();

export function checkCommentRateLimit(ip: string, now: number = Date.now()): boolean {
  const last = recent.get(ip);
  if (last !== undefined && now - last < WINDOW_MS) return false;
  recent.set(ip, now);
  if (recent.size > 10_000) {
    for (const [k, t] of recent) {
      if (now - t >= WINDOW_MS) recent.delete(k);
    }
  }
  return true;
}

export function resetCommentRateLimit(): void {
  recent.clear();
}

// --- Team password-verify rate limiter ---

const VERIFY_MAX_FAILURES = 5;
const VERIFY_LOCKOUT_MS = 15 * 60_000; // 15 minutes

interface VerifyEntry {
  failures: number;
  lockedUntil: number | null;
}

const verifyAttempts = new Map<string, VerifyEntry>();

export type VerifyCheckResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function checkVerifyRateLimit(
  key: string,
  now: number = Date.now(),
): VerifyCheckResult {
  const entry = verifyAttempts.get(key);
  if (!entry) return { allowed: true };
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }
  if (entry.lockedUntil && entry.lockedUntil <= now) {
    verifyAttempts.delete(key);
  }
  return { allowed: true };
}

export function recordVerifyFailure(
  key: string,
  now: number = Date.now(),
): VerifyCheckResult {
  const prev = verifyAttempts.get(key);
  const failures = (prev?.failures ?? 0) + 1;
  if (failures >= VERIFY_MAX_FAILURES) {
    const lockedUntil = now + VERIFY_LOCKOUT_MS;
    verifyAttempts.set(key, { failures, lockedUntil });
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(VERIFY_LOCKOUT_MS / 1000),
    };
  }
  verifyAttempts.set(key, { failures, lockedUntil: null });
  return { allowed: true };
}

export function recordVerifySuccess(key: string): void {
  verifyAttempts.delete(key);
}

export function resetVerifyRateLimit(): void {
  verifyAttempts.clear();
}
