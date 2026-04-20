'use client';

import { useEffect, useId, useRef, useState, useCallback } from 'react';

interface Props<T> {
  items: T[];
  value: T | null;
  onChange: (item: T) => void;
  /** Return the display label for an item. Called for both rendering and filtering. */
  getLabel: (item: T) => string;
  /**
   * Optional secondary label used for search matching only (e.g. the alternate
   * locale name). When provided, the combobox matches against both getLabel and
   * getSearchLabel so "Life" finds "생명의구슬" and "생명" finds "Life Orb".
   */
  getSearchLabel?: (item: T) => string;
  /**
   * Optional custom renderer for an option row. When omitted, the option
   * shows the plain `getLabel(item)` text. When provided, this replaces the
   * inner content of the <li> so callers can render icons, tabular data, etc.
   * The list item wrapper (role, highlight, click handlers) stays the same.
   */
  renderOption?: (item: T) => React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  /** aria-label for the input (falls back to placeholder) */
  ariaLabel?: string;
  /** data-testid forwarded to the input element */
  testId?: string;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s/g, '');
}

export function Combobox<T>({
  items,
  value,
  onChange,
  getLabel,
  getSearchLabel,
  renderOption,
  placeholder = '',
  disabled = false,
  ariaLabel,
  testId,
}: Props<T>) {
  const uid = useId();
  const listId = `${uid}-list`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered list
  const filtered = query
    ? items.filter((item) => {
        const q = normalize(query);
        if (normalize(getLabel(item)).includes(q)) return true;
        if (getSearchLabel && normalize(getSearchLabel(item)).includes(q))
          return true;
        return false;
      })
    : items;

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setActiveIndex(-1);
  }, [disabled]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery(value ? getLabel(value) : '');
    setActiveIndex(-1);
  }, [value, getLabel]);

  // When value changes externally (or on first render), reset query to current label
  useEffect(() => {
    if (!open) {
      setQuery(value ? getLabel(value) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, open]);

  // Reset activeIndex when filtered list changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, closeDropdown]);

  const selectItem = useCallback(
    (item: T) => {
      onChange(item);
      setOpen(false);
      setQuery(getLabel(item));
      setActiveIndex(-1);
    },
    [onChange, getLabel],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          selectItem(filtered[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'Tab':
        // Close without preventing default so focus advances naturally
        closeDropdown();
        break;
    }
  }

  const activeDescendant =
    open && activeIndex >= 0 ? `${uid}-opt-${activeIndex}` : undefined;

  const displayValue = open ? query : value ? getLabel(value) : '';

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={activeDescendant}
        aria-autocomplete="list"
        aria-label={ariaLabel ?? placeholder}
        autoComplete="off"
        spellCheck={false}
        data-testid={testId}
        disabled={disabled}
        value={displayValue}
        placeholder={placeholder}
        className={[
          'bg-transparent text-[10px] text-left text-text-primary',
          'w-full outline-none cursor-pointer truncate',
          'min-h-[44px] flex items-center px-0',
          disabled ? 'opacity-40 cursor-default' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onFocus={openDropdown}
        onClick={() => {
          if (!open) openDropdown();
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className={[
            'absolute z-50 left-0 right-0 top-full mt-[2px]',
            'bg-bg-primary border border-border-tertiary rounded-sm shadow-md',
            'max-h-[220px] overflow-y-auto',
            'text-[10px] text-text-primary',
          ].join(' ')}
        >
          {filtered.map((item, idx) => {
            const label = getLabel(item);
            const isActive = idx === activeIndex;
            return (
              <li
                key={label}
                id={`${uid}-opt-${idx}`}
                role="option"
                aria-selected={value !== null && getLabel(value) === label}
                className={[
                  'px-2 cursor-pointer leading-none',
                  'min-h-[44px] flex items-center',
                  isActive
                    ? 'bg-text-primary text-bg-primary'
                    : 'hover:bg-bg-secondary',
                ].join(' ')}
                onMouseDown={(e) => {
                  // mousedown fires before blur; prevent blur from closing first
                  e.preventDefault();
                  selectItem(item);
                }}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                {renderOption ? renderOption(item) : label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
