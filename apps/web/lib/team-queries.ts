import { prisma } from '@pokesearch/db';
import type { Prisma } from '@pokesearch/db';
import {
  ListTeamsResponse,
  TeamDetail,
  type ListTeamsRequest,
  type TeamListItem,
} from '@pokesearch/types';
import { normalizeType, normalizeTypes, prismaStatToShort } from './team-mapping';

type ListParams = {
  sort: ListTeamsRequest['sort'];
  pokemonId?: number;
  cursor?: string;
  limit: ListTeamsRequest['limit'];
};

export async function queryTeamList(params: ListParams): Promise<ListTeamsResponse> {
  const { sort, pokemonId, cursor, limit } = params;
  const offset = cursor ? Math.max(0, Number.parseInt(cursor, 10) || 0) : 0;

  const where: Prisma.TeamWhereInput = pokemonId
    ? { pokemons: { some: { pokemonId } } }
    : {};

  let orderBy: Prisma.TeamOrderByWithRelationInput[];
  switch (sort) {
    case 'likes':
      orderBy = [{ likesCount: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }];
      break;
    case 'views':
      orderBy = [{ views: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }];
      break;
    case 'newest':
      orderBy = [{ createdAt: 'desc' }, { id: 'asc' }];
      break;
    case 'comments':
      orderBy = [{ comments: { _count: 'desc' } }, { createdAt: 'desc' }, { id: 'asc' }];
      break;
  }

  const rows = await prisma.team.findMany({
    where,
    orderBy,
    skip: offset,
    take: limit + 1,
    select: {
      id: true,
      name: true,
      level: true,
      views: true,
      likesCount: true,
      createdAt: true,
      _count: { select: { comments: true } },
      pokemons: {
        orderBy: { slotOrder: 'asc' },
        select: {
          slotOrder: true,
          pokemonId: true,
          pokemon: { select: { spriteUrl: true } },
        },
      },
    },
  });

  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);

  const items: TeamListItem[] = page.map((t) => ({
    id: t.id,
    name: t.name,
    level: (t.level === 100 ? 100 : 50) as 50 | 100,
    pokemons: t.pokemons.map((p) => ({
      slotOrder: p.slotOrder,
      pokemonId: p.pokemonId,
      spriteUrl: p.pokemon.spriteUrl,
    })),
    views: t.views,
    likesCount: t.likesCount,
    commentsCount: t._count.comments,
    createdAt: t.createdAt.toISOString(),
  }));

  return ListTeamsResponse.parse({
    items,
    nextCursor: hasMore ? String(offset + limit) : null,
  });
}

export async function queryTeamDetail(id: string): Promise<TeamDetail | null> {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      _count: { select: { comments: true } },
      pokemons: {
        orderBy: { slotOrder: 'asc' },
        include: {
          pokemon: true,
          ability: true,
          item: true,
          nature: true,
          moves: {
            orderBy: { slotOrder: 'asc' },
            include: { move: true },
          },
        },
      },
    },
  });
  if (!team) return null;

  return TeamDetail.parse({
    id: team.id,
    name: team.name,
    description: team.description,
    level: (team.level === 100 ? 100 : 50) as 50 | 100,
    views: team.views,
    likesCount: team.likesCount,
    commentsCount: team._count.comments,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    pokemons: team.pokemons.map((p) => ({
      id: p.id,
      slotOrder: p.slotOrder,
      pokemon: {
        id: p.pokemon.id,
        nameEn: p.pokemon.nameEn,
        nameKo: p.pokemon.nameKo,
        types: normalizeTypes(p.pokemon.types),
        spriteUrl: p.pokemon.spriteUrl,
        showdownId: (p.pokemon as typeof p.pokemon & { showdownId?: string | null }).showdownId ?? '',
        baseH: p.pokemon.baseH,
        baseA: p.pokemon.baseA,
        baseB: p.pokemon.baseB,
        baseC: p.pokemon.baseC,
        baseD: p.pokemon.baseD,
        baseS: p.pokemon.baseS,
      },
      ability: {
        id: p.ability.id,
        nameEn: p.ability.nameEn,
        nameKo: p.ability.nameKo,
        descriptionEn: p.ability.descriptionEn,
        descriptionKo: p.ability.descriptionKo,
      },
      item: p.item
        ? {
            id: p.item.id,
            nameEn: p.item.nameEn,
            nameKo: p.item.nameKo,
            descriptionEn: p.item.descriptionEn,
            descriptionKo: p.item.descriptionKo,
            effectMult:
              (p.item.effectMult as Record<string, number> | null) ?? null,
          }
        : null,
      nature: {
        id: p.nature.id,
        nameEn: p.nature.nameEn,
        nameKo: p.nature.nameKo,
        boostStat: prismaStatToShort(p.nature.boostStat),
        reduceStat: prismaStatToShort(p.nature.reduceStat),
      },
      evs: { h: p.evH, a: p.evA, b: p.evB, c: p.evC, d: p.evD, s: p.evS },
      ivs: { h: p.ivH, a: p.ivA, b: p.ivB, c: p.ivC, d: p.ivD, s: p.ivS },
      teraType: p.teraType ? normalizeType(p.teraType) : null,
      moves: p.moves.map((m) => ({
        slotOrder: m.slotOrder,
        move: {
          id: m.move.id,
          nameEn: m.move.nameEn,
          nameKo: m.move.nameKo,
          type: normalizeType(m.move.type),
          category: m.move.category,
          power: m.move.power,
          accuracy: m.move.accuracy,
          pp: m.move.pp,
        },
      })),
    })),
  });
}
