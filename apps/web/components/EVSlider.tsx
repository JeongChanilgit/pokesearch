'use client';

import type { NatureEffect } from '@pokesearch/calc';
import type { StatShort } from '../lib/draft-team';

interface Props {
  letter: 'H' | 'A' | 'B' | 'C' | 'D' | 'S';
  stat: StatShort;
  ev: number;
  finalStat: number;
  natureEffect: NatureEffect;
  onChange: (value: number) => void;
  maxAllowed: number;
}

export function EVSlider({
  letter,
  stat,
  ev,
  finalStat,
  natureEffect,
  onChange,
  maxAllowed,
}: Props) {
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
      className="grid items-center gap-[7px] text-[10px] py-0.5"
      style={{ gridTemplateColumns: '12px 1fr 74px' }}
    >
      <span className="text-text-secondary font-medium text-center">{letter}</span>
      <input
        type="range"
        min={0}
        max={Math.min(252, maxAllowed)}
        step={4}
        value={ev}
        aria-label={`EV ${letter}`}
        data-testid={`ev-slider-${stat}`}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
        className="w-full h-1 appearance-none bg-bg-secondary rounded-sm accent-text-primary"
      />
      <span
        className={`text-[9px] tabular-nums text-right ${arrowClass}`}
        data-testid={`ev-value-${stat}`}
      >
        {ev} · {finalStat.toLocaleString()}
        {arrow}
      </span>
    </div>
  );
}
