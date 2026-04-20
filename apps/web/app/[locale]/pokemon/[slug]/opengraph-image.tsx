import { ImageResponse } from 'next/og';
import { findPokemonByShowdownId } from '../../../../lib/search-core';
import { locales, type Locale } from '../../../../i18n';
import { getSiteUrl } from '../../../../lib/site-url';

export const alt = 'Pokémon details on PokeSearch';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = (locales as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : 'en';

  const row = await findPokemonByShowdownId(slug);
  const name = row
    ? (locale === 'ko' ? row.name_ko : row.name_en)
    : 'PokeSearch';
  const types = row?.types ?? [];
  const spriteUrl = `${getSiteUrl()}/sprites/pokemon/${slug}.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1F1E1D',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <img
          src={spriteUrl}
          alt=""
          width={360}
          height={360}
          style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
        />
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 24 }}>
          {name}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
          {types.map((t) => (
            <div
              key={t}
              style={{
                fontSize: 32,
                padding: '8px 24px',
                borderRadius: 999,
                background: '#ffffff22',
                color: '#ffffff',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 28,
            marginTop: 36,
            color: '#a0a0a0',
            letterSpacing: 2,
          }}
        >
          PokeSearch
        </div>
      </div>
    ),
    size,
  );
}
