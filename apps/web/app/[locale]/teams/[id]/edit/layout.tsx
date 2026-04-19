import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { locales, type Locale } from '../../../../../i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) return { robots: { index: false, follow: false } };
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('editTeam.title'),
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export default function EditTeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
