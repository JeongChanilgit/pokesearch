'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

interface NavItemProps {
  href: string;
  icon: 'i-list' | 'i-plus' | 'i-search';
  label: string;
  active: boolean;
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center text-[10px] min-h-[44px] ${
        active ? 'text-text-primary font-medium' : 'text-text-tertiary'
      }`}
    >
      <svg width={18} height={18} className="block mx-auto mb-0.5">
        <use href={`#${icon}`} />
      </svg>
      {label}
    </Link>
  );
}

export function BottomNav() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('nav');

  const prefix = `/${locale}`;
  const strip = pathname.replace(new RegExp(`^/(en|ko)`), '') || '/';

  const isTeams = strip === '/' || strip.startsWith('/teams') && !strip.startsWith('/teams/new');
  const isCreate = strip.startsWith('/teams/new');
  const isSearch = strip.startsWith('/search');

  return (
    <nav
      className="border-t border-border-tertiary bg-bg-primary pt-1.5 grid grid-cols-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}
    >
      <NavItem href={`${prefix}/`} icon="i-list" label={t('viewTeams')} active={isTeams} />
      <NavItem
        href={`${prefix}/teams/new`}
        icon="i-plus"
        label={t('createTeam')}
        active={isCreate}
      />
      <NavItem href={`${prefix}/search`} icon="i-search" label={t('quickSearch')} active={isSearch} />
    </nav>
  );
}
