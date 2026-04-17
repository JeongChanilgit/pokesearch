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
