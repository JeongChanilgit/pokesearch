import {
  damageOutput,
  hpStat,
  otherStat,
  physicalBulk,
  specialBulk,
  type NatureEffect,
} from '@pokesearch/calc';
import type {
  Level,
  TeamPokemonDetail,
  TypeName,
} from '@pokesearch/types';

type ShortStat = 'h' | 'a' | 'b' | 'c' | 'd' | 's';

export interface StatRowData {
  letter: 'H' | 'A' | 'B' | 'C' | 'D' | 'S';
  finalStat: number;
  ev: number;
  natureEffect: NatureEffect;
  baseFraction: number;
  evFraction: number;
}

export interface MoveDisplayData {
  slotOrder: number;
  move: TeamPokemonDetail['moves'][number]['move'];
  damage: number | null;
}

export interface TeamPokemonMetrics {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  speed: number;
  physicalBulk: number;
  specialBulk: number;
  statRows: StatRowData[];
  moves: MoveDisplayData[];
}

function natureEffectFor(
  stat: ShortStat,
  boost: ShortStat | null,
  reduce: ShortStat | null,
): NatureEffect {
  if (stat === 'h') return 'neutral';
  if (boost === stat) return 'boost';
  if (reduce === stat) return 'reduce';
  return 'neutral';
}

function clamp01(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function itemMultFor(
  category: 'physical' | 'special',
  effect: Record<string, number> | null | undefined,
): number {
  if (!effect) return 1;
  const all = effect.allDamage ?? effect.all ?? 1;
  const byCat = effect[category] ?? 1;
  return all * byCat;
}

export function computeTeamPokemonMetrics(
  p: TeamPokemonDetail,
  level: Level,
): TeamPokemonMetrics {
  const { pokemon, nature, evs, ivs } = p;
  const boost = nature.boostStat as ShortStat | null;
  const reduce = nature.reduceStat as ShortStat | null;

  const hp = hpStat(pokemon.baseH, ivs.h, evs.h, level);
  const atk = otherStat(
    pokemon.baseA,
    ivs.a,
    evs.a,
    level,
    natureEffectFor('a', boost, reduce),
  );
  const def = otherStat(
    pokemon.baseB,
    ivs.b,
    evs.b,
    level,
    natureEffectFor('b', boost, reduce),
  );
  const spa = otherStat(
    pokemon.baseC,
    ivs.c,
    evs.c,
    level,
    natureEffectFor('c', boost, reduce),
  );
  const spd = otherStat(
    pokemon.baseD,
    ivs.d,
    evs.d,
    level,
    natureEffectFor('d', boost, reduce),
  );
  const speed = otherStat(
    pokemon.baseS,
    ivs.s,
    evs.s,
    level,
    natureEffectFor('s', boost, reduce),
  );

  const statRows: StatRowData[] = [
    makeRow('H', 'h', pokemon.baseH, ivs.h, evs.h, level, 'neutral', hp, true),
    makeRow(
      'A',
      'a',
      pokemon.baseA,
      ivs.a,
      evs.a,
      level,
      natureEffectFor('a', boost, reduce),
      atk,
      false,
    ),
    makeRow(
      'B',
      'b',
      pokemon.baseB,
      ivs.b,
      evs.b,
      level,
      natureEffectFor('b', boost, reduce),
      def,
      false,
    ),
    makeRow(
      'C',
      'c',
      pokemon.baseC,
      ivs.c,
      evs.c,
      level,
      natureEffectFor('c', boost, reduce),
      spa,
      false,
    ),
    makeRow(
      'D',
      'd',
      pokemon.baseD,
      ivs.d,
      evs.d,
      level,
      natureEffectFor('d', boost, reduce),
      spd,
      false,
    ),
    makeRow(
      'S',
      's',
      pokemon.baseS,
      ivs.s,
      evs.s,
      level,
      natureEffectFor('s', boost, reduce),
      speed,
      false,
    ),
  ];

  const pokemonTypes = pokemon.types;
  const itemEffect = p.item?.effectMult ?? null;
  const abilityMultiplier = 1.0;

  const moves: MoveDisplayData[] = p.moves.map((tm) => {
    if (tm.move.category === 'status' || tm.move.power == null) {
      return { slotOrder: tm.slotOrder, move: tm.move, damage: null };
    }
    const attackStat = tm.move.category === 'physical' ? atk : spa;
    const isSTAB = pokemonTypes.includes(tm.move.type as TypeName);
    const itemMultiplier = itemMultFor(tm.move.category, itemEffect);
    const damage = damageOutput({
      attackStat,
      movePower: tm.move.power,
      isSTAB,
      abilityMultiplier,
      itemMultiplier,
    });
    return { slotOrder: tm.slotOrder, move: tm.move, damage };
  });

  return {
    hp,
    atk,
    def,
    spa,
    spd,
    speed,
    physicalBulk: physicalBulk(hp, def),
    specialBulk: specialBulk(hp, spd),
    statRows,
    moves,
  };
}

function makeRow(
  letter: 'H' | 'A' | 'B' | 'C' | 'D' | 'S',
  key: ShortStat,
  base: number,
  iv: number,
  ev: number,
  level: Level,
  natureEffect: NatureEffect,
  finalStat: number,
  isHp: boolean,
): StatRowData {
  const baseOnly = isHp
    ? hpStat(base, iv, 0, level)
    : otherStat(base, iv, 0, level, 'neutral');
  const baseFraction = clamp01(baseOnly / 200);
  const evFraction = clamp01((finalStat - baseOnly) / 200);
  return {
    letter,
    finalStat,
    ev,
    natureEffect,
    baseFraction,
    evFraction,
  };
}

export function itemSlugFromName(nameEn: string): string {
  return nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
