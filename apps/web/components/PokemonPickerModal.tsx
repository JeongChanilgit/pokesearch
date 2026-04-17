'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { listPokemons, getPokemon } from '@pokesearch/api-client';
import type { PokemonFull, PokemonSummary } from '@pokesearch/types';
import { PokemonPickerItem } from './PokemonPickerItem';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (full: PokemonFull) => void;
}

export function PokemonPickerModal({ open, onClose, onAdd }: Props) {
  const t = useTranslations('create');
  const tCommon = useTranslations('common');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelectedId(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    const handle = setTimeout(() => {
      listPokemons(
        { q: query || undefined, limit: 30 },
        {
          fetchFn: (input, init) =>
            fetch(input as RequestInfo, { ...init, signal: ctrl.signal }),
        },
      )
        .then((res) => {
          if (ctrl.signal.aborted) return;
          setItems(res.items);
          setLoading(false);
        })
        .catch((err) => {
          if (ctrl.signal.aborted) return;
          if (err?.name === 'AbortError') return;
          setLoading(false);
        });
    }, 150);
    return () => {
      clearTimeout(handle);
      ctrl.abort();
    };
  }, [open, query]);

  if (!open) return null;

  async function confirmAdd() {
    if (selectedId == null) return;
    setAdding(true);
    try {
      const full = await getPokemon({ pokemonId: selectedId });
      onAdd(full);
      onClose();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      data-testid="picker-modal"
      onClick={onClose}
    >
      <div
        className="bg-bg-primary rounded-md w-full max-w-[280px] p-3 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[11px] font-medium mb-1.5">{t('pickerTitle')}</div>
        <input
          data-testid="picker-search"
          className="pr-inp mb-1.5"
          value={query}
          placeholder={t('pickerSearch')}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div
          className="max-h-[300px] overflow-y-auto border border-border-tertiary rounded-sm mb-1.5"
          data-testid="picker-list"
        >
          {loading && items.length === 0 ? (
            <div className="text-[10px] text-text-tertiary p-2">
              {t('pickerLoading')}
            </div>
          ) : items.length === 0 ? (
            <div className="text-[10px] text-text-tertiary p-2">
              {t('pickerEmpty')}
            </div>
          ) : (
            items.map((p) => (
              <PokemonPickerItem
                key={p.id}
                pokemon={p}
                selected={selectedId === p.id}
                onSelect={() => setSelectedId(p.id)}
              />
            ))
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            className="border border-border-tertiary rounded-sm py-1.5 text-[11px] min-h-[32px]"
            onClick={onClose}
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            disabled={selectedId == null || adding}
            data-testid="picker-add"
            className="bg-text-primary text-bg-primary rounded-sm py-1.5 text-[11px] min-h-[32px] disabled:opacity-40"
            onClick={confirmAdd}
          >
            {t('pickerAdd')}
          </button>
        </div>
      </div>
    </div>
  );
}

