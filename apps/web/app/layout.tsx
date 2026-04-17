import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PokeSearch',
  description: 'No-login Pokémon team sharing & builder',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PokeSearch',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
