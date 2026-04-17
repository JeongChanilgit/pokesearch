import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PokeSearch',
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
