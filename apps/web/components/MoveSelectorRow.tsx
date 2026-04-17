'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Move } from '@pokesearch/types';

interface Props {
  slotOrder: number;
  selectedMoveId: number | null;
  learnableMoves: Move[];
  damage: number | null;
  onChange: (moveId: number | null) => void;
}

export function MoveSelectorRow({
  slotOrder,
  selectedMoveId,
  learnableMoves,
  damage,
  onChange,
}: Props) {
  const locale = useLocale();
  const t = useTranslations('create');
  const tCommon = useTranslations('common');
  const selected = learnableMoves.find((m) => m.id === selectedMoveId) ?? null;
  const catShort =
    selected?.category === 'physical'
      ? 'phy'
      : selected?.category === 'special'
        ? 'spe'
        : 'sta';

  return (
    <div
      className="grid items-center gap-[7px] px-2 py-[5px] bg-bg-secondary rounded-sm text-[10px] mb-[3px]"
      style={{ gridTemplateColumns: '14px 1fr auto' }}
      data-testid={`move-row-${slotOrder}`}
    >
      {selected ? (
        <svg width={14} height={14} aria-hidden="true">
          <use href={`#cat-${catShort}`} />
        </svg>
      ) : (
        <span />
      )}
      <select
        aria-label={`Move slot ${slotOrder}`}
        data-testid={`move-select-${slotOrder}`}
        value={selectedMoveId ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? null : Number.parseInt(v, 10));
        }}
        className="bg-transparent text-[10px] text-left text-text-primary appearance-none cursor-pointer truncate"
      >
        <option value="">{t('moveEmpty')}</option>
        {learnableMoves.map((m) => (
          <option key={m.id} value={m.id}>
            {locale === 'ko' ? m.nameKo : m.nameEn}
            {m.category === 'status'
              ? ` · ${tCommon('statusMove')}`
              : m.power != null
                ? ` · ${m.power}`
                : ''}
          </option>
        ))}
      </select>
      {selected?.category === 'status' || damage == null ? (
        <span className="text-text-tertiary text-[9px] italic">—</span>
      ) : (
        <span className="text-[#0C447C] font-medium tabular-nums">
          {damage.toLocaleString()}
        </span>
      )}
    </div>
  );
}
