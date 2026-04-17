import { useTranslations } from 'next-intl';

interface Props {
  physicalBulk: number;
  specialBulk: number;
  speed: number;
}

export function KeyMetricsRow({ physicalBulk, specialBulk, speed }: Props) {
  const t = useTranslations('teamDetail');
  return (
    <div className="grid grid-cols-3 gap-[5px] my-[7px]">
      <div className="bg-phys-bg rounded-md px-1 py-[5px] text-center">
        <div className="text-[9px] text-phys-label">{t('physBulk')}</div>
        <div className="text-[13px] font-medium text-phys-fg tabular-nums mt-px">
          {physicalBulk.toLocaleString()}
        </div>
      </div>
      <div className="bg-spec-bg rounded-md px-1 py-[5px] text-center">
        <div className="text-[9px] text-spec-label">{t('specBulk')}</div>
        <div className="text-[13px] font-medium text-spec-fg tabular-nums mt-px">
          {specialBulk.toLocaleString()}
        </div>
      </div>
      <div className="bg-spd-bg rounded-md px-1 py-[5px] text-center">
        <div className="text-[9px] text-spd-label">{t('speed')}</div>
        <div className="text-[13px] font-medium text-spd-fg tabular-nums mt-px">
          {speed.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
