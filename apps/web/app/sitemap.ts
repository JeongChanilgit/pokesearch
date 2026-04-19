import type { MetadataRoute } from 'next';
import { prisma } from '@pokesearch/db';
import { locales } from '../i18n';
import { getSiteUrl } from '../lib/site-url';

export const revalidate = 3600;

type StaticRoute = {
  path: '' | '/search' | '/teams/new';
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

const STATIC_ROUTES: StaticRoute[] = [
  { path: '', changeFrequency: 'hourly', priority: 1.0 },
  { path: '/search', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/teams/new', changeFrequency: 'monthly', priority: 0.6 },
];

function localizedUrls(base: string, path: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${base}/${l}${path}`;
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [];
  for (const route of STATIC_ROUTES) {
    for (const loc of locales) {
      staticEntries.push({
        url: `${base}/${loc}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages: localizedUrls(base, route.path) },
      });
    }
  }

  const teams = await prisma.team
    .findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 10_000,
    })
    .catch(() => [] as { id: string; updatedAt: Date }[]);

  const teamEntries: MetadataRoute.Sitemap = [];
  for (const team of teams) {
    for (const loc of locales) {
      teamEntries.push({
        url: `${base}/${loc}/teams/${team.id}`,
        lastModified: team.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: localizedUrls(base, `/teams/${team.id}`),
        },
      });
    }
  }

  return [...staticEntries, ...teamEntries];
}
