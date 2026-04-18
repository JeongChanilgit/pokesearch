/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, ExpirationPlugin, NetworkOnly, Serwist, StaleWhileRevalidate } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request }) =>
        request.destination === 'image' || request.destination === 'font',
      handler: new CacheFirst({
        cacheName: 'static-assets',
        plugins: [
          new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        ],
      }),
    },
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/api/search') ||
        /^\/api\/pokemons(\/|$)/.test(url.pathname) ||
        /^\/api\/abilities(\/|$)/.test(url.pathname) ||
        /^\/api\/items(\/|$)/.test(url.pathname) ||
        /^\/api\/moves(\/|$)/.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: 'api-read',
        plugins: [
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 5 }),
        ],
      }),
    },
    {
      matcher: ({ url }) =>
        /^\/api\/teams(\/|$)/.test(url.pathname) ||
        /^\/api\/comments(\/|$)/.test(url.pathname) ||
        /^\/api\/likes(\/|$)/.test(url.pathname),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
