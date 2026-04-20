interface Props {
  min: number;
  norm: number;
  high: number;
  max: number;
}

export function MinNormMaxRow({ min, norm, high, max }: Props) {
  return (
    <div className="grid grid-cols-4 gap-1 text-center mb-1.5">
      <div className="bg-min-bg rounded-sm px-[2px] py-1">
        <div className="text-[8px] tracking-wider text-min-label">MIN</div>
        <div className="text-[11px] font-medium text-min-fg tabular-nums mt-px">
          {min.toLocaleString()}
        </div>
      </div>
      <div className="bg-norm-bg rounded-sm px-[2px] py-1">
        <div className="text-[8px] tracking-wider text-norm-label">BASE</div>
        <div className="text-[11px] font-medium text-norm-fg tabular-nums mt-px">
          {norm.toLocaleString()}
        </div>
      </div>
      <div className="bg-high-bg rounded-sm px-[2px] py-1">
        <div className="text-[8px] tracking-wider text-high-label">HIGH</div>
        <div className="text-[11px] font-medium text-high-fg tabular-nums mt-px">
          {high.toLocaleString()}
        </div>
      </div>
      <div className="bg-max-bg rounded-sm px-[2px] py-1">
        <div className="text-[8px] tracking-wider text-max-label">MAX</div>
        <div className="text-[11px] font-medium text-max-fg tabular-nums mt-px">
          {max.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
