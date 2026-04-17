'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Comment } from '@pokesearch/types';
import { formatRelative } from '../lib/date';

interface Props {
  comment: Comment & { pending?: boolean };
  locale: 'en' | 'ko';
  onDelete: (password: string) => Promise<boolean>;
}

export function CommentItem({ comment, locale, onDelete }: Props) {
  const t = useTranslations('comments');
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const relative = comment.pending
    ? t('posting')
    : formatRelative(new Date(comment.createdAt), locale);

  async function handleDelete() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const ok = await onDelete(password);
    setSubmitting(false);
    if (!ok) {
      setError(t('wrongPassword'));
      return;
    }
    setConfirming(false);
    setPassword('');
  }

  return (
    <div
      data-testid="comment-item"
      data-comment-id={comment.id}
      className={`bg-bg-secondary rounded-sm px-2 py-1.5 text-[10px] mb-1 ${
        comment.pending ? 'opacity-60' : ''
      }`}
    >
      <div className="flex justify-between text-[9px] text-text-secondary mb-0.5">
        <span>
          {comment.nickname} · {relative}
        </span>
        {!comment.pending && !confirming && (
          <button
            type="button"
            data-testid="comment-delete"
            onClick={() => setConfirming(true)}
            className="text-danger-fg min-h-[24px] px-1"
          >
            {t('delete')}
          </button>
        )}
      </div>
      <div className="text-text-primary whitespace-pre-wrap">{comment.content}</div>
      {confirming && (
        <div
          data-testid="comment-delete-confirm"
          className="mt-1.5 flex gap-1 items-center"
        >
          <input
            type="password"
            data-testid="comment-delete-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('deleteConfirm')}
            className="border border-border-tertiary rounded-sm px-2 py-1 text-[10px] flex-1 bg-bg-primary"
            autoFocus
          />
          <button
            type="button"
            data-testid="comment-delete-submit"
            onClick={handleDelete}
            disabled={submitting || password.length === 0}
            className="bg-text-primary text-bg-primary rounded-sm px-2 py-1 text-[10px] disabled:opacity-40"
          >
            {t('deleteSubmit')}
          </button>
          <button
            type="button"
            data-testid="comment-delete-cancel"
            onClick={() => {
              setConfirming(false);
              setPassword('');
              setError(null);
            }}
            className="text-text-secondary px-1 py-1 text-[10px]"
          >
            {t('deleteCancel')}
          </button>
        </div>
      )}
      {error && (
        <div
          data-testid="comment-delete-error"
          className="mt-1 text-[9px] text-danger-fg"
        >
          {error}
        </div>
      )}
    </div>
  );
}
