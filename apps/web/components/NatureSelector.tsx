'use client';

import { useLocale } from 'next-intl';
import type { Nature } from '@pokesearch/types';

interface Props {
  natures: Nature[];
  value: number;
  onChange: (id: number) => void;
}

const LETTERS = { h: 'H', a: 'A', b: 'B', c: 'C', d: 'D', s: 'S' } as const;

export function NatureSelector({ natures, value, onChange }: Props) {
  const locale = useLocale();
  return (
    <select
      data-testid="nature-select"
      value={value}
      onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
      className="bg-transparent text-[10px] text-right text-text-primary appearance-none cursor-pointer"
    >
      {natures.map((n) => {
        const name = locale === 'ko' ? n.nameKo : n.nameEn;
        const suffix = natureSuffix(n);
        return (
          <option key={n.id} value={n.id}>
            {name}
            {suffix} ▾
          </option>
        );
      })}
    </select>
  );
}

function natureSuffix(n: Nature): string {
  if (!n.boostStat || !n.reduceStat) return '';
  const up = LETTERS[n.boostStat];
  const down = LETTERS[n.reduceStat];
  return ` (${up}↑ ${down}↓)`;
}
