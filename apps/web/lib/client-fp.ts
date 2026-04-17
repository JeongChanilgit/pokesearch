import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { getClientIp } from './request-ip';

export function computeClientFp(req: NextRequest): string {
  const ip = getClientIp(req);
  const ua = req.headers.get('user-agent') ?? '';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex');
}
