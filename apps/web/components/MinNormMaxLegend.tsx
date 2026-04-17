import { useTranslations } from 'next-intl';

export function MinNormMaxLegend() {
  const t = useTranslations('search');
  return (
    <div className="bg-bg-secondary rounded-sm px-2 py-1.5 text-[9px] text-text-secondary leading-relaxed mb-2">
      <b className="text-min-label">MIN</b> {t('minDef')}
      <span className="mx-1">·</span>
      <b className="text-norm-label">NORM</b> {t('normDef')}
      <span className="mx-1">·</span>
      <b className="text-max-label">MAX</b> {t('maxDef')}
    </div>
  );
}
