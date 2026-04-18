'use client';

import { useState } from 'react';
import type { QuickSearchMove } from '@pokesearch/types';
import type { Locale } from '../i18n';
import { QuickSearchMoveCard } from './QuickSearchMoveCard';

interface Props {
  moves: QuickSearchMove[];
  locale: Locale;
  noMovesLabel: string;
  allLabel: string;
  attackLabel: string;
  statusLabel: string;
}

export function MoveFilterList({
  moves,
  locale,
  noMovesLabel,
  allLabel,
  attackLabel,
  statusLabel,
}: Props) {
  const [filter, setFilter] = useState<'all' | 'attack' | 'status'>('all');

  const filtered = moves.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'attack') return m.category !== 'status';
    return m.category === 'status';
  });

  return (
    <>
      <div className="flex gap-[3px] mb-1">
        {(['all', 'attack', 'status'] as const).map((f) => {
          const label = f === 'all' ? allLabel : f === 'attack' ? attackLabel : statusLabel;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`text-[9px] px-2 py-[2px] rounded-sm border min-h-[24px] ${
                filter === f
                  ? 'border-text-primary bg-text-primary text-bg-primary'
                  : 'border-border-tertiary text-text-secondary'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <div className="text-[10px] text-text-tertiary italic px-2 py-1">
          {noMovesLabel}
        </div>
      ) : (
        filtered.map((m) => (
          <QuickSearchMoveCard key={m.id} move={m} locale={locale} />
        ))
      )}
    </>
  );
}
