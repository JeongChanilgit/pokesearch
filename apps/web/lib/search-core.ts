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

type PokemonRow = {
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
};

export async function findPokemonByNamePrefix(q: string): Promise<PokemonRow | null> {
  const rows = await prisma.$queryRaw<PokemonRow[]>`
    SELECT id, name_en, name_ko, types, base_h, base_a, base_b, base_c, base_d, base_s,
           sprite_url, form_of
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

export async function buildQuickSearchResult(
  q: string,
  level: Level,
): Promise<QuickSearchResponseType> {
  const row = await findPokemonByNamePrefix(q);
  if (!row) {
    return QuickSearchResponse.parse({ pokemon: null, moves: [] });
  }

  const types = row.types as TypeName[];

  const pokemon = {
    id: row.id,
    nameEn: row.name_en,
    nameKo: row.name_ko,
    types,
    spriteUrl: row.sprite_url,
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
      category: { in: ['physical', 'special'] },
      power: { not: null, gt: 0 },
      learnableBy: { some: { pokemonId: row.id } },
    },
    select: {
      id: true,
      nameEn: true,
      nameKo: true,
      type: true,
      category: true,
      power: true,
    },
  });

  const moves: QuickSearchMove[] = moveRows
    .filter((m) => m.power !== null && m.power > 0)
    .map((m) => {
      const category = m.category as 'physical' | 'special';
      const attackBase = category === 'physical' ? row.base_a : row.base_c;
      const moveType = m.type as TypeName;
      const isSTAB = types.includes(moveType);
      return {
        id: m.id,
        nameEn: m.nameEn,
        nameKo: m.nameKo,
        type: moveType,
        category,
        power: m.power as number,
        damage: damageRange(attackBase, level, m.power as number, isSTAB),
      };
    })
    .sort((a, b) => b.damage.max - a.damage.max);

  return QuickSearchResponse.parse({ pokemon, bulk, speed, moves });
}
