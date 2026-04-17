'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';

export interface CommentFormSubmit {
  nickname: string;
  password: string;
  content: string;
}

interface Props {
  onSubmit: (values: CommentFormSubmit) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export function CommentForm({ onSubmit }: Props) {
  const t = useTranslations('comments');
  const defaultNick = t('defaultNickname');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) return;
    if (password.length < 4) {
      setError(t('errorGeneric'));
      return;
    }
    setSubmitting(true);
    const result = await onSubmit({
      nickname: nickname.trim() || defaultNick,
      password,
      content: trimmedContent,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setContent('');
    setPassword('');
  }

  return (
    <form
      data-testid="comment-form"
      onSubmit={handleSubmit}
      className="mt-2 mb-3"
    >
      <div className="grid grid-cols-2 gap-1.5 mb-1.5">
        <input
          data-testid="comment-nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          placeholder={t('nicknamePlaceholder')}
          className="border border-border-tertiary rounded-sm px-2.5 py-1.5 text-[10px] text-text-primary bg-bg-primary w-full box-border"
        />
        <input
          data-testid="comment-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={4}
          maxLength={64}
          placeholder={t('passwordPlaceholder')}
          className="border border-border-tertiary rounded-sm px-2.5 py-1.5 text-[10px] text-text-primary bg-bg-primary w-full box-border"
        />
      </div>
      <textarea
        data-testid="comment-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder={t('contentPlaceholder')}
        style={{ resize: 'none' }}
        className="border border-border-tertiary rounded-sm px-2.5 py-1.5 text-[10px] text-text-primary bg-bg-primary w-full box-border"
      />
      <button
        type="submit"
        data-testid="comment-submit"
        disabled={submitting || content.trim().length === 0 || password.length < 4}
        className="w-full mt-1.5 py-[7px] text-[11px] bg-text-primary text-bg-primary rounded-sm disabled:opacity-40"
      >
        {submitting ? t('posting') : t('submit')}
      </button>
      {error && (
        <div
          data-testid="comment-form-error"
          className="mt-1 text-[10px] text-danger-fg"
        >
          {error}
        </div>
      )}
    </form>
  );
}
