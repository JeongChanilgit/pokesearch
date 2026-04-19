'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Item } from '@pokesearch/types';
import { Combobox } from './Combobox';

interface Props {
  items: Item[];
  value: number | null;
  onChange: (id: number | null) => void;
}

export function ItemDropdown({ items, value, onChange }: Props) {
  const locale = useLocale();
  const t = useTranslations('create');

  const NO_ITEM_SENTINEL = { id: -1, nameEn: t('noItem'), nameKo: t('noItem') } satisfies Pick<
    Item,
    'id' | 'nameEn' | 'nameKo'
  >;

  // Full list: "(no item)" sentinel first, then real items
  type ItemOrSentinel = (typeof NO_ITEM_SENTINEL) | Item;
  const allItems: ItemOrSentinel[] = [NO_ITEM_SENTINEL, ...items];

  const selectedItem: ItemOrSentinel =
    value === null
      ? NO_ITEM_SENTINEL
      : (items.find((i) => i.id === value) ?? NO_ITEM_SENTINEL);

  function getLabel(item: ItemOrSentinel): string {
    return locale === 'ko' ? item.nameKo : item.nameEn;
  }

  function getSearchLabel(item: ItemOrSentinel): string {
    // Always return the alternate locale name so cross-language search works
    return locale === 'ko' ? item.nameEn : item.nameKo;
  }

  function handleChange(item: ItemOrSentinel) {
    onChange(item.id === -1 ? null : item.id);
  }

  return (
    <Combobox
      items={allItems}
      value={selectedItem}
      onChange={handleChange}
      getLabel={getLabel}
      getSearchLabel={getSearchLabel}
      placeholder={t('noItem')}
      ariaLabel={t('item')}
      testId="item-select"
    />
  );
}
