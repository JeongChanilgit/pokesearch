'use client';

import { useLocale } from 'next-intl';
import type { Ability } from '@pokesearch/types';

interface Props {
  abilities: Ability[];
  value: number | null;
  onChange: (id: number) => void;
}

export function AbilityDropdown({ abilities, value, onChange }: Props) {
  const locale = useLocale();
  return (
    <select
      data-testid="ability-select"
      value={value ?? ''}
      onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
      className="bg-transparent text-[10px] text-right text-text-primary appearance-none cursor-pointer"
    >
      {value == null && (
        <option value="" disabled>
          —
        </option>
      )}
      {abilities.map((a) => (
        <option key={a.id} value={a.id}>
          {locale === 'ko' ? a.nameKo : a.nameEn} ▾
        </option>
      ))}
    </select>
  );
}
