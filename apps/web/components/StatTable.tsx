import { StatRow } from './StatRow';
import type { StatRowData } from '../lib/team-calc';

interface Props {
  rows: StatRowData[];
}

export function StatTable({ rows }: Props) {
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
        />
      ))}
    </div>
  );
}
