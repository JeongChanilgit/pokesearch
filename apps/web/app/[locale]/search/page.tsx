import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { locales, type Locale } from '../../../i18n';
import { localeAlternates } from '../../../lib/site-url';
import { buildQuickSearchResult, findPokemonByNamePrefix } from '../../../lib/search-core';
import { displayName } from '../../../lib/name';
import { TypeBadge } from '../../../components/TypeBadge';
import type { PokemonType } from '../../../components/TypeBadge';
import { PokemonHolder } from '../../../components/PokemonHolder';
import { SearchInput } from '../../../components/SearchInput';
import { LevelToggle } from '../../../components/LevelToggle';
import { QuickSearchInteractive } from '../../../components/QuickSearchInteractive';
import type { TypeName, QuickSearchResponse } from '@pokesearch/types';
import { effectivenessAgainst } from '@pokesearch/calc';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });
  const alternates = localeAlternates(locale, '/search');
  return {
    title: t('search.title'),
    description: t('search.description'),
    alternates,
    openGraph: {
      title: t('search.title'),
      description: t('search.description'),
      url: alternates.canonical,
      type: 'website',
    },
    twitter: {
      title: t('search.title'),
      description: t('search.description'),
    },
  };
}

function parseLevel(raw: string | string[] | undefined): 50 | 100 {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return n === 100 ? 100 : 50;
}

function firstString(raw: string | string[] | undefined): string {
  if (!raw) return '';
  return Array.isArray(raw) ? (raw[0] ?? '') : raw;
}

interface Labels {
  weak: string;
  resist: string;
  immune: string;
  baseStats: string;
  physBulk: string;
  specBulk: string;
  speed: string;
  moves: string;
  movesHint: string;
  noMoves: string;
  movesAll: string;
  movesAttack: string;
  movesStatus: string;
  stageUp: string;
  stageDown: string;
  moveSearchPlaceholder: string;
  moveSearchClear: string;
  moveSearchNoMatches: string;
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params;
  if (!locales.includes(rawLocale as Locale)) notFound();
  const locale = rawLocale as Locale;

  const sp = await searchParams;
  const q = firstString(sp.q).slice(0, 32);
  const level = parseLevel(sp.level);

  if (q) {
    const match = await findPokemonByNamePrefix(q);
    if (match?.showdown_id) {
      const dest =
        level === 100
          ? `/${locale}/pokemon/${match.showdown_id}?level=100`
          : `/${locale}/pokemon/${match.showdown_id}`;
      redirect(dest);
    }
  }

  const t = await getTranslations({ locale, namespace: 'search' });

  const tCreate = await getTranslations({ locale, namespace: 'create' });
  const labels: Labels = {
    weak: t('weak'),
    resist: t('resist'),
    immune: t('immune'),
    baseStats: t('baseStats'),
    physBulk: t('physBulk'),
    specBulk: t('specBulk'),
    speed: t('speed'),
    moves: t('moves'),
    movesHint: t('movesHint'),
    noMoves: t('noMoves'),
    movesAll: tCreate('movesAll'),
    movesAttack: tCreate('movesAttack'),
    movesStatus: tCreate('movesStatus'),
    stageUp: t('stageUp'),
    stageDown: t('stageDown'),
    moveSearchPlaceholder: t('moveSearchPlaceholder'),
    moveSearchClear: t('moveSearchClear'),
    moveSearchNoMatches: t('moveSearchNoMatches'),
  };

  const result = q ? await buildQuickSearchResult(q, level) : null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[14px] font-medium">{t('title')}</h1>
        <LevelToggle level={level} />
      </div>

      <SearchInput initialQuery={q} level={level} />

      {!q && (
        <div className="border border-dashed border-border-tertiary rounded-lg px-2.5 py-[22px] text-center text-[11px] text-text-tertiary">
          {t('enterQuery')}
        </div>
      )}

      {q && result && !result.pokemon && (
        <div className="border border-dashed border-border-tertiary rounded-lg px-2.5 py-[22px] text-center text-[11px] text-text-tertiary">
          {t('notFound')}
        </div>
      )}

      {q && result && result.pokemon && (
        <SearchResult locale={locale} result={result} level={level} labels={labels} />
      )}
    </div>
  );
}

function SearchResult({
  locale,
  result,
  level,
  labels,
}: {
  locale: Locale;
  result: QuickSearchResponse;
  level: 50 | 100;
  labels: Labels;
}) {
  const p = result.pokemon!;
  const defenderTypes = p.types as TypeName[];

  return (
    <>
      <div className="flex gap-2 items-start mb-2 flex-wrap">
        <div className="flex gap-2 items-center min-w-0">
          <PokemonHolder spriteUrl={p.spriteUrl} size={32} />
          <div className="min-w-0">
            <div className="text-[13px] font-medium truncate">
              {displayName(p, locale)}
            </div>
            <div className="mt-0.5 flex items-center gap-0.5 flex-wrap">
              {(p.types as TypeName[]).map((type) => (
                <TypeBadge key={type} type={type as PokemonType} />
              ))}
            </div>
          </div>
        </div>

        <div className="ml-auto min-w-[140px] grid grid-cols-[auto_1fr] gap-x-1 items-start text-[9px] text-text-secondary leading-[1.5]">
          <b className="text-text-secondary">{labels.weak}</b>
          <div>
            {p.weaknesses.map((w) => {
              const mult = effectivenessAgainst(w, defenderTypes);
              return (
                <TypeBadge
                  key={w}
                  type={w as PokemonType}
                  suffix={mult >= 4 ? ' ×4' : ''}
                />
              );
            })}
          </div>
          <b className="text-text-secondary">{labels.resist}</b>
          <div>
            {p.resistances.map((r) => (
              <TypeBadge key={r} type={r as PokemonType} />
            ))}
          </div>
          {p.immunities.length > 0 && (
            <>
              <b className="text-text-secondary">{labels.immune}</b>
              <div>
                {p.immunities.map((im) => (
                  <TypeBadge key={im} type={im as PokemonType} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <QuickSearchInteractive
        locale={locale}
        result={result}
        level={level}
        labels={labels}
      />
    </>
  );
}
