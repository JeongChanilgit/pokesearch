'use client';

import { useLocale } from 'next-intl';
import type { Nature } from '@pokesearch/types';
import { Combobox } from './Combobox';

interface Props {
  natures: Nature[];
  value: number;
  onChange: (id: number) => void;
}

const LETTERS = { h: 'H', a: 'A', b: 'B', c: 'C', d: 'D', s: 'S' } as const;

function natureSuffix(n: Nature): string {
  if (!n.boostStat || !n.reduceStat) return '';
  const up = LETTERS[n.boostStat];
  const down = LETTERS[n.reduceStat];
  return ` (${up}↑ ${down}↓)`;
}

export function NatureSelector({ natures, value, onChange }: Props) {
  const locale = useLocale();

  const selectedNature = natures.find((n) => n.id === value) ?? natures[0] ?? null;

  function getLabel(n: Nature): string {
    const name = locale === 'ko' ? n.nameKo : n.nameEn;
    return `${name}${natureSuffix(n)}`;
  }

  function getSearchLabel(n: Nature): string {
    // Alternate locale name (no suffix needed for search)
    return locale === 'ko' ? n.nameEn : n.nameKo;
  }

  function handleChange(n: Nature) {
    onChange(n.id);
  }

  return (
    <Combobox
      items={natures}
      value={selectedNature}
      onChange={handleChange}
      getLabel={getLabel}
      getSearchLabel={getSearchLabel}
      ariaLabel="Nature"
      testId="nature-select"
    />
  );
}
