import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ServiceWorkerRegister } from '@/components/pwa/sw-register';
import { siteUrl } from '@/lib/site-url';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'RecetApp — Descubrí. Cociná. Compartí.', template: '%s · RecetApp' },
  description: 'Encontrá recetas increíbles, cocinalas y mostrale al mundo cómo te quedaron.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RecetApp',
  },
  openGraph: {
    type: 'website',
    siteName: 'RecetApp',
    title: 'RecetApp — Descubrí. Cociná. Compartí.',
    description: 'Encontrá recetas increíbles, cocinalas y mostrale al mundo cómo te quedaron.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RecetApp',
    description: 'Encontrá recetas increíbles, cocinalas y mostrale al mundo cómo te quedaron.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF7F1' },
    { media: '(prefers-color-scheme: dark)', color: '#151210' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
