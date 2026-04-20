import { useTranslations } from 'next-intl';

export function MinNormMaxLegend() {
  const t = useTranslations('search');
  return (
    <div className="bg-bg-secondary rounded-sm px-2 py-1.5 text-[9px] text-text-secondary leading-relaxed mb-2">
      <div>
        <b className="text-min-label">MIN</b> {t('minDef')}
        <span className="mx-1">·</span>
        <b className="text-norm-label">BASE</b> {t('baseDef')}
        <span className="mx-1">·</span>
        <b className="text-high-label">HIGH</b> {t('highDef')}
        <span className="mx-1">·</span>
        <b className="text-max-label">MAX</b> {t('maxDef')}
      </div>
      <div className="text-text-tertiary mt-0.5">{t('rangeNote')}</div>
    </div>
  );
}
