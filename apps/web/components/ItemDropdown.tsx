'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Item } from '@pokesearch/types';

interface Props {
  items: Item[];
  value: number | null;
  onChange: (id: number | null) => void;
}

export function ItemDropdown({ items, value, onChange }: Props) {
  const locale = useLocale();
  const t = useTranslations('create');
  return (
    <select
      data-testid="item-select"
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === '' ? null : Number.parseInt(v, 10));
      }}
      className="bg-transparent text-[10px] text-right text-text-primary appearance-none cursor-pointer"
    >
      <option value="">{t('noItem')} ▾</option>
      {items.map((i) => (
        <option key={i.id} value={i.id}>
          {locale === 'ko' ? i.nameKo : i.nameEn} ▾
        </option>
      ))}
    </select>
  );
}
