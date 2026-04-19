const DEFAULT_DEV_URL = 'http://localhost:3000';

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_DEV_URL;
  return raw.replace(/\/+$/, '');
}

export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl();
  if (!pathname.startsWith('/')) return `${base}/${pathname}`;
  return `${base}${pathname}`;
}

type LocaleAlternates = {
  canonical: string;
  languages: Record<string, string>;
};

/**
 * Build canonical + hreflang alternates for a locale-scoped path.
 * `path` is the part AFTER the locale segment (e.g. "", "/search", "/teams/abc").
 */
export function localeAlternates(
  locale: string,
  path: string,
): LocaleAlternates {
  const suffix = path === '' || path.startsWith('/') ? path : `/${path}`;
  return {
    canonical: `/${locale}${suffix}`,
    languages: {
      en: `/en${suffix}`,
      ko: `/ko${suffix}`,
      'x-default': `/en${suffix}`,
    },
  };
}
