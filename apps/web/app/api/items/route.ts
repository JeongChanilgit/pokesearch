import { NextResponse } from 'next/server';
import { prisma } from '@pokesearch/db';
import { ListItemsResponse } from '@pokesearch/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await prisma.item.findMany({ orderBy: { id: 'asc' } });
  const body = ListItemsResponse.parse({
    items: rows.map((i) => ({
      id: i.id,
      nameEn: i.nameEn,
      nameKo: i.nameKo,
      descriptionEn: i.descriptionEn,
      descriptionKo: i.descriptionKo,
      effectMult: (i.effectMult as Record<string, number> | null) ?? null,
    })),
  });
  return NextResponse.json(body);
}
