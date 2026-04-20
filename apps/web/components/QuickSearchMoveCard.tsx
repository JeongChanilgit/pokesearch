import type { StatRange } from '@pokesearch/calc';
import type { QuickSearchMove } from '@pokesearch/types';
import type { Locale } from '../i18n';
import { displayName } from '../lib/name';
import { MoveTypeIcon } from './MoveTypeIcon';

interface Props {
  move: QuickSearchMove;
  locale: Locale;
  damageOverride?: StatRange | null;
}

export function QuickSearchMoveCard({ move, locale, damageOverride }: Props) {
  const isStatus = move.category === 'status';
  const accStr = move.accuracy != null ? `${move.accuracy}%` : '—';
  const shortDesc = isStatus
    ? (locale === 'ko' ? move.shortDescKo : move.shortDescEn) ?? null
    : null;
  const damage = damageOverride !== undefined ? damageOverride : move.damage;

  return (
    <div className="border border-border-tertiary rounded-sm px-2 py-1.5 mb-1">
      <div className="flex items-center gap-1.5 text-[10px] mb-1">
        {!isStatus && (
          <svg width={14} height={14} aria-hidden="true">
            <use href={`#cat-${move.category === 'physical' ? 'phy' : 'spe'}`} />
          </svg>
        )}
        <MoveTypeIcon type={move.type} />
        <span className="font-medium">{displayName(move, locale)}</span>
        <span className="text-text-tertiary text-[9px]">
          {!isStatus && move.power != null ? `${move.power} · ` : ''}{accStr}
        </span>
      </div>
      {isStatus ? (
        shortDesc && (
          <p className="text-[9px] text-text-tertiary italic">{shortDesc}</p>
        )
      ) : (
        damage && (
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="bg-min-bg rounded-sm px-[2px] py-1">
              <div className="text-[11px] font-medium text-min-fg tabular-nums">
                {damage.min.toLocaleString()}
              </div>
            </div>
            <div className="bg-norm-bg rounded-sm px-[2px] py-1">
              <div className="text-[11px] font-medium text-norm-fg tabular-nums">
                {damage.norm.toLocaleString()}
              </div>
            </div>
            <div className="bg-high-bg rounded-sm px-[2px] py-1">
              <div className="text-[11px] font-medium text-high-fg tabular-nums">
                {damage.high.toLocaleString()}
              </div>
            </div>
            <div className="bg-max-bg rounded-sm px-[2px] py-1">
              <div className="text-[11px] font-medium text-max-fg tabular-nums">
                {damage.max.toLocaleString()}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
