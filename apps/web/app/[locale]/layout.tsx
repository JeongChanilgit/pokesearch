import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales, type Locale } from '../../i18n';
import { IconDefs } from '../../components/IconDefs';
import { BottomNav } from '../../components/BottomNav';
import { LocaleToggle } from '../../components/LocaleToggle';
import { QueryProvider } from '../../components/QueryProvider';
import { InstallPrompt } from '../../components/InstallPrompt';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-bg-tertiary">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <IconDefs />
            <div className="mx-auto max-w-[480px] min-h-screen bg-bg-primary flex flex-col">
              <InstallPrompt />
              <header className="flex items-center justify-between px-4 py-2 border-b border-border-tertiary">
                <span className="text-[14px] font-medium">PokeSearch</span>
                <LocaleToggle />
              </header>
              <main className="flex-1 p-3">{children}</main>
              <BottomNav />
            </div>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
