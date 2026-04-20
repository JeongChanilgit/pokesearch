'use client';

import { useState } from 'react';
import type { StatRange } from '@pokesearch/calc';
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
  searchLabel: string;
  searchClearLabel: string;
  noMatchesLabel: string;
  damageByMoveId?: Map<number, StatRange | null>;
}

export function MoveFilterList({
  moves,
  locale,
  noMovesLabel,
  allLabel,
  attackLabel,
  statusLabel,
  searchLabel,
  searchClearLabel,
  noMatchesLabel,
  damageByMoveId,
}: Props) {
  const [filter, setFilter] = useState<'all' | 'attack' | 'status'>('all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = moves
    .filter((m) => {
      if (filter === 'all') return true;
      if (filter === 'attack') return m.category !== 'status';
      return m.category === 'status';
    })
    .filter((m) => !q || m.nameEn.toLowerCase().includes(q) || m.nameKo.toLowerCase().includes(q));

  return (
    <>
      <div className="relative mb-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchLabel}
          aria-label={searchLabel}
          className="w-full text-[10px] px-2 py-1 pr-7 border border-border-tertiary rounded-sm bg-transparent min-h-[32px] focus:outline-none focus:border-text-primary"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label={searchClearLabel}
            className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-[14px] text-text-tertiary"
          >
            ×
          </button>
        )}
      </div>
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
          {q !== '' ? noMatchesLabel : noMovesLabel}
        </div>
      ) : (
        filtered.map((m) => (
          <QuickSearchMoveCard
            key={m.id}
            move={m}
            locale={locale}
            damageOverride={damageByMoveId?.get(m.id)}
          />
        ))
      )}
    </>
  );
}
