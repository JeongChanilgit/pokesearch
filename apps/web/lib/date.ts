export function formatRelative(date: Date, locale: 'en' | 'ko'): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const absSec = Math.abs(diffMs) / 1000;

  if (absSec < 60) {
    return locale === 'ko' ? '방금 전' : 'just now';
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(diffMs / 3_600_000);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(diffMs / 86_400_000);
  if (Math.abs(days) < 7) return rtf.format(days, 'day');

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
