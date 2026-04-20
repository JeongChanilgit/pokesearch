import { useTranslations } from 'next-intl';
import { MIN_STAGE, MAX_STAGE, type NatureEffect } from '@pokesearch/calc';

interface Props {
  letter: 'H' | 'A' | 'B' | 'C' | 'D' | 'S';
  finalStat: number;
  ev: number;
  natureEffect: NatureEffect;
  baseFraction: number;
  evFraction: number;
  stage?: number;
  onStageChange?: (next: number) => void;
}

export function StatRow({
  letter,
  finalStat,
  ev,
  natureEffect,
  baseFraction,
  evFraction,
  stage,
  onStageChange,
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

  const decLabel = t('stageDown');
  const incLabel = t('stageUp');
  const s = stage ?? 0;

  return (
    <div
      className="grid items-center gap-1 text-[10px] py-0.5 tabular-nums"
      style={{ gridTemplateColumns: '12px 48px 10px 24px 36px auto' }}
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
      {onStageChange ? (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onStageChange(Math.max(MIN_STAGE, s - 1))}
            disabled={s <= MIN_STAGE}
            aria-label={`${decLabel} ${letter}`}
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -my-2 px-1 text-[10px] text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {decLabel}
          </button>
          <span
            className={`w-6 text-center text-[10px] tabular-nums ${
              s > 0 ? 'text-[#0F6E56]' : s < 0 ? 'text-[#993C1D]' : 'text-text-secondary'
            }`}
          >
            {s === 0 ? '0' : s > 0 ? `+${s}` : String(s)}
          </span>
          <button
            type="button"
            onClick={() => onStageChange(Math.min(MAX_STAGE, s + 1))}
            disabled={s >= MAX_STAGE}
            aria-label={`${incLabel} ${letter}`}
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -my-2 px-1 text-[10px] text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {incLabel}
          </button>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
