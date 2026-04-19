'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Move } from '@pokesearch/types';
import { MoveTypeIcon } from './MoveTypeIcon';
import { Combobox } from './Combobox';

interface Props {
  slotOrder: number;
  selectedMoveId: number | null;
  learnableMoves: Move[];
  damage: number | null;
  onChange: (moveId: number | null) => void;
}

// Sentinel for the "empty" option so Combobox can handle null selections
const EMPTY_MOVE = {
  id: -1,
  nameEn: '',
  nameKo: '',
  type: 'normal',
  category: 'status',
  power: null,
  accuracy: null,
  pp: 1,
} as const satisfies Move;

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

  type MoveOrEmpty = Move | typeof EMPTY_MOVE;

  const allMoves: MoveOrEmpty[] = [EMPTY_MOVE, ...learnableMoves];

  const comboValue: MoveOrEmpty = selected ?? EMPTY_MOVE;

  function getLabel(m: MoveOrEmpty): string {
    if (m.id === -1) return t('moveEmpty');
    const move = m as Move;
    const name = locale === 'ko' ? move.nameKo : move.nameEn;
    if (move.category === 'status') {
      const acc = move.accuracy != null ? `${move.accuracy}%` : '—';
      return `${name} · ${tCommon('statusMove')} · ${acc}`;
    }
    const power = move.power != null ? `${move.power}` : '—';
    const acc = move.accuracy != null ? `${move.accuracy}%` : '—';
    return `${name} · ${power} · ${acc}`;
  }

  function getSearchLabel(m: MoveOrEmpty): string {
    if (m.id === -1) return '';
    const move = m as Move;
    // Return the alternate locale name so cross-language search works
    return locale === 'ko' ? move.nameEn : move.nameKo;
  }

  function handleChange(m: MoveOrEmpty) {
    onChange(m.id === -1 ? null : m.id);
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
        <Combobox
          items={allMoves}
          value={comboValue}
          onChange={handleChange}
          getLabel={getLabel}
          getSearchLabel={getSearchLabel}
          placeholder={t('moveSearch')}
          ariaLabel={`Move slot ${slotOrder}`}
          testId={`move-select-${slotOrder}`}
        />
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
