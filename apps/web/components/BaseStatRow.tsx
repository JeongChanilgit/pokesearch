import { MIN_STAGE, MAX_STAGE } from '@pokesearch/calc';

interface Props {
  letter: 'H' | 'A' | 'B' | 'C' | 'D' | 'S';
  base: number;
  className?: string;
  stage?: number;
  onStageChange?: (next: number) => void;
  incLabel?: string;
  decLabel?: string;
}

const MAX_BASE_STAT = 255;
const GRID_COLS = '12px 1fr 24px auto';

export function BaseStatRow({ letter, base, className, stage, onStageChange, incLabel, decLabel }: Props) {
  const fraction = Math.min(base / MAX_BASE_STAT, 1);
  const s = stage ?? 0;

  const stageColor = s > 0 ? 'text-[#0F6E56]' : s < 0 ? 'text-[#993C1D]' : 'text-text-secondary';

  return (
    <div
      className={`grid items-center gap-1 text-[10px] py-0.5 tabular-nums${className ? ` ${className}` : ''}`}
      style={{ gridTemplateColumns: GRID_COLS }}
    >
      <span className="text-text-secondary font-medium text-center">{letter}</span>
      <div className="h-[4px] bg-bg-secondary rounded-sm overflow-hidden flex">
        <div
          className="h-full bg-bar-base"
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <span className="text-right text-text-primary font-medium">{base}</span>
      {onStageChange ? (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onStageChange(Math.max(MIN_STAGE, s - 1))}
            disabled={s <= MIN_STAGE}
            aria-label={`${decLabel ?? 'Rank down'} ${letter}`}
            className="inline-flex items-center justify-center min-w-[32px] min-h-[44px] -my-2 text-[14px] text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span
            className={`w-6 text-center text-[10px] tabular-nums ${stageColor}`}
          >
            {s === 0 ? '0' : s > 0 ? `+${s}` : String(s)}
          </span>
          <button
            type="button"
            onClick={() => onStageChange(Math.min(MAX_STAGE, s + 1))}
            disabled={s >= MAX_STAGE}
            aria-label={`${incLabel ?? 'Rank up'} ${letter}`}
            className="inline-flex items-center justify-center min-w-[32px] min-h-[44px] -my-2 text-[14px] text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-1" aria-hidden="true">
          <span className="min-w-[32px]" />
          <span className="w-6" />
          <span className="min-w-[32px]" />
        </div>
      )}
    </div>
  );
}

export function BaseStatRankHeader({ decLabel, incLabel }: { decLabel: string; incLabel: string }) {
  return (
    <div
      className="grid items-center gap-1 text-[9px] text-text-tertiary"
      style={{ gridTemplateColumns: GRID_COLS }}
    >
      <span />
      <span />
      <span />
      <div className="flex items-center justify-end gap-1">
        <span className="min-w-[32px] text-center">{decLabel}</span>
        <span className="w-6" />
        <span className="min-w-[32px] text-center">{incLabel}</span>
      </div>
    </div>
  );
}
