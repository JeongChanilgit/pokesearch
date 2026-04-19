import path from 'path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from '@serwist/next';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  transpilePackages: [
    '@pokesearch/api-client',
    '@pokesearch/calc',
    '@pokesearch/db',
    '@pokesearch/types',
  ],
  serverExternalPackages: ['bcrypt', '@prisma/client'],
  webpack: (config, { isServer, webpack }) => {
    config.resolve = config.resolve || {};
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias || {}),
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    if (isServer) {
      config.externals = config.externals || [];
      (config.externals as unknown[]).push({ bcrypt: 'commonjs bcrypt' });
    }
    // @mapbox/node-pre-gyp (a transitive of bcrypt) pulls in optional deps
    // (mock-aws-s3, aws-sdk, nock) only used in tests. Stub them out.
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(mock-aws-s3|aws-sdk|nock)$/,
      }),
    );
    return config;
  },
};

export default withSerwist(withNextIntl(nextConfig));
