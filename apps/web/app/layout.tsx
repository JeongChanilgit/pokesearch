import type { Metadata, Viewport } from 'next';
import { getSiteUrl } from '../lib/site-url';
import './globals.css';

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PokeSearch',
    template: '%s | PokeSearch',
  },
  description: 'No-login Pokémon team sharing & builder',
  manifest: '/manifest.webmanifest',
  applicationName: 'PokeSearch',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PokeSearch',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icons/192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'PokeSearch',
    images: [
      {
        url: '/icons/512.png',
        width: 512,
        height: 512,
        alt: 'PokeSearch',
      },
    ],
  },
  twitter: {
    card: 'summary',
    images: ['/icons/512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1F1E1D',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
