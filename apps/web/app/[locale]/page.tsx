import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { TeamListSort } from '@pokesearch/types';
import { queryTeamList } from '../../lib/team-queries';
import { SortDropdown } from '../../components/SortDropdown';
import { TeamListBody } from '../../components/TeamListBody';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sort?: string; pokemonId?: string }>;
}

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations('home');

  const sortParsed = TeamListSort.safeParse(sp.sort);
  const sort = sortParsed.success ? sortParsed.data : 'likes';
  const pokemonId = sp.pokemonId ? Number.parseInt(sp.pokemonId, 10) : undefined;

  const initial = await queryTeamList({
    sort,
    pokemonId: pokemonId && Number.isFinite(pokemonId) ? pokemonId : undefined,
    limit: 20,
  });

  if (initial.items.length === 0) {
    return (
      <div>
        <h1 className="text-[12px] font-medium mb-2">{t('popularTeams')}</h1>
        <div className="border border-dashed border-border-tertiary rounded-lg px-2.5 py-[22px] text-center text-[11px] text-text-tertiary">
          <div>{t('emptyTitle')}</div>
          <Link
            href={`/${locale}/teams/new`}
            className="inline-block mt-2 px-3 py-1.5 text-[10px] border border-border-tertiary rounded-sm bg-text-primary text-bg-primary min-h-[32px]"
          >
            {t('emptyCta')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[12px] font-medium mb-2">{t('popularTeams')}</h1>
      <div className="flex gap-1.5 mb-2.5">
        <SortDropdown />
        <div className="flex-1 border border-border-tertiary rounded-md px-2 py-1.5 text-[10px] text-text-secondary min-h-[32px] flex items-center">
          {t('filter')}
        </div>
      </div>
      <TeamListBody initial={initial} sort={sort} pokemonId={pokemonId} />
    </div>
  );
}
