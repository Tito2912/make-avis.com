import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { SITE } from '@/lib/site';
import { SiteShell } from '@/components/SiteShell';

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: {
    default: SITE.brandName,
    template: `%s | ${SITE.brandName}`,
  },
  description:
    'Guide Make (ex-Integromat) : automatisations no-code, webhooks, routeurs, Data Stores et modules IA. Cas d’usage + comparatif Zapier/n8n.',
  metadataBase: new URL(SITE.baseUrl),
  icons: {
    icon: [{ url: '/favicon.ico' }],
  },
  openGraph: {
    type: 'website',
    title: SITE.brandName,
    description:
      'Avis Make (ex-Integromat) : automatisation no-code, webhooks, routeurs, Data Stores et modules IA.',
    url: SITE.baseUrl,
    images: [{ url: '/images/capture-make.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.brandName,
    description:
      'Avis Make (ex-Integromat) : automatisation no-code, webhooks, routeurs, Data Stores et modules IA.',
    images: ['/images/capture-make.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

