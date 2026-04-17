import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@pokesearch/db';
import { UuidSchema } from '@pokesearch/types';
import { queryTeamDetail } from '../../../../lib/team-queries';
import {
  VIEW_DEDUP_COOKIE_PREFIX,
  VIEW_DEDUP_MAX_AGE_SECONDS,
} from '../../../../lib/team-mapping';
import { computeTeamPokemonMetrics } from '../../../../lib/team-calc';
import { TeamPokemonCard } from '../../../../components/TeamPokemonCard';
import { LikeButton } from '../../../../components/LikeButton';
import { TeamOwnerActions } from '../../../../components/TeamOwnerActions';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function TeamDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const validId = UuidSchema.safeParse(id);
  if (!validId.success) notFound();

  const cookieStore = await cookies();
  const cookieName = `${VIEW_DEDUP_COOKIE_PREFIX}${id}`;
  const alreadyViewed = cookieStore.get(cookieName)?.value === '1';

  if (!alreadyViewed) {
    await prisma.team
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => {});
    cookieStore.set(cookieName, '1', {
      path: '/',
      maxAge: VIEW_DEDUP_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  const team = await queryTeamDetail(id);
  if (!team) notFound();

  const t = await getTranslations('teamDetail');

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Link
          href={`/${locale}`}
          aria-label={t('back')}
          className="text-[14px] text-text-secondary min-h-[32px] inline-flex items-center"
        >
          ←
        </Link>
        <h1 className="flex-1 text-[12px] font-medium truncate" data-testid="team-name">
          {team.name}
        </h1>
      </div>
      <div className="flex gap-2 items-center mb-2.5 flex-wrap">
        <LikeButton count={team.likesCount} />
        <span className="text-[9px] text-text-secondary">
          {t('viewsCount', { count: team.views })} ·{' '}
          {t('commentsCount', { count: team.commentsCount })}
        </span>
        <span className="flex-1" />
        <TeamOwnerActions teamId={team.id} locale={locale} />
      </div>
      {team.description && (
        <p className="text-[11px] text-text-secondary mb-2 whitespace-pre-wrap">
          {team.description}
        </p>
      )}
      <div data-testid="team-pokemon-list">
        {team.pokemons.map((p) => (
          <TeamPokemonCard
            key={p.id}
            pokemon={p}
            metrics={computeTeamPokemonMetrics(p, team.level)}
          />
        ))}
      </div>
      <section className="mt-4" data-testid="comments-section">
        <h2 className="text-[10px] text-text-secondary font-medium mb-1.5">
          {t('commentsHeading', { count: team.commentsCount })}
        </h2>
        <div className="text-[10px] text-text-tertiary italic">
          {t('commentsPlaceholder')}
        </div>
      </section>
    </div>
  );
}
