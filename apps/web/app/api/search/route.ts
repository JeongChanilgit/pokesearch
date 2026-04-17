import { NextRequest, NextResponse } from 'next/server';
import { QuickSearchRequest } from '@pokesearch/types';
import { buildQuickSearchResult } from '../../../lib/search-core';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQ = searchParams.get('q') ?? '';
  const rawLevel = searchParams.get('level');
  const parsed = QuickSearchRequest.safeParse({
    q: rawQ,
    level: rawLevel ? Number(rawLevel) : undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_PARAMS', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const result = await buildQuickSearchResult(parsed.data.q, parsed.data.level);
  return NextResponse.json(result);
}
