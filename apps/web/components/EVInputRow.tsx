'use client';

import { useEffect, useState } from 'react';
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

export function EVInputRow({
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

  // Local string state so the field can show "" while the user is typing/backspacing.
  // The parent always holds a number; we sync inward when ev changes externally (e.g. reset).
  const [local, setLocal] = useState<string>(String(ev));

  useEffect(() => {
    setLocal(String(ev));
  }, [ev]);

  const clamp = (raw: number): number => {
    const capped = Math.min(raw, 252, maxAllowed);
    return Math.max(0, capped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocal(raw);
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
    // empty string or non-numeric: keep local state updated but defer onChange to blur
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = Number.parseInt(e.target.value, 10);
    if (Number.isNaN(raw)) {
      onChange(0);
      setLocal('0');
      return;
    }
    const clamped = clamp(raw);
    // Round down to nearest multiple of 4
    const rounded = Math.floor(clamped / 4) * 4;
    onChange(rounded);
    setLocal(String(rounded));
  };

  // Bar fractions: base layer = non-EV portion up to 252, EV layer stacked on top
  // We treat 252 as the full bar width. baseFraction = (252 - ev) / 252, evFraction = ev / 252
  const evFraction = Math.min(ev / 252, 1);

  return (
    <div
      className="grid items-center gap-[7px] text-[10px] py-0.5"
      style={{ gridTemplateColumns: '12px 1fr 52px 52px' }}
    >
      <span className="text-text-secondary font-medium text-center">{letter}</span>
      {/* HABCDS-style bar: base layer + EV layer */}
      <div className="h-[4px] bg-bg-secondary rounded-sm overflow-hidden flex">
        <div
          className="h-full bg-bar-base"
          style={{ width: `${(1 - evFraction) * 100}%` }}
        />
        <div
          className="h-full bg-bar-ev"
          style={{ width: `${evFraction * 100}%` }}
        />
      </div>
      <input
        type="number"
        min={0}
        max={Math.min(252, maxAllowed)}
        step={4}
        value={local}
        aria-label={`EV ${letter}`}
        data-testid={`ev-input-${stat}`}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full text-right text-[10px] tabular-nums border border-border-tertiary rounded-sm px-1 py-0 bg-bg-primary text-text-primary h-[22px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span
        className={`text-[9px] tabular-nums text-right ${arrowClass}`}
        data-testid={`ev-value-${stat}`}
      >
        {finalStat.toLocaleString()}
        {arrow}
      </span>
    </div>
  );
}
