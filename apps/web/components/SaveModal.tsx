'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  open: boolean;
  saving: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onSubmit: (password: string) => void;
}

export function SaveModal({
  open,
  saving,
  errorMessage,
  onCancel,
  onSubmit,
}: Props) {
  const t = useTranslations('create');
  const tCommon = useTranslations('common');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPassword('');
      setConfirm('');
      setClientError(null);
      setTimeout(() => firstInputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (password.length < 4) {
      setClientError(t('passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      setClientError(t('passwordMismatch'));
      return;
    }
    setClientError(null);
    onSubmit(password);
  };

  const displayError = clientError ?? errorMessage;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
      data-testid="save-modal"
    >
      <div className="bg-bg-primary rounded-lg p-4 w-full max-w-[240px]">
        <div className="text-[13px] font-medium mb-1">{t('saveModalTitle')}</div>
        <div className="text-[10px] text-text-secondary mb-2.5 leading-snug">
          {t('saveModalDesc')}
        </div>

        <label className="block text-[10px] text-text-secondary mb-1">
          {t('passwordLabel')}
        </label>
        <input
          ref={firstInputRef}
          type="password"
          data-testid="password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full min-h-[32px] px-2 py-1 text-[11px] border border-border-tertiary rounded-sm bg-bg-secondary mb-2"
          autoComplete="new-password"
          maxLength={64}
        />

        <label className="block text-[10px] text-text-secondary mb-1">
          {t('passwordConfirmLabel')}
        </label>
        <input
          type="password"
          data-testid="password-confirm-input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full min-h-[32px] px-2 py-1 text-[11px] border border-border-tertiary rounded-sm bg-bg-secondary mb-2"
          autoComplete="new-password"
          maxLength={64}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />

        <div className="bg-warn-bg rounded-sm px-2 py-1.5 text-[9px] text-warn-fg leading-snug mb-2">
          {t('passwordWarn')}
        </div>

        {displayError && (
          <div
            data-testid="save-modal-error"
            className="bg-danger-bg rounded-sm px-2 py-1.5 text-[9px] text-danger-fg leading-snug mb-2"
          >
            {displayError}
          </div>
        )}

        <div className="flex gap-1.5 mt-2.5">
          <button
            type="button"
            data-testid="save-modal-cancel"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 py-[7px] text-[11px] border border-border-tertiary rounded-sm min-h-[32px]"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            data-testid="save-modal-confirm"
            onClick={submit}
            disabled={saving}
            className="flex-1 py-[7px] text-[11px] bg-text-primary text-bg-primary rounded-sm min-h-[32px] disabled:opacity-60"
          >
            {saving ? t('saving') : tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
