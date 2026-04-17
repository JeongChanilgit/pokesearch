'use client';

import { useTranslations } from 'next-intl';
import type { Level } from '@pokesearch/types';

interface Props {
  name: string;
  description: string;
  level: Level;
  onName: (v: string) => void;
  onDescription: (v: string) => void;
  onLevel: (v: Level) => void;
}

export function TeamMetaForm({
  name,
  description,
  level,
  onName,
  onDescription,
  onLevel,
}: Props) {
  const t = useTranslations('create');
  return (
    <div>
      <label
        htmlFor="team-name"
        className="block text-[10px] text-text-secondary mb-[3px]"
      >
        {t('teamName')}
      </label>
      <input
        id="team-name"
        data-testid="team-name-input"
        className="pr-inp"
        value={name}
        placeholder={t('teamNamePlaceholder')}
        maxLength={60}
        onChange={(e) => onName(e.target.value)}
      />
      <label
        htmlFor="team-desc"
        className="block text-[10px] text-text-secondary mt-2 mb-[3px]"
      >
        {t('descriptionLabel')}
      </label>
      <textarea
        id="team-desc"
        data-testid="team-desc-input"
        rows={2}
        maxLength={500}
        className="pr-inp resize-none"
        placeholder={t('descriptionPlaceholder')}
        value={description}
        onChange={(e) => onDescription(e.target.value)}
      />
      <label className="block text-[10px] text-text-secondary mt-2 mb-[3px]">
        {t('level')}
      </label>
      <div
        className="inline-flex gap-0.5 p-0.5 bg-bg-secondary rounded-md text-[10px] w-full box-border"
        role="radiogroup"
      >
        {([50, 100] as const).map((lv) => (
          <button
            key={lv}
            type="button"
            role="radio"
            aria-checked={level === lv}
            onClick={() => onLevel(lv)}
            className={`flex-1 px-2.5 py-[3px] rounded-sm min-h-[28px] ${
              level === lv
                ? 'bg-bg-primary text-text-primary font-medium'
                : 'text-text-secondary'
            }`}
          >
            {lv}
          </button>
        ))}
      </div>
    </div>
  );
}
