'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { listTeams } from '@pokesearch/api-client';
import type { ListTeamsResponse, TeamListItem, TeamListSort } from '@pokesearch/types';
import { TeamCard } from './TeamCard';

interface Props {
  initial: ListTeamsResponse;
  sort: TeamListSort;
  pokemonId?: number;
}

export function TeamListBody({ initial, sort, pokemonId }: Props) {
  const [items, setItems] = useState<TeamListItem[]>(initial.items);
  const [cursor, setCursor] = useState<string | null>(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setItems(initial.items);
    setCursor(initial.nextCursor);
  }, [initial]);

  const loadMore = useCallback(async () => {
    if (loading || !cursor) return;
    setLoading(true);
    try {
      const next = await listTeams({ sort, pokemonId, cursor });
      setItems((prev) => [...prev, ...next.items]);
      setCursor(next.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [loading, cursor, sort, pokemonId]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !cursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, loadMore]);

  return (
    <div className="flex flex-col gap-1.5" data-testid="team-list">
      {items.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
      {cursor && <div ref={sentinelRef} aria-hidden="true" className="h-1" />}
    </div>
  );
}
