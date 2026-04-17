import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@pokesearch/api-client',
    '@pokesearch/calc',
    '@pokesearch/db',
    '@pokesearch/types',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
    ],
  },
};

export default withNextIntl(nextConfig);
