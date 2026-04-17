import { MoveRow } from './MoveRow';
import type { MoveDisplayData } from '../lib/team-calc';

interface Props {
  moves: MoveDisplayData[];
}

export function MovesList({ moves }: Props) {
  return (
    <div>
      {moves.map((m) => (
        <MoveRow key={m.slotOrder} move={m.move} damage={m.damage} />
      ))}
    </div>
  );
}
