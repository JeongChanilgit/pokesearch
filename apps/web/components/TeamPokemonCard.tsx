import { useLocale, useTranslations } from 'next-intl';
import { PokemonHolder } from './PokemonHolder';
import { KeyMetricsRow } from './KeyMetricsRow';
import { StatTable } from './StatTable';
import { MovesList } from './MovesList';
import { TypeBadge, type PokemonType } from './TypeBadge';
import { itemSlugFromName, type TeamPokemonMetrics } from '../lib/team-calc';
import type { TeamPokemonDetail } from '@pokesearch/types';
import type { TypeName } from '@pokesearch/types';
import {
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
              <span className="text-[11px] font-medium truncate">{speciesName}</span>
              {defenderTypes.map((type) => (
                <TypeBadge key={type} type={type as PokemonType} />
              ))}
            </div>
            <div className="text-[9px] text-text-secondary truncate">{summary}</div>
          </div>
        </div>

        <div className="flex-1 min-w-[140px] text-[9px] text-text-secondary leading-[1.5]">
          <div>
            <b className="text-text-secondary">{t('weak')}</b>&nbsp;
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
          <div>
            <b className="text-text-secondary">{t('resist')}</b>&nbsp;
            {resistances.map((r) => (
              <TypeBadge key={r} type={r as PokemonType} />
            ))}
          </div>
          {immunities.length > 0 && (
            <div>
              <b className="text-text-secondary">{t('immune')}</b>&nbsp;
              {immunities.map((im) => (
                <TypeBadge key={im} type={im as PokemonType} />
              ))}
            </div>
          )}
        </div>
      </div>

      <KeyMetricsRow
        physicalBulk={metrics.physicalBulk}
        specialBulk={metrics.specialBulk}
        speed={metrics.speed}
      />
      <StatTable rows={metrics.statRows} />
      <div className="mt-[7px]">
        <MovesList moves={metrics.moves} />
      </div>
    </div>
  );
}
