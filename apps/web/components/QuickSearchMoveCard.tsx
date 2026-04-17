import type { QuickSearchMove } from '@pokesearch/types';
import type { Locale } from '../i18n';
import { displayName } from '../lib/name';

interface Props {
  move: QuickSearchMove;
  locale: Locale;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function QuickSearchMoveCard({ move, locale }: Props) {
  return (
    <div className="border border-border-tertiary rounded-sm px-2 py-1.5 mb-1">
      <div className="flex items-center gap-1.5 text-[10px] mb-1">
        <svg width={14} height={14}>
          <use href={`#cat-${move.category === 'physical' ? 'phy' : 'spe'}`} />
        </svg>
        <span className="font-medium">{displayName(move, locale)}</span>
        <span className="text-text-tertiary text-[9px]">
          · {capitalize(move.type)} · {move.power}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1 text-center">
        <div className="bg-min-bg rounded-sm px-[2px] py-1">
          <div className="text-[11px] font-medium text-min-fg tabular-nums">
            {move.damage.min.toLocaleString()}
          </div>
        </div>
        <div className="bg-norm-bg rounded-sm px-[2px] py-1">
          <div className="text-[11px] font-medium text-norm-fg tabular-nums">
            {move.damage.norm.toLocaleString()}
          </div>
        </div>
        <div className="bg-max-bg rounded-sm px-[2px] py-1">
          <div className="text-[11px] font-medium text-max-fg tabular-nums">
            {move.damage.max.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
