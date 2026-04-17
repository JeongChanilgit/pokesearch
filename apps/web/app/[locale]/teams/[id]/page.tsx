import Link from 'next/link';
import { headers, cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createHash } from 'node:crypto';
import { prisma } from '@pokesearch/db';
import { UuidSchema, type ListCommentsResponse } from '@pokesearch/types';
import { queryTeamDetail } from '../../../../lib/team-queries';
import {
  VIEW_DEDUP_COOKIE_PREFIX,
  VIEW_DEDUP_MAX_AGE_SECONDS,
} from '../../../../lib/team-mapping';
import { computeTeamPokemonMetrics } from '../../../../lib/team-calc';
import { TeamPokemonCard } from '../../../../components/TeamPokemonCard';
import { LikeButton } from '../../../../components/LikeButton';
import { CommentList } from '../../../../components/CommentList';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

const COMMENT_PAGE_SIZE = 20;

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

  const hdrs = await headers();
  const fwd = hdrs.get('x-forwarded-for');
  const ip = fwd ? fwd.split(',')[0]!.trim() : (hdrs.get('x-real-ip') ?? 'unknown').trim();
  const ua = hdrs.get('user-agent') ?? '';
  const clientFp = createHash('sha256').update(`${ip}|${ua}`).digest('hex');

  const [initialCommentsRows, likedRow] = await Promise.all([
    prisma.comment.findMany({
      where: { teamId: id },
      orderBy: { createdAt: 'desc' },
      take: COMMENT_PAGE_SIZE + 1,
      select: {
        id: true,
        teamId: true,
        nickname: true,
        content: true,
        createdAt: true,
      },
    }),
    prisma.like.findUnique({
      where: { teamId_clientFp: { teamId: id, clientFp } },
      select: { id: true },
    }),
  ]);

  const hasMore = initialCommentsRows.length > COMMENT_PAGE_SIZE;
  const initialComments: ListCommentsResponse = {
    comments: initialCommentsRows.slice(0, COMMENT_PAGE_SIZE).map((c) => ({
      id: c.id,
      teamId: c.teamId,
      nickname: c.nickname,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
    })),
    hasMore,
  };

  const localeCode: 'en' | 'ko' = locale === 'ko' ? 'ko' : 'en';

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
      <div className="flex gap-2 items-center mb-2.5">
        <LikeButton
          teamId={id}
          initialCount={team.likesCount}
          initialLiked={likedRow !== null}
          locale={localeCode}
        />
        <span className="text-[9px] text-text-secondary">
          {t('viewsCount', { count: team.views })} ·{' '}
          {t('commentsCount', { count: team.commentsCount })}
        </span>
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
      <CommentList
        teamId={id}
        locale={localeCode}
        initialData={initialComments}
        initialCount={team.commentsCount}
      />
    </div>
  );
}
