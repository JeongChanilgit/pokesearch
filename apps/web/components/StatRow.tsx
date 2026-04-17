import { useTranslations } from 'next-intl';
import type { NatureEffect } from '@pokesearch/calc';

interface Props {
  letter: 'H' | 'A' | 'B' | 'C' | 'D' | 'S';
  finalStat: number;
  ev: number;
  natureEffect: NatureEffect;
  baseFraction: number;
  evFraction: number;
}

export function StatRow({
  letter,
  finalStat,
  ev,
  natureEffect,
  baseFraction,
  evFraction,
}: Props) {
  const t = useTranslations('teamDetail');
  const arrow =
    natureEffect === 'boost' ? '↑' : natureEffect === 'reduce' ? '↓' : '';
  const arrowClass =
    natureEffect === 'boost'
      ? 'text-nature-up'
      : natureEffect === 'reduce'
        ? 'text-nature-down'
        : '';
  return (
    <div
      className="grid items-center gap-1 text-[10px] py-0.5 tabular-nums"
      style={{ gridTemplateColumns: '12px 1fr 10px 30px 44px' }}
    >
      <span className="text-text-secondary font-medium text-center">{letter}</span>
      <div className="h-[4px] bg-bg-secondary rounded-sm overflow-hidden flex">
        <div
          className="h-full bg-bar-base"
          style={{ width: `${baseFraction * 100}%` }}
        />
        <div
          className="h-full bg-bar-ev"
          style={{ width: `${evFraction * 100}%` }}
        />
      </div>
      <span className={`text-center font-medium ${arrowClass}`}>{arrow}</span>
      <span className="text-right text-text-primary font-medium">{finalStat}</span>
      <span className="text-right text-text-tertiary text-[9px]">
        {t('evLabel', { ev })}
      </span>
    </div>
  );
}
