'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { verifyTeamPassword, deleteTeam } from '@pokesearch/api-client';
import { ApiError } from '@pokesearch/api-client';

type Mode = 'edit' | 'delete';

interface Props {
  open: boolean;
  mode: Mode;
  teamId: string;
  onCancel: () => void;
  /** Fires after a successful verify (for mode='edit'). For 'delete' the modal
   * handles deletion internally and calls onDeleted. */
  onEditSuccess?: (token: string, expiresAt: string) => void;
  onDeleted?: () => void;
}

export function PasswordConfirmModal({
  open,
  mode,
  teamId,
  onCancel,
  onEditSuccess,
  onDeleted,
}: Props) {
  const t = useTranslations('verify');
  const tCommon = useTranslations('common');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPassword('');
      setError(null);
      setBusy(false);
      setTimeout(() => firstInputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (password.length < 1 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const verified = await verifyTeamPassword(teamId, { password });
      if (mode === 'edit') {
        onEditSuccess?.(verified.token, verified.expiresAt);
      } else {
        await deleteTeam(teamId, { token: verified.token });
        onDeleted?.();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(t('wrongPassword'));
        } else if (err.status === 429) {
          const retryAfter = readRetryAfter(err);
          const minutes = Math.max(1, Math.ceil(retryAfter / 60));
          setError(t('rateLimited', { minutes }));
        } else if (err.status === 404) {
          setError(t('errorGeneric'));
        } else {
          setError(t('errorGeneric'));
        }
      } else {
        setError(t('errorGeneric'));
      }
      setBusy(false);
    }
  };

  const titleKey = mode === 'edit' ? 'editTitle' : 'deleteTitle';
  const descKey = mode === 'edit' ? 'editDesc' : 'deleteDesc';
  const confirmKey = mode === 'edit' ? 'confirmEdit' : 'confirmDelete';
  const busyKey = mode === 'edit' ? 'verifying' : 'deleting';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      data-testid={`verify-modal-${mode}`}
    >
      <div className="bg-bg-primary rounded-lg p-4 w-full max-w-[260px]">
        <div className="text-[13px] font-medium mb-1">{t(titleKey)}</div>
        <div className="text-[10px] text-text-secondary mb-2.5 leading-snug">
          {t(descKey)}
        </div>

        {mode === 'delete' && (
          <div className="bg-danger-bg rounded-sm px-2 py-1.5 mb-2">
            <div className="text-[10px] font-medium text-danger-fg">
              ⚠ {t('deleteDangerHeading')}
            </div>
            <div className="text-[9px] text-danger-fg mt-[2px] leading-snug">
              {t('deleteDangerBody')}
            </div>
          </div>
        )}

        <label className="block text-[10px] text-text-secondary mb-1">
          {t('passwordLabel')}
        </label>
        <input
          ref={firstInputRef}
          type="password"
          data-testid="verify-password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('passwordPlaceholder')}
          className="w-full min-h-[32px] px-2 py-1 text-[11px] border border-border-tertiary rounded-sm bg-bg-secondary mb-2"
          autoComplete="current-password"
          maxLength={64}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void submit();
          }}
        />

        {error && (
          <div
            data-testid="verify-modal-error"
            className="bg-danger-bg rounded-sm px-2 py-1.5 text-[9px] text-danger-fg leading-snug mb-2"
          >
            {error}
          </div>
        )}

        <div className="flex gap-1.5 mt-2.5">
          <button
            type="button"
            data-testid="verify-modal-cancel"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 py-[7px] text-[11px] border border-border-tertiary rounded-sm min-h-[32px]"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            data-testid="verify-modal-confirm"
            onClick={() => void submit()}
            disabled={busy || password.length === 0}
            className={`flex-1 py-[7px] text-[11px] rounded-sm min-h-[32px] disabled:opacity-60 ${
              mode === 'delete'
                ? 'bg-danger-fg text-bg-primary'
                : 'bg-text-primary text-bg-primary'
            }`}
          >
            {busy ? t(busyKey) : t(confirmKey)}
          </button>
        </div>
      </div>
    </div>
  );
}

function readRetryAfter(err: ApiError): number {
  const body = err.body;
  if (body && typeof body === 'object' && 'retryAfter' in body) {
    const n = (body as { retryAfter?: unknown }).retryAfter;
    if (typeof n === 'number' && Number.isFinite(n)) return n;
  }
  return 15 * 60;
}
