'use client';

import { useMemo, useState } from 'react';
import type { Locale } from '../i18n';
import type { QuickSearchResponse, TypeName } from '@pokesearch/types';
import {
  bulkRangeWithStages,
  statRangeWithStage,
  damageRangeWithStage,
  type StatRange,
} from '@pokesearch/calc';
import { BaseStatRow } from './BaseStatRow';
import { MinNormMaxLegend } from './MinNormMaxLegend';
import { MinNormMaxRow } from './MinNormMaxRow';
import { MoveFilterList } from './MoveFilterList';

interface Labels {
  baseStats: string;
  physBulk: string;
  specBulk: string;
  speed: string;
  moves: string;
  movesHint: string;
  noMoves: string;
  movesAll: string;
  movesAttack: string;
  movesStatus: string;
  // NEW
  stageUp: string;
  stageDown: string;
  moveSearchPlaceholder: string;
  moveSearchClear: string;
  moveSearchNoMatches: string;
}

interface Props {
  locale: Locale;
  result: QuickSearchResponse; // must have result.pokemon truthy — caller guarantees
  level: 50 | 100;
  labels: Labels;
}

export function QuickSearchInteractive({ locale, result, level, labels }: Props) {
  const p = result.pokemon!;
  const types = p.types as TypeName[];
  const [ranks, setRanks] = useState({ A: 0, B: 0, C: 0, D: 0, S: 0 });

  const setRank = (k: 'A' | 'B' | 'C' | 'D' | 'S') => (next: number) =>
    setRanks((r) => ({ ...r, [k]: next }));

  const physBulk = useMemo(
    () => bulkRangeWithStages(p.baseH, p.baseB, level, 'physical', ranks.B),
    [p.baseH, p.baseB, level, ranks.B],
  );
  const specBulk = useMemo(
    () => bulkRangeWithStages(p.baseH, p.baseD, level, 'special', ranks.D),
    [p.baseH, p.baseD, level, ranks.D],
  );
  const speed = useMemo(
    () => statRangeWithStage(p.baseS, level, false, ranks.S),
    [p.baseS, level, ranks.S],
  );

  const damageByMoveId = useMemo(() => {
    const map = new Map<number, StatRange | null>();
    for (const m of result.moves) {
      if (m.category === 'status' || m.power == null) {
        map.set(m.id, null);
        continue;
      }
      const isSTAB = types.includes(m.type as TypeName);
      const attackBase = m.category === 'physical' ? p.baseA : p.baseC;
      const stage = m.category === 'physical' ? ranks.A : ranks.C;
      map.set(
        m.id,
        damageRangeWithStage(attackBase, level, m.power, isSTAB, stage),
      );
    }
    return map;
  }, [result.moves, types, p.baseA, p.baseC, level, ranks.A, ranks.C]);

  return (
    <>
      <SectionHeading title={labels.baseStats} />
      <BaseStatRow letter="H" base={p.baseH} />
      <BaseStatRow letter="A" base={p.baseA} stage={ranks.A} onStageChange={setRank('A')} incLabel={labels.stageUp} decLabel={labels.stageDown} />
      <BaseStatRow letter="B" base={p.baseB} stage={ranks.B} onStageChange={setRank('B')} incLabel={labels.stageUp} decLabel={labels.stageDown} />
      <BaseStatRow letter="C" base={p.baseC} stage={ranks.C} onStageChange={setRank('C')} incLabel={labels.stageUp} decLabel={labels.stageDown} />
      <BaseStatRow letter="D" base={p.baseD} stage={ranks.D} onStageChange={setRank('D')} incLabel={labels.stageUp} decLabel={labels.stageDown} />
      <BaseStatRow letter="S" base={p.baseS} stage={ranks.S} onStageChange={setRank('S')} incLabel={labels.stageUp} decLabel={labels.stageDown} />

      <MinNormMaxLegend />

      <SectionHeading title={labels.physBulk} icon="i-shield" />
      <MinNormMaxRow {...physBulk} />

      <SectionHeading title={labels.specBulk} icon="i-barrier" />
      <MinNormMaxRow {...specBulk} />

      <SectionHeading title={labels.speed} icon="i-shoe" />
      <MinNormMaxRow {...speed} />

      <SectionHeading title={labels.moves} hint={labels.movesHint} />
      <MoveFilterList
        moves={result.moves}
        locale={locale}
        noMovesLabel={labels.noMoves}
        allLabel={labels.movesAll}
        attackLabel={labels.movesAttack}
        statusLabel={labels.movesStatus}
        searchLabel={labels.moveSearchPlaceholder}
        searchClearLabel={labels.moveSearchClear}
        noMatchesLabel={labels.moveSearchNoMatches}
        damageByMoveId={damageByMoveId}
      />
    </>
  );
}

function SectionHeading({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: string;
}) {
  return (
    <div className="text-[10px] text-text-secondary font-medium mt-2 mb-[5px] flex justify-between items-center">
      <span className="inline-flex items-center gap-1">
        {icon && (
          <svg width={11} height={11} aria-hidden="true">
            <use href={`#${icon}`} />
          </svg>
        )}
        {title}
      </span>
      {hint && (
        <span className="text-[9px] text-text-tertiary font-normal">{hint}</span>
      )}
    </div>
  );
}
