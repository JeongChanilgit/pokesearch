import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { prisma } from '@pokesearch/db';
import { locales, type Locale } from '../../../../i18n';
import { localeAlternates, getSiteUrl } from '../../../../lib/site-url';
import {
  buildQuickSearchResultBySlug,
  findPokemonByShowdownId,
} from '../../../../lib/search-core';
import { displayName } from '../../../../lib/name';
import { TypeBadge } from '../../../../components/TypeBadge';
import type { PokemonType } from '../../../../components/TypeBadge';
import { PokemonHolder } from '../../../../components/PokemonHolder';
import { LevelToggle } from '../../../../components/LevelToggle';
import { QuickSearchInteractive } from '../../../../components/QuickSearchInteractive';
import type { TypeName, QuickSearchResponse } from '@pokesearch/types';
import { effectivenessAgainst } from '@pokesearch/calc';

// ---------------------------------------------------------------------------
// Static params — pre-render every Champions Pokémon × every locale
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const rows = await prisma.pokemon.findMany({
    where: { showdownId: { not: null } },
    select: { showdownId: true },
  });
  const params: { locale: string; slug: string }[] = [];
  for (const r of rows) {
    if (!r.showdownId) continue;
    for (const l of locales) params.push({ locale: l, slug: r.showdownId });
  }
  return params;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!locales.includes(rawLocale as Locale)) return {};
  const locale = rawLocale as Locale;

  const row = await findPokemonByShowdownId(slug);
  if (!row) return {};

  const name = displayName(
    { nameEn: row.name_en, nameKo: row.name_ko },
    locale,
  );

  const t = await getTranslations({ locale, namespace: 'meta' });
  const alternates = localeAlternates(locale, `/pokemon/${slug}`);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${alternates.canonical}`;
  const imageUrl = `${siteUrl}/sprites/pokemon/${slug}.png`;

  const title = t('pokemon.title', { name });
  const description = t('pokemon.description', { name, level: 50 });

  return {
    title: { absolute: title },
    description,
    alternates,
    openGraph: {
      type: 'website',
      title,
      description,
      url: pageUrl,
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: locale === 'ko' ? 'en_US' : 'ko_KR',
      images: [{ url: imageUrl, width: 192, height: 192, alt: name }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseLevel(raw: string | string[] | undefined): 50 | 100 {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return n === 100 ? 100 : 50;
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PokemonPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!locales.includes(rawLocale as Locale)) notFound();
  const locale = rawLocale as Locale;

  const sp = await searchParams;
  const level = parseLevel(sp.level);

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

  const result = await buildQuickSearchResultBySlug(slug, level);
  if (!result.pokemon) notFound();

  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const siteUrl = getSiteUrl();
  const pokemonName = displayName(result.pokemon, locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: tMeta('pokemon.breadcrumbHome'),
            item: `${siteUrl}/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: tMeta('pokemon.breadcrumbPokedex'),
            item: `${siteUrl}/${locale}/pokemon`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: pokemonName,
            item: `${siteUrl}/${locale}/pokemon/${slug}`,
          },
        ],
      },
      {
        '@type': 'Thing',
        name: pokemonName,
        description: tMeta('pokemon.description', { name: pokemonName, level }),
        image: `${siteUrl}/sprites/pokemon/${slug}.png`,
        url: `${siteUrl}/${locale}/pokemon/${slug}`,
      },
    ],
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[14px] font-medium">{pokemonName}</h1>
          <LevelToggle level={level} />
        </div>

        <PokemonResult locale={locale} result={result} level={level} labels={labels} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Result sub-component (mirrors SearchResult in search/page.tsx)
// ---------------------------------------------------------------------------

function PokemonResult({
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
