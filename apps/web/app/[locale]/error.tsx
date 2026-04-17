'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: Props) {
  const t = useTranslations('error');
  const locale = useLocale();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-[16px] font-medium mb-2">{t('title')}</div>
      <p className="text-[12px] text-text-tertiary mb-4">{t('body')}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="bg-text-primary text-bg-primary rounded-sm px-3 py-2 text-[12px] min-h-[44px] min-w-[88px]"
        >
          {t('retry')}
        </button>
        <Link
          href={`/${locale}`}
          className="border border-border-tertiary rounded-sm px-3 py-2 text-[12px] min-h-[44px] min-w-[88px] flex items-center justify-center"
        >
          {t('home')}
        </Link>
      </div>
    </div>
  );
}
