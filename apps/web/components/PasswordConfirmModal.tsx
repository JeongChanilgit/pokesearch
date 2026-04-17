'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { deleteTeam, verifyTeamPassword, ApiError } from '@pokesearch/api-client';
import { saveVerifyToken } from '../lib/verify-session';

type Mode = 'edit' | 'delete';

interface Props {
  open: boolean;
  mode: Mode;
  teamId: string;
  onClose: () => void;
  onEditReady: (token: string) => void;
  onDeleted: () => void;
}

export function PasswordConfirmModal({
  open,
  mode,
  teamId,
  onClose,
  onEditReady,
  onDeleted,
}: Props) {
  const t = useTranslations('passwordConfirm');
  const tCommon = useTranslations('common');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPassword('');
      setError(null);
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, mode]);

  if (!open) return null;

  const submit = async () => {
    if (password.length === 0) {
      setError(t('passwordRequired'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await verifyTeamPassword(teamId, { password });
      if (mode === 'edit') {
        saveVerifyToken(teamId, res.token, res.expiresAt);
        onEditReady(res.token);
        return;
      }
      await deleteTeam(teamId, { token: res.token });
      onDeleted();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError(t('tooManyAttempts'));
        } else if (err.status === 401) {
          setError(t('wrongPassword'));
        } else if (err.status === 404) {
          setError(t('notFound'));
        } else {
          setError(t('generic'));
        }
      } else {
        setError(t('generic'));
      }
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'edit' ? t('titleEdit') : t('titleDelete');
  const desc = mode === 'edit' ? t('descEdit') : t('descDelete');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
      data-testid="password-confirm-modal"
      data-mode={mode}
    >
      <div className="bg-bg-primary rounded-lg p-4 w-full max-w-[240px]">
        <div className="text-[13px] font-medium mb-1">{title}</div>
        <div className="text-[10px] text-text-secondary mb-2.5 leading-snug">
          {desc}
        </div>

        {mode === 'delete' && (
          <div className="bg-danger-bg rounded-sm px-2 py-1.5 text-[9px] text-danger-fg leading-snug mb-2">
            ⚠ {t('cascadeWarning')}
          </div>
        )}

        <label className="block text-[10px] text-text-secondary mb-1">
          {t('passwordLabel')}
        </label>
        <input
          ref={inputRef}
          type="password"
          data-testid="confirm-password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full min-h-[32px] px-2 py-1 text-[11px] border border-border-tertiary rounded-sm bg-bg-secondary mb-2"
          autoComplete="current-password"
          maxLength={64}
          placeholder={t('passwordPlaceholder')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !busy) submit();
          }}
        />

        {error && (
          <div
            data-testid="password-confirm-error"
            className="bg-danger-bg rounded-sm px-2 py-1.5 text-[9px] text-danger-fg leading-snug mb-2"
          >
            {error}
          </div>
        )}

        <div className="flex gap-1.5 mt-2.5">
          <button
            type="button"
            data-testid="password-confirm-cancel"
            onClick={onClose}
            disabled={busy}
            className="flex-1 py-[7px] text-[11px] border border-border-tertiary rounded-sm min-h-[32px]"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            data-testid="password-confirm-submit"
            onClick={submit}
            disabled={busy}
            className={
              mode === 'delete'
                ? 'flex-1 py-[7px] text-[11px] bg-danger-fg text-bg-primary rounded-sm min-h-[32px] disabled:opacity-60'
                : 'flex-1 py-[7px] text-[11px] bg-text-primary text-bg-primary rounded-sm min-h-[32px] disabled:opacity-60'
            }
          >
            {busy
              ? t('busy')
              : mode === 'delete'
                ? tCommon('delete')
                : t('continueEdit')}
          </button>
        </div>
      </div>
    </div>
  );
}
