import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { locales, type Locale } from '../../../../i18n';
import { localeAlternates } from '../../../../lib/site-url';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });
  const alternates = localeAlternates(locale, '/teams/new');
  return {
    title: t('newTeam.title'),
    description: t('newTeam.description'),
    alternates,
    openGraph: {
      title: t('newTeam.title'),
      description: t('newTeam.description'),
      url: alternates.canonical,
      type: 'website',
    },
    twitter: {
      title: t('newTeam.title'),
      description: t('newTeam.description'),
    },
  };
}

export default function NewTeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
