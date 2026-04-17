'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { addLike, removeLike, ApiError } from '@pokesearch/api-client';

interface Props {
  teamId: string;
  initialCount: number;
  initialLiked: boolean;
  locale: 'en' | 'ko';
}

export function LikeButton({ teamId, initialCount, initialLiked, locale }: Props) {
  const t = useTranslations('likes');
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const nextLiked = !liked;
    const prevCount = count;
    setLiked(nextLiked);
    setCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));

    try {
      const body = nextLiked
        ? await addLike(teamId, { locale })
        : await removeLike(teamId, { locale });
      setCount(body.likesCount);
    } catch (err) {
      setLiked(!nextLiked);
      setCount(prevCount);
      if (err instanceof ApiError && err.status === 409) {
        setLiked(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      data-testid="like-button"
      aria-label={t('aria')}
      aria-pressed={liked}
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[14px] text-[10px] border min-h-[28px] ${
        liked
          ? 'bg-like-liked-bg text-like-liked-fg border-like-liked-border'
          : 'bg-transparent text-text-secondary border-border-tertiary'
      } disabled:opacity-60`}
    >
      <span>♡</span>
      <span data-testid="like-count">{count}</span>
    </button>
  );
}
