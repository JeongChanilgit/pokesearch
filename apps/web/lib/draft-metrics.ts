import {
  abilityMultiplier,
  damageOutput,
  hpStat,
  otherStat,
  physicalBulk,
  reclassifyMoveType,
  specialBulk,
  type NatureEffect,
} from '@pokesearch/calc';
import type {
  Ability,
  Item,
  Level,
  Move,
  Nature,
  TypeName,
} from '@pokesearch/types';
import type { DraftPokemon, StatShort } from './draft-team';
import type { StatRowData } from './team-calc';

function natureEffectFor(
  stat: StatShort,
  boost: StatShort | null,
  reduce: StatShort | null,
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

function itemMultFor(
  category: 'physical' | 'special',
  effect: Record<string, number> | null | undefined,
): number {
  if (!effect) return 1;
  const all = effect.allDamage ?? effect.all ?? 1;
  const byCat = effect[category] ?? 1;
  return all * byCat;
}

export interface DraftMetrics {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  speed: number;
  physicalBulk: number;
  specialBulk: number;
  finalStat: Record<StatShort, number>;
  natureEffect: Record<StatShort, NatureEffect>;
  statRows: StatRowData[];
  damageByMoveId: Record<number, number | null>;
}

export function computeDraftMetrics(
  dp: DraftPokemon,
  level: Level,
  nature: Nature | undefined,
  ability: Ability | undefined,
  item: Item | null | undefined,
  moves: Map<number, Move>,
): DraftMetrics {
  const types = dp.full.types;
  const base = {
    h: dp.full.baseH,
    a: dp.full.baseA,
    b: dp.full.baseB,
    c: dp.full.baseC,
    d: dp.full.baseD,
    s: dp.full.baseS,
  };
  const boost = (nature?.boostStat ?? null) as StatShort | null;
  const reduce = (nature?.reduceStat ?? null) as StatShort | null;

  const hp = hpStat(base.h, dp.ivs.h, dp.evs.h, level);
  const atk = otherStat(
    base.a,
    dp.ivs.a,
    dp.evs.a,
    level,
    natureEffectFor('a', boost, reduce),
  );
  const def = otherStat(
    base.b,
    dp.ivs.b,
    dp.evs.b,
    level,
    natureEffectFor('b', boost, reduce),
  );
  const spa = otherStat(
    base.c,
    dp.ivs.c,
    dp.evs.c,
    level,
    natureEffectFor('c', boost, reduce),
  );
  const spd = otherStat(
    base.d,
    dp.ivs.d,
    dp.evs.d,
    level,
    natureEffectFor('d', boost, reduce),
  );
  const speed = otherStat(
    base.s,
    dp.ivs.s,
    dp.evs.s,
    level,
    natureEffectFor('s', boost, reduce),
  );

  const finalStat: Record<StatShort, number> = {
    h: hp,
    a: atk,
    b: def,
    c: spa,
    d: spd,
    s: speed,
  };
  const natureEffect: Record<StatShort, NatureEffect> = {
    h: 'neutral',
    a: natureEffectFor('a', boost, reduce),
    b: natureEffectFor('b', boost, reduce),
    c: natureEffectFor('c', boost, reduce),
    d: natureEffectFor('d', boost, reduce),
    s: natureEffectFor('s', boost, reduce),
  };

  const statRows: StatRowData[] = (
    [
      ['H', 'h', true],
      ['A', 'a', false],
      ['B', 'b', false],
      ['C', 'c', false],
      ['D', 'd', false],
      ['S', 's', false],
    ] as const
  ).map(([letter, key, isHp]) => {
    const baseVal = base[key];
    const iv = dp.ivs[key];
    const ev = dp.evs[key];
    const baseOnly = isHp
      ? hpStat(baseVal, iv, 0, level)
      : otherStat(baseVal, iv, 0, level, 'neutral');
    const baseFraction = clamp01(baseOnly / 200);
    const evFraction = clamp01((finalStat[key] - baseOnly) / 200);
    return {
      letter,
      finalStat: finalStat[key],
      ev,
      natureEffect: natureEffect[key],
      baseFraction,
      evFraction,
    };
  });

  const abilityNameEn = ability?.nameEn ?? '';
  const itemEffect = item?.effectMult ?? null;

  const damageByMoveId: Record<number, number | null> = {};
  for (const move of moves.values()) {
    if (move.category === 'status' || move.power == null) {
      damageByMoveId[move.id] = null;
      continue;
    }
    const effectiveType = reclassifyMoveType(abilityNameEn, move.type);
    const isSTAB = types.includes(effectiveType as TypeName);
    const attackStat = move.category === 'physical' ? atk : spa;
    const itemMultiplier = itemMultFor(move.category, itemEffect);
    const abMult = abilityMultiplier(abilityNameEn, effectiveType);
    damageByMoveId[move.id] = damageOutput({
      attackStat,
      movePower: move.power,
      isSTAB,
      abilityMultiplier: abMult,
      itemMultiplier,
    });
  }

  return {
    hp,
    atk,
    def,
    spa,
    spd,
    speed,
    physicalBulk: physicalBulk(hp, def),
    specialBulk: specialBulk(hp, spd),
    finalStat,
    natureEffect,
    statRows,
    damageByMoveId,
  };
}

