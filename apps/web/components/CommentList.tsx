'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listComments,
  createComment,
  deleteComment,
  ApiError,
} from '@pokesearch/api-client';
import type { Comment, ListCommentsResponse } from '@pokesearch/types';
import { CommentItem } from './CommentItem';
import { CommentForm, type CommentFormSubmit } from './CommentForm';

interface Props {
  teamId: string;
  locale: 'en' | 'ko';
  initialData: ListCommentsResponse;
  initialCount: number;
}

type OptimisticComment = Comment & { pending?: boolean; clientId?: string };

const commentsKey = (teamId: string) => ['comments', teamId] as const;

export function CommentList({ teamId, locale, initialData, initialCount }: Props) {
  const t = useTranslations('comments');
  const queryClient = useQueryClient();
  const [optimisticExtras, setOptimisticExtras] = useState<OptimisticComment[]>([]);

  const query = useInfiniteQuery({
    queryKey: commentsKey(teamId),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listComments({ teamId, page: pageParam as number }, { locale }),
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
    initialData: { pages: [initialData], pageParams: [1] },
  });

  const allServer: Comment[] = useMemo(() => {
    return query.data ? query.data.pages.flatMap((p) => p.comments) : [];
  }, [query.data]);

  const serverIds = useMemo(() => new Set(allServer.map((c) => c.id)), [allServer]);
  const extras = optimisticExtras.filter(
    (c) => !serverIds.has(c.id) && !(c.clientId && serverIds.has(c.clientId)),
  );
  const items: OptimisticComment[] = [...extras, ...allServer];
  const totalCount = Math.max(initialCount, allServer.length + extras.filter((e) => !e.pending).length);

  const createMut = useMutation({
    mutationFn: (values: CommentFormSubmit) =>
      createComment({ teamId, ...values }, { locale }),
  });

  async function handleCreate(values: CommentFormSubmit): Promise<
    { ok: true } | { ok: false; error: string }
  > {
    const clientId = `optimistic-${Date.now()}-${Math.random()}`;
    const optimistic: OptimisticComment = {
      id: clientId,
      teamId,
      nickname: values.nickname,
      content: values.content,
      createdAt: new Date().toISOString(),
      pending: true,
      clientId,
    };
    setOptimisticExtras((prev) => [optimistic, ...prev]);

    try {
      const saved = await createMut.mutateAsync(values);
      setOptimisticExtras((prev) =>
        prev.map((c) => (c.clientId === clientId ? { ...saved, pending: false } : c)),
      );
      await queryClient.invalidateQueries({ queryKey: commentsKey(teamId) });
      return { ok: true };
    } catch (err) {
      setOptimisticExtras((prev) => prev.filter((c) => c.clientId !== clientId));
      if (err instanceof ApiError) {
        if (err.status === 429) return { ok: false, error: t('rateLimited') };
        if (err.status === 403) return { ok: false, error: t('forbiddenWord') };
      }
      return { ok: false, error: t('errorGeneric') };
    }
  }

  async function handleDelete(commentId: string, password: string): Promise<boolean> {
    try {
      await deleteComment({ commentId, password }, { locale });
    } catch {
      return false;
    }
    setOptimisticExtras((prev) => prev.filter((c) => c.id !== commentId));
    queryClient.setQueryData<typeof query.data>(commentsKey(teamId), (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((p) => ({
          ...p,
          comments: p.comments.filter((c) => c.id !== commentId),
        })),
      };
    });
    return true;
  }

  return (
    <section className="mt-4" data-testid="comments-section">
      <h2 className="text-[10px] text-text-secondary font-medium mb-1.5">
        {t('heading', { count: totalCount })}
      </h2>
      <CommentForm onSubmit={handleCreate} />
      <div data-testid="comment-list">
        {items.length === 0 && (
          <div className="text-[10px] text-text-tertiary italic">{t('empty')}</div>
        )}
        {items.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            locale={locale}
            onDelete={(password) => handleDelete(c.id, password)}
          />
        ))}
      </div>
      {query.hasNextPage && (
        <button
          type="button"
          data-testid="comment-load-more"
          disabled={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
          className="w-full py-1.5 text-[10px] text-text-secondary border border-border-tertiary rounded-sm mt-1 disabled:opacity-40"
        >
          {query.isFetchingNextPage ? t('loading') : t('loadMore')}
        </button>
      )}
    </section>
  );
}
