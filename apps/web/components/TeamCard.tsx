import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { TeamListItem } from '@pokesearch/types';

interface Props {
  team: TeamListItem;
}

export function TeamCard({ team }: Props) {
  const locale = useLocale();
  const t = useTranslations('home');

  return (
    <Link
      href={`/${locale}/teams/${team.id}`}
      data-testid="team-card"
      className="block border border-border-tertiary rounded-lg p-[9px]"
    >
      <div className="text-[11px] font-medium mb-[5px] truncate">{team.name}</div>
      <div className="flex gap-[3px] mb-[5px]">
        {team.pokemons.map((p) => (
          <img
            key={p.slotOrder}
            src={p.spriteUrl}
            alt=""
            width={22}
            height={22}
            loading="lazy"
            decoding="async"
            className="object-contain"
          />
        ))}
      </div>
      <div className="flex gap-2.5 text-[9px] text-text-secondary">
        <span>{t('viewsCount', { count: team.views })}</span>
        <span>{t('likesCount', { count: team.likesCount })}</span>
        <span>{t('commentsCount', { count: team.commentsCount })}</span>
      </div>
    </Link>
  );
}
