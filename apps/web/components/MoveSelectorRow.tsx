'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Move } from '@pokesearch/types';
import { MoveTypeIcon } from './MoveTypeIcon';

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

  const shortDesc =
    selected?.category === 'status'
      ? (locale === 'ko' ? selected.shortDescKo : selected.shortDescEn) ?? null
      : null;

  function moveLabel(m: Move): string {
    const name = locale === 'ko' ? m.nameKo : m.nameEn;
    const acc = m.accuracy != null ? `${m.accuracy}%` : '—';
    if (m.category === 'status') {
      return `${name} · ${tCommon('statusMove')} · ${acc}`;
    }
    const power = m.power != null ? `${m.power}` : '—';
    return `${name} · ${power} · ${acc}`;
  }

  return (
    <div data-testid={`move-row-${slotOrder}`} className="mb-[3px]">
      <div
        className="grid items-center gap-[7px] px-2 py-[5px] bg-bg-secondary rounded-sm text-[10px]"
        style={{ gridTemplateColumns: '14px 16px 1fr auto' }}
      >
        {selected ? (
          <svg width={14} height={14} aria-hidden="true">
            <use href={`#cat-${catShort}`} />
          </svg>
        ) : (
          <span />
        )}
        {selected ? <MoveTypeIcon type={selected.type} /> : <span />}
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
              {moveLabel(m)}
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
      {shortDesc && (
        <p className="text-[9px] text-text-tertiary italic px-2 pt-[2px]">
          {shortDesc}
        </p>
      )}
    </div>
  );
}
