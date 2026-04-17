import { useLocale } from 'next-intl';
import { PokemonHolder } from './PokemonHolder';
import { KeyMetricsRow } from './KeyMetricsRow';
import { StatTable } from './StatTable';
import { MovesList } from './MovesList';
import { itemSlugFromName, type TeamPokemonMetrics } from '../lib/team-calc';
import type { TeamPokemonDetail } from '@pokesearch/types';

interface Props {
  pokemon: TeamPokemonDetail;
  metrics: TeamPokemonMetrics;
}

export function TeamPokemonCard({ pokemon, metrics }: Props) {
  const locale = useLocale();
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

  return (
    <div
      data-testid="team-pokemon-card"
      className="border border-border-tertiary rounded-lg p-[9px] mb-1.5"
    >
      <div className="flex gap-2 items-center mb-[5px]">
        <PokemonHolder
          pokemonId={pokemon.pokemon.id}
          itemName={pokemon.item ? itemSlugFromName(pokemon.item.nameEn) : undefined}
          size={44}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-medium truncate">{speciesName}</div>
          <div className="text-[9px] text-text-secondary truncate">{summary}</div>
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
