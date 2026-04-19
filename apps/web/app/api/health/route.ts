import { NextResponse } from 'next/server';
import { prisma } from '@pokesearch/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: 'ok', db: 'ok', latencyMs: Date.now() - startedAt },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch {
    return NextResponse.json(
      { status: 'degraded', db: 'error' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}
