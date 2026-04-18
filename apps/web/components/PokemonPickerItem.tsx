'use client';

import { useLocale } from 'next-intl';
import type { PokemonSummary } from '@pokesearch/types';
import type { Locale } from '../i18n';
import { displayName } from '../lib/name';

interface Props {
  pokemon: PokemonSummary;
  selected: boolean;
  onSelect: () => void;
}

export function PokemonPickerItem({ pokemon, selected, onSelect }: Props) {
  const locale = useLocale() as Locale;
  return (
    <button
      type="button"
      data-testid="picker-item"
      onClick={onSelect}
      className={`flex items-center gap-2 w-full text-left px-1.5 py-[5px] rounded-sm min-h-[32px] ${
        selected ? 'bg-[#E6F1FB]' : 'bg-bg-primary hover:bg-bg-secondary'
      }`}
    >
      <img
        src={pokemon.spriteUrl}
        alt=""
        width={22}
        height={22}
        loading="lazy"
        decoding="async"
        className="shrink-0 object-contain"
      />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] truncate">{displayName(pokemon, locale)}</div>
      </div>
    </button>
  );
}
