import type { NextRequest } from 'next/server';

export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

function getForbiddenWords(): string[] {
  const raw = process.env.FORBIDDEN_WORDS ?? '';
  return raw
    .split(',')
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0);
}

export function containsForbiddenWord(content: string): boolean {
  const words = getForbiddenWords();
  if (words.length === 0) return false;
  const lower = content.toLowerCase();
  return words.some((w) => lower.includes(w));
}
