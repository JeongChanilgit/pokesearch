import type { Locale } from '../i18n';

export function displayName(
  item: { nameEn: string; nameKo: string },
  locale: Locale,
): string {
  return locale === 'ko' ? item.nameKo : item.nameEn;
}

export function secondaryName(
  item: { nameEn: string; nameKo: string },
  locale: Locale,
): string {
  return locale === 'ko' ? item.nameEn : item.nameKo;
}
