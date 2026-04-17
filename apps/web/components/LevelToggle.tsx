'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface Props {
  level: 50 | 100;
}

export function LevelToggle({ level }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const go = (next: 50 | 100) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('level', String(next));
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="inline-flex gap-0.5 p-0.5 bg-bg-secondary rounded-md text-[10px]">
      <button
        type="button"
        onClick={() => go(50)}
        className={`px-2.5 py-[3px] rounded-sm min-h-[28px] ${
          level === 50
            ? 'bg-bg-primary text-text-primary font-medium'
            : 'text-text-secondary'
        }`}
      >
        50
      </button>
      <button
        type="button"
        onClick={() => go(100)}
        className={`px-2.5 py-[3px] rounded-sm min-h-[28px] ${
          level === 100
            ? 'bg-bg-primary text-text-primary font-medium'
            : 'text-text-secondary'
        }`}
      >
        100
      </button>
    </div>
  );
}
