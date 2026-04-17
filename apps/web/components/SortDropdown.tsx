'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import type { TeamListSort } from '@pokesearch/types';

const OPTIONS: TeamListSort[] = ['likes', 'views', 'newest', 'comments'];

export function SortDropdown() {
  const t = useTranslations('home');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const current = (params.get('sort') as TeamListSort) || 'likes';

  function change(next: TeamListSort) {
    const sp = new URLSearchParams(params.toString());
    if (next === 'likes') sp.delete('sort');
    else sp.set('sort', next);
    const qs = sp.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => router.replace(target, { scroll: false }));
  }

  return (
    <label
      className="flex-1 border border-border-tertiary rounded-md px-2 py-1.5 text-[10px] text-text-secondary min-h-[32px] flex items-center"
      data-testid="sort-dropdown"
    >
      <span className="sr-only">{t('sortLabel')}</span>
      <select
        value={current}
        onChange={(e) => change(e.target.value as TeamListSort)}
        className="bg-transparent w-full outline-none text-text-primary"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>
            {t(`sort.${o}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
