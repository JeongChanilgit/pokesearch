'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

const LOCALES = ['en', 'ko'] as const;

export function LocaleToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: (typeof LOCALES)[number]) {
    if (next === locale) return;
    const stripped = pathname.replace(/^\/(en|ko)(?=\/|$)/, '') || '/';
    const nextPath = `/${next}${stripped === '/' ? '' : stripped}`;
    startTransition(() => {
      router.replace(nextPath || `/${next}`);
    });
  }

  return (
    <button
      type="button"
      onClick={() => switchTo(locale === 'en' ? 'ko' : 'en')}
      disabled={isPending}
      className="text-[10px] text-text-secondary px-1.5 py-0.5 border border-border-tertiary rounded-[10px] inline-flex items-center min-h-[28px]"
      aria-label="Toggle language"
    >
      <span className={locale === 'en' ? 'text-text-primary font-medium' : ''}>EN</span>
      <span className="mx-1">·</span>
      <span className={locale === 'ko' ? 'text-text-primary font-medium' : ''}>KO</span>
    </button>
  );
}
