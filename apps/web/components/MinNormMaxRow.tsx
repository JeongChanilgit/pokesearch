interface Props {
  min: number;
  norm: number;
  max: number;
}

export function MinNormMaxRow({ min, norm, max }: Props) {
  return (
    <div className="grid grid-cols-3 gap-1 text-center mb-1.5">
      <div className="bg-min-bg rounded-sm px-[2px] py-1">
        <div className="text-[8px] tracking-wider text-min-label">MIN</div>
        <div className="text-[11px] font-medium text-min-fg tabular-nums mt-px">
          {min.toLocaleString()}
        </div>
      </div>
      <div className="bg-norm-bg rounded-sm px-[2px] py-1">
        <div className="text-[8px] tracking-wider text-norm-label">NORM</div>
        <div className="text-[11px] font-medium text-norm-fg tabular-nums mt-px">
          {norm.toLocaleString()}
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
