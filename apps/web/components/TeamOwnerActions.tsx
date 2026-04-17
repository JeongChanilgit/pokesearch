'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PasswordConfirmModal } from './PasswordConfirmModal';

interface Props {
  teamId: string;
  locale: string;
}

type Mode = 'closed' | 'edit' | 'delete';

export function TeamOwnerActions({ teamId, locale }: Props) {
  const router = useRouter();
  const t = useTranslations('teamDetail');
  const [mode, setMode] = useState<Mode>('closed');
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        data-testid="team-edit-button"
        onClick={() => setMode('edit')}
        className="text-[10px] px-2 py-1 border border-border-tertiary rounded-sm min-h-[28px]"
      >
        {t('edit')}
      </button>
      <button
        type="button"
        data-testid="team-delete-button"
        onClick={() => setMode('delete')}
        className="text-[10px] px-2 py-1 border border-danger-border text-danger-fg bg-danger-bg rounded-sm min-h-[28px]"
      >
        {t('delete')}
      </button>

      <PasswordConfirmModal
        open={mode !== 'closed'}
        mode={mode === 'delete' ? 'delete' : 'edit'}
        teamId={teamId}
        onClose={() => setMode('closed')}
        onEditReady={() => {
          setMode('closed');
          router.push(`/${locale}/teams/${teamId}/edit`);
        }}
        onDeleted={() => {
          setMode('closed');
          setToast(t('deletedToast'));
          setTimeout(() => {
            router.push(`/${locale}`);
            router.refresh();
          }, 600);
        }}
      />

      {toast && (
        <div
          role="status"
          data-testid="toast"
          className="fixed bottom-[70px] left-1/2 -translate-x-1/2 bg-text-primary text-bg-primary text-[11px] px-3 py-1.5 rounded-md shadow-lg z-40"
        >
          {toast}
        </div>
      )}
    </>
  );
}
