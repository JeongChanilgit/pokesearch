import { StatRow } from './StatRow';
import type { StatRowData } from '../lib/team-calc';

interface Props {
  rows: StatRowData[];
  stages?: Partial<Record<'A' | 'B' | 'C' | 'D' | 'S', number>>;
  onStageChange?: (letter: 'A' | 'B' | 'C' | 'D' | 'S', next: number) => void;
}

export function StatTable({ rows, stages, onStageChange }: Props) {
  return (
    <div>
      {rows.map((r) => (
        <StatRow
          key={r.letter}
          letter={r.letter}
          finalStat={r.finalStat}
          ev={r.ev}
          natureEffect={r.natureEffect}
          baseFraction={r.baseFraction}
          evFraction={r.evFraction}
          {...(r.letter !== 'H' && {
            stage: stages?.[r.letter] ?? 0,
            onStageChange: onStageChange
              ? (next) => onStageChange(r.letter as 'A' | 'B' | 'C' | 'D' | 'S', next)
              : undefined,
          })}
        />
      ))}
    </div>
  );
}
