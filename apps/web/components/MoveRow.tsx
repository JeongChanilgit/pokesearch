import { useLocale } from 'next-intl';
import type { Move } from '@pokesearch/types';
import { MoveTypeIcon } from './MoveTypeIcon';

interface Props {
  move: Move;
  damage: number | null;
}

export function MoveRow({ move, damage }: Props) {
  const locale = useLocale();
  const name = locale === 'ko' ? move.nameKo : move.nameEn;

  const powerText = move.category === 'status' || move.power == null ? '—' : String(move.power);
  const accText = move.accuracy != null ? `${move.accuracy}%` : '—';
  const powerAccText = `${powerText} · ${accText}`;

  return (
    <div
      className="grid items-center gap-[7px] px-2 py-[5px] bg-bg-secondary rounded-sm text-[10px] mb-[3px]"
      style={{ gridTemplateColumns: '14px 16px 1fr auto' }}
    >
      <svg width={14} height={14} aria-hidden="true">
        <use href={`#cat-${moveCategoryShort(move.category)}`} />
      </svg>
      <MoveTypeIcon type={move.type} />
      <span className="truncate">
        {name}
        <span className="text-text-tertiary text-[9px]"> · {powerAccText}</span>
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
