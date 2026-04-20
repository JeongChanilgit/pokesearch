import { prisma } from '@pokesearch/db';
import {
  bulkRange,
  damageRange,
  getImmunities,
  getResistances,
  getWeaknesses,
  statRange,
} from '@pokesearch/calc';
import {
  QuickSearchResponse,
  type Level,
  type QuickSearchMove,
  type QuickSearchResponse as QuickSearchResponseType,
  type TypeName,
} from '@pokesearch/types';

export type PokemonRow = {
  id: number;
  name_en: string;
  name_ko: string;
  types: string[];
  base_h: number;
  base_a: number;
  base_b: number;
  base_c: number;
  base_d: number;
  base_s: number;
  sprite_url: string;
  form_of: number | null;
  showdown_id: string | null;
};

export async function findPokemonByNamePrefix(q: string): Promise<PokemonRow | null> {
  const rows = await prisma.$queryRaw<PokemonRow[]>`
    SELECT id, name_en, name_ko, types, base_h, base_a, base_b, base_c, base_d, base_s,
           sprite_url, form_of, showdown_id
    FROM pokemons
    WHERE name_en ILIKE ${q} || '%'
       OR name_ko ILIKE ${q} || '%'
    ORDER BY
      CASE
        WHEN name_en ILIKE ${q} || '%' THEN 1
        WHEN name_ko ILIKE ${q} || '%' THEN 1
        ELSE 2
      END,
      length(coalesce(name_en, name_ko)) ASC
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function findPokemonByShowdownId(slug: string): Promise<PokemonRow | null> {
  const rows = await prisma.$queryRaw<PokemonRow[]>`
    SELECT id, name_en, name_ko, types, base_h, base_a, base_b, base_c, base_d, base_s,
           sprite_url, form_of, showdown_id
    FROM pokemons
    WHERE showdown_id = ${slug}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

async function buildQuickSearchResponseFromRow(
  row: PokemonRow,
  level: Level,
): Promise<QuickSearchResponseType> {
  const types = row.types as TypeName[];

  const pokemon = {
    id: row.id,
    nameEn: row.name_en,
    nameKo: row.name_ko,
    types,
    spriteUrl: row.sprite_url,
    showdownId: row.showdown_id,
    baseH: row.base_h,
    baseA: row.base_a,
    baseB: row.base_b,
    baseC: row.base_c,
    baseD: row.base_d,
    baseS: row.base_s,
    formOf: row.form_of,
    weaknesses: getWeaknesses(types),
    resistances: getResistances(types),
    immunities: getImmunities(types),
  };

  const bulk = {
    physical: bulkRange(row.base_h, row.base_b, level, 'physical'),
    special: bulkRange(row.base_h, row.base_d, level, 'special'),
  };

  const speed = statRange(row.base_s, level, false);

  const moveRows = await prisma.move.findMany({
    where: {
      learnableBy: { some: { pokemonId: row.id } },
    },
    select: {
      id: true,
      nameEn: true,
      nameKo: true,
      type: true,
      category: true,
      power: true,
      accuracy: true,
      shortDescEn: true,
      shortDescKo: true,
    },
  });

  const rawMoves: (QuickSearchMove | null)[] = moveRows.map((m) => {
    const moveType = m.type as TypeName;
    const isSTAB = types.includes(moveType);
    if (m.category === 'status') {
      const entry: QuickSearchMove = {
        id: m.id,
        nameEn: m.nameEn,
        nameKo: m.nameKo,
        type: moveType,
        category: 'status',
        power: null,
        accuracy: m.accuracy ?? null,
        shortDescEn: m.shortDescEn ?? null,
        shortDescKo: m.shortDescKo ?? null,
        damage: null,
      };
      return entry;
    }
    if (m.power == null || m.power <= 0) return null;
    const category = m.category as 'physical' | 'special';
    const attackBase = category === 'physical' ? row.base_a : row.base_c;
    const entry: QuickSearchMove = {
      id: m.id,
      nameEn: m.nameEn,
      nameKo: m.nameKo,
      type: moveType,
      category,
      power: m.power,
      accuracy: m.accuracy ?? null,
      shortDescEn: m.shortDescEn ?? null,
      shortDescKo: m.shortDescKo ?? null,
      damage: damageRange(attackBase, level, m.power, isSTAB),
    };
    return entry;
  });

  const moves: QuickSearchMove[] = (rawMoves.filter(Boolean) as QuickSearchMove[]).sort(
    (a, b) => (b.damage?.max ?? -1) - (a.damage?.max ?? -1),
  );

  return QuickSearchResponse.parse({ pokemon, bulk, speed, moves });
}

export async function buildQuickSearchResult(
  q: string,
  level: Level,
): Promise<QuickSearchResponseType> {
  const row = await findPokemonByNamePrefix(q);
  if (!row) {
    return QuickSearchResponse.parse({ pokemon: null, moves: [] });
  }
  return buildQuickSearchResponseFromRow(row, level);
}

export async function buildQuickSearchResultBySlug(
  slug: string,
  level: Level,
): Promise<QuickSearchResponseType> {
  const row = await findPokemonByShowdownId(slug);
  if (!row) {
    return QuickSearchResponse.parse({ pokemon: null, moves: [] });
  }
  return buildQuickSearchResponseFromRow(row, level);
}
