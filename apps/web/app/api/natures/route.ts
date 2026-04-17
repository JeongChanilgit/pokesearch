import { NextResponse } from 'next/server';
import { prisma } from '@pokesearch/db';
import { ListNaturesResponse } from '@pokesearch/types';
import { prismaStatToShort } from '../../../lib/team-mapping';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await prisma.nature.findMany({ orderBy: { id: 'asc' } });
  const body = ListNaturesResponse.parse({
    items: rows.map((n) => ({
      id: n.id,
      nameEn: n.nameEn,
      nameKo: n.nameKo,
      boostStat: prismaStatToShort(n.boostStat),
      reduceStat: prismaStatToShort(n.reduceStat),
    })),
  });
  return NextResponse.json(body);
}
