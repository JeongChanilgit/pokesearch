import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-[14px] font-medium">{t('title')}</h1>
      <p className="text-[13px] text-text-primary">{t('welcome')}</p>
      <p className="text-[11px] text-text-secondary">{t('tagline')}</p>
      <div className="mt-3 border border-dashed border-border-tertiary rounded-lg px-2.5 py-[22px] text-center text-[11px] text-text-tertiary">
        {t('empty')}
      </div>
    </div>
  );
}
