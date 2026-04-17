import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations('notFound');
  const locale = useLocale();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-[16px] font-medium mb-2">{t('title')}</div>
      <p className="text-[12px] text-text-tertiary mb-4">{t('body')}</p>
      <Link
        href={`/${locale}`}
        className="bg-text-primary text-bg-primary rounded-sm px-3 py-2 text-[12px] min-h-[44px] min-w-[88px] flex items-center justify-center"
      >
        {t('home')}
      </Link>
    </div>
  );
}
