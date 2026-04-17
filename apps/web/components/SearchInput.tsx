'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { createApiClient } from '@pokesearch/api-client';
import type { PokemonSuggestion } from '@pokesearch/types';
import { displayName, secondaryName } from '../lib/name';
import type { Locale } from '../i18n';

const RECENT_KEY = 'recent_searches_v1';
const MAX_RECENT = 5;

function readRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeRecent(items: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {
    /* ignore quota errors */
  }
}

export function pushRecent(q: string) {
  const trimmed = q.trim();
  if (!trimmed) return;
  const existing = readRecent().filter((x) => x !== trimmed);
  writeRecent([trimmed, ...existing]);
}

interface Props {
  initialQuery: string;
  level: 50 | 100;
}

export function SearchInput({ initialQuery, level }: Props) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations('search');
  const [value, setValue] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PokemonSuggestion[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const api = useRef(createApiClient({ locale }));

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const q = value.trim();
    if (!q) {
      setItems([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.current.suggestPokemon({ q });
        setItems(res.items);
      } catch {
        setItems([]);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const navigate = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    pushRecent(trimmed);
    setRecent(readRecent());
    setOpen(false);
    const params = new URLSearchParams();
    params.set('q', trimmed);
    params.set('level', String(level));
    router.push(`/${locale}/search?${params.toString()}`);
  };

  const onPick = (item: PokemonSuggestion) => {
    navigate(displayName(item, locale));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(value);
  };

  const clearRecent = () => {
    writeRecent([]);
    setRecent([]);
  };

  const showRecent = open && !value.trim() && recent.length > 0;
  const showSuggest = open && value.trim().length > 0 && items.length > 0;

  return (
    <div ref={containerRef} className="relative mb-2">
      <form onSubmit={onSubmit}>
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={t('placeholder')}
          className="pr-inp"
          aria-label={t('title')}
          autoComplete="off"
        />
      </form>

      {showRecent && (
        <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-bg-primary border border-border-tertiary rounded-sm shadow-sm">
          <div className="flex items-center justify-between px-2 py-1 text-[9px] text-text-tertiary border-b border-border-tertiary">
            <span>{t('recent')}</span>
            <button
              type="button"
              onClick={clearRecent}
              className="text-text-secondary"
            >
              {t('clearRecent')}
            </button>
          </div>
          {recent.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => navigate(q)}
              className="w-full text-left px-2 py-[6px] text-[11px] border-b border-border-tertiary last:border-b-0 hover:bg-bg-secondary min-h-[32px]"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {showSuggest && (
        <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-bg-primary border border-border-tertiary rounded-sm shadow-sm max-h-[260px] overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPick(item)}
              className="w-full text-left flex items-center gap-2 px-2 py-[5px] text-[10px] border-b border-border-tertiary last:border-b-0 hover:bg-bg-secondary"
            >
              <img
                src={item.spriteUrl}
                alt=""
                width={22}
                height={22}
                loading="lazy"
                decoding="async"
                className="object-contain shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-text-primary truncate">
                  {displayName(item, locale)}
                </div>
                <div className="text-text-tertiary text-[9px] truncate">
                  {secondaryName(item, locale)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
