'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { PokemonHolder } from './PokemonHolder';
import { KeyMetricsRow } from './KeyMetricsRow';
import { StatTable } from './StatTable';
import { MovesList } from './MovesList';
import { TypeBadge, type PokemonType } from './TypeBadge';
import { itemSlugFromName, itemMultFor, type TeamPokemonMetrics } from '../lib/team-calc';
import type { TeamPokemonDetail } from '@pokesearch/types';
import type { TypeName } from '@pokesearch/types';
import {
  applyStage,
  damageOutput,
  physicalBulk,
  specialBulk,
  effectivenessAgainst,
  getImmunities,
  getResistances,
  getWeaknesses,
} from '@pokesearch/calc';

interface Props {
  pokemon: TeamPokemonDetail;
  metrics: TeamPokemonMetrics;
}

export function TeamPokemonCard({ pokemon, metrics }: Props) {
  const locale = useLocale();
  const t = useTranslations('search');
  const speciesName =
    locale === 'ko' ? pokemon.pokemon.nameKo : pokemon.pokemon.nameEn;
  const abilityName =
    locale === 'ko' ? pokemon.ability.nameKo : pokemon.ability.nameEn;
  const itemName = pokemon.item
    ? locale === 'ko'
      ? pokemon.item.nameKo
      : pokemon.item.nameEn
    : null;
  const natureName =
    locale === 'ko' ? pokemon.nature.nameKo : pokemon.nature.nameEn;
  const summary = [abilityName, itemName, natureName].filter(Boolean).join(' · ');

  const defenderTypes = pokemon.pokemon.types as TypeName[];
  const weaknesses = getWeaknesses(defenderTypes);
  const resistances = getResistances(defenderTypes);
  const immunities = getImmunities(defenderTypes);

  const [ranks, setRanks] = useState<Record<'A' | 'B' | 'C' | 'D' | 'S', number>>({
    A: 0, B: 0, C: 0, D: 0, S: 0,
  });
  const handleStageChange = (letter: 'A' | 'B' | 'C' | 'D' | 'S', next: number) => {
    setRanks((r) => ({ ...r, [letter]: next }));
  };

  const effective = useMemo(() => {
    const effAtk = applyStage(metrics.atk, ranks.A);
    const effDef = applyStage(metrics.def, ranks.B);
    const effSpa = applyStage(metrics.spa, ranks.C);
    const effSpd = applyStage(metrics.spd, ranks.D);
    const effSpe = applyStage(metrics.speed, ranks.S);
    return {
      physicalBulk: physicalBulk(metrics.hp, effDef),
      specialBulk: specialBulk(metrics.hp, effSpd),
      speed: effSpe,
      atk: effAtk,
      spa: effSpa,
    };
  }, [metrics, ranks]);

  const recomputedMoves = useMemo(() => {
    const pokemonTypes = pokemon.pokemon.types as TypeName[];
    const itemEffect = pokemon.item?.effectMult ?? null;
    return metrics.moves.map((m) => {
      if (m.move.category === 'status' || m.move.power == null) {
        return m;
      }
      const attackStat = m.move.category === 'physical' ? effective.atk : effective.spa;
      const isSTAB = pokemonTypes.includes(m.move.type as TypeName);
      const itemMultiplier = itemMultFor(m.move.category, itemEffect);
      const damage = damageOutput({
        attackStat,
        movePower: m.move.power,
        isSTAB,
        abilityMultiplier: 1.0,
        itemMultiplier,
      });
      return { ...m, damage };
    });
  }, [metrics.moves, pokemon.pokemon.types, pokemon.item, effective.atk, effective.spa]);

  return (
    <div
      data-testid="team-pokemon-card"
      className="border border-border-tertiary rounded-lg p-[9px] mb-1.5"
    >
      <div className="flex gap-2 items-start mb-[5px] flex-wrap">
        <div className="flex gap-2 items-center min-w-0">
          <PokemonHolder
            spriteUrl={pokemon.pokemon.spriteUrl}
            itemName={pokemon.item ? itemSlugFromName(pokemon.item.nameEn) : undefined}
            size={44}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              {pokemon.pokemon.showdownId ? (
                <Link
                  href={`/${locale}/pokemon/${pokemon.pokemon.showdownId}`}
                  className="text-[11px] font-medium truncate hover:underline"
                >
                  {speciesName}
                </Link>
              ) : (
                <span className="text-[11px] font-medium truncate">{speciesName}</span>
              )}
              {defenderTypes.map((type) => (
                <TypeBadge key={type} type={type as PokemonType} />
              ))}
            </div>
            <div className="text-[9px] text-text-secondary truncate">{summary}</div>
          </div>
        </div>

        <div className="ml-auto min-w-[140px] grid grid-cols-[auto_1fr] gap-x-1 items-start text-[9px] text-text-secondary leading-[1.5]">
          <b className="text-text-secondary">{t('weak')}</b>
          <div>
            {weaknesses.map((w) => {
              const mult = effectivenessAgainst(w, defenderTypes);
              return (
                <TypeBadge
                  key={w}
                  type={w as PokemonType}
                  suffix={mult >= 4 ? ' ×4' : ''}
                />
              );
            })}
          </div>
          <b className="text-text-secondary">{t('resist')}</b>
          <div>
            {resistances.map((r) => (
              <TypeBadge key={r} type={r as PokemonType} />
            ))}
          </div>
          {immunities.length > 0 && (
            <>
              <b className="text-text-secondary">{t('immune')}</b>
              <div>
                {immunities.map((im) => (
                  <TypeBadge key={im} type={im as PokemonType} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <KeyMetricsRow
        physicalBulk={effective.physicalBulk}
        specialBulk={effective.specialBulk}
        speed={effective.speed}
      />
      <StatTable
        rows={metrics.statRows}
        stages={ranks}
        onStageChange={handleStageChange}
      />
      <div className="mt-[7px]">
        <MovesList moves={recomputedMoves} />
      </div>
    </div>
  );
}
