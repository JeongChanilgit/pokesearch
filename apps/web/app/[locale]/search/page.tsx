import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '../../../i18n';
import { buildQuickSearchResult } from '../../../lib/search-core';
import { displayName, secondaryName } from '../../../lib/name';
import { TypeBadge } from '../../../components/TypeBadge';
import type { PokemonType } from '../../../components/TypeBadge';
import { PokemonHolder } from '../../../components/PokemonHolder';
import { SearchInput } from '../../../components/SearchInput';
import { LevelToggle } from '../../../components/LevelToggle';
import { MinNormMaxLegend } from '../../../components/MinNormMaxLegend';
import { MinNormMaxRow } from '../../../components/MinNormMaxRow';
import { QuickSearchMoveCard } from '../../../components/QuickSearchMoveCard';
import type { TypeName, QuickSearchResponse } from '@pokesearch/types';
import { effectivenessAgainst } from '@pokesearch/calc';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
  physBulk: string;
  specBulk: string;
  speed: string;
  moves: string;
  movesHint: string;
  noMoves: string;
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale: rawLocale } = await params;
  if (!locales.includes(rawLocale as Locale)) notFound();
  const locale = rawLocale as Locale;

  const sp = await searchParams;
  const q = firstString(sp.q).slice(0, 32);
  const level = parseLevel(sp.level);

  const t = await getTranslations({ locale, namespace: 'search' });

  const labels: Labels = {
    weak: t('weak'),
    resist: t('resist'),
    immune: t('immune'),
    physBulk: t('physBulk'),
    specBulk: t('specBulk'),
    speed: t('speed'),
    moves: t('moves'),
    movesHint: t('movesHint'),
    noMoves: t('noMoves'),
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
        <SearchResult locale={locale} result={result} labels={labels} />
      )}
    </div>
  );
}

function SearchResult({
  locale,
  result,
  labels,
}: {
  locale: Locale;
  result: QuickSearchResponse;
  labels: Labels;
}) {
  const p = result.pokemon!;
  const defenderTypes = p.types as TypeName[];

  return (
    <>
      <div className="flex items-center gap-2 mb-1.5">
        <PokemonHolder pokemonId={p.id} size={32} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium truncate">
            {displayName(p, locale)}{' '}
            <span className="text-text-tertiary text-[10px] font-normal">
              · {secondaryName(p, locale)}
            </span>
          </div>
          <div className="mt-0.5">
            {(p.types as TypeName[]).map((type) => (
              <TypeBadge key={type} type={type as PokemonType} />
            ))}
          </div>
        </div>
      </div>

      <div className="text-[9px] text-text-secondary leading-[1.6] mb-2">
        <div>
          <b className="text-text-secondary">{labels.weak}</b>&nbsp;
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
        <div>
          <b className="text-text-secondary">{labels.resist}</b>&nbsp;
          {p.resistances.map((r) => (
            <TypeBadge key={r} type={r as PokemonType} />
          ))}
        </div>
        {p.immunities.length > 0 && (
          <div>
            <b className="text-text-secondary">{labels.immune}</b>&nbsp;
            {p.immunities.map((im) => (
              <TypeBadge key={im} type={im as PokemonType} />
            ))}
          </div>
        )}
      </div>

      <MinNormMaxLegend />

      {result.bulk && (
        <>
          <SectionHeading title={labels.physBulk} />
          <MinNormMaxRow {...result.bulk.physical} />

          <SectionHeading title={labels.specBulk} />
          <MinNormMaxRow {...result.bulk.special} />
        </>
      )}

      {result.speed && (
        <>
          <SectionHeading title={labels.speed} />
          <MinNormMaxRow {...result.speed} />
        </>
      )}

      <SectionHeading title={labels.moves} hint={labels.movesHint} />

      {result.moves.length === 0 ? (
        <div className="text-[10px] text-text-tertiary italic px-2 py-1">
          {labels.noMoves}
        </div>
      ) : (
        result.moves.map((m) => (
          <QuickSearchMoveCard key={m.id} move={m} locale={locale} />
        ))
      )}
    </>
  );
}

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-[10px] text-text-secondary font-medium mt-2 mb-[5px] flex justify-between items-center">
      <span>{title}</span>
      {hint && (
        <span className="text-[9px] text-text-tertiary font-normal">{hint}</span>
      )}
    </div>
  );
}
