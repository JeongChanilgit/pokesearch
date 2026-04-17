'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PasswordConfirmModal } from './PasswordConfirmModal';
import { saveVerifyToken } from '../lib/verify-token-store';

interface Props {
  teamId: string;
}

export function TeamOwnerActions({ teamId }: Props) {
  const t = useTranslations('teamDetail');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [mode, setMode] = useState<'edit' | 'delete' | null>(null);

  return (
    <>
      <div className="flex gap-1.5 mb-2">
        <button
          type="button"
          data-testid="team-edit"
          onClick={() => setMode('edit')}
          className="flex-1 py-[7px] text-[11px] border border-border-tertiary rounded-sm min-h-[32px]"
        >
          {t('edit')}
        </button>
        <button
          type="button"
          data-testid="team-delete"
          onClick={() => setMode('delete')}
          className="flex-1 py-[7px] text-[11px] border border-danger-fg text-danger-fg rounded-sm min-h-[32px]"
        >
          {t('delete')}
        </button>
      </div>

      <PasswordConfirmModal
        open={mode !== null}
        mode={mode ?? 'edit'}
        teamId={teamId}
        onCancel={() => setMode(null)}
        onEditSuccess={(token, expiresAt) => {
          saveVerifyToken(teamId, token, expiresAt);
          setMode(null);
          router.push(`/${locale}/teams/${teamId}/edit`);
        }}
        onDeleted={() => {
          setMode(null);
          router.replace(`/${locale}`);
          router.refresh();
        }}
      />
    </>
  );
}
