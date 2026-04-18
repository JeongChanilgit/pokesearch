interface Props {
  letter: 'H' | 'A' | 'B' | 'C' | 'D' | 'S';
  base: number;
  className?: string;
}

const MAX_BASE_STAT = 255;

export function BaseStatRow({ letter, base, className }: Props) {
  const fraction = Math.min(base / MAX_BASE_STAT, 1);

  return (
    <div
      className={`grid items-center gap-1 text-[10px] py-0.5 tabular-nums${className ? ` ${className}` : ''}`}
      style={{ gridTemplateColumns: '12px 1fr 30px' }}
    >
      <span className="text-text-secondary font-medium text-center">{letter}</span>
      <div className="h-[4px] bg-bg-secondary rounded-sm overflow-hidden flex">
        <div
          className="h-full bg-bar-base"
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <span className="text-right text-text-primary font-medium">{base}</span>
    </div>
  );
}
