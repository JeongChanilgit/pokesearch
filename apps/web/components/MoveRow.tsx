import { useLocale, useTranslations } from 'next-intl';
import type { Move } from '@pokesearch/types';

interface Props {
  move: Move;
  damage: number | null;
}

export function MoveRow({ move, damage }: Props) {
  const locale = useLocale();
  const t = useTranslations('common');
  const name = locale === 'ko' ? move.nameKo : move.nameEn;
  const powerText =
    move.category === 'status' || move.power == null
      ? t('statusMove')
      : String(move.power);
  return (
    <div
      className="grid items-center gap-[7px] px-2 py-[5px] bg-bg-secondary rounded-sm text-[10px] mb-[3px]"
      style={{ gridTemplateColumns: '14px 1fr auto' }}
    >
      <svg width={14} height={14} aria-hidden="true">
        <use href={`#cat-${moveCategoryShort(move.category)}`} />
      </svg>
      <span className="truncate">
        {name}
        <span className="text-text-tertiary text-[9px]"> · {powerText}</span>
      </span>
      {move.category === 'status' ? (
        <span className="text-text-tertiary text-[9px] italic">—</span>
      ) : (
        <span className="text-[#0C447C] font-medium tabular-nums">
          {(damage ?? 0).toLocaleString()}
        </span>
      )}
    </div>
  );
}

function moveCategoryShort(c: Move['category']): 'phy' | 'spe' | 'sta' {
  if (c === 'physical') return 'phy';
  if (c === 'special') return 'spe';
  return 'sta';
}
