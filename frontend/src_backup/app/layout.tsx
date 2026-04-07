import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';
import MainShell from '@/components/MainShell';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://koyluoglufresh.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#E8792B',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Köylüoğlu Fresh — Tokat Merkez Online Market',
    template: '%s — Köylüoğlu Fresh',
  },
  description: 'Tokat Merkez\'in online marketi. Taze meyve, sebze, et, şarküteri, bakliyat ve kuruyemiş ürünleri kapınıza gelsin. Köylüoğlu Fresh ile market alışverişi artık çok kolay.',
  keywords: [
    'Köylüoğlu Fresh', 'Tokat market', 'Tokat Merkez online market',
    'taze meyve sebze Tokat', 'online market sipariş', 'Tokat manav',
    'et tavuk balık Tokat', 'şarküteri Tokat', 'market alışverişi',
    'kapıya teslimat Tokat', 'online bakkal', 'Köylüoğlu',
  ],
  authors: [{ name: 'Köylüoğlu Fresh Market' }],
  creator: 'Köylüoğlu Fresh',
  publisher: 'Köylüoğlu Fresh Market',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: 'Köylüoğlu Fresh',
    title: 'Köylüoğlu Fresh — Tokat Merkez Online Market',
    description: 'Tokat Merkez\'in online marketi. Taze meyve, sebze, et, şarküteri ürünleri kapınıza gelsin.',
    images: [{ url: '/logo.png', width: 1080, height: 1080, alt: 'Köylüoğlu Fresh Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Köylüoğlu Fresh — Tokat Merkez Online Market',
    description: 'Tokat Merkez\'in online marketi. Taze ürünler kapınıza gelsin.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: 'shopping',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GroceryStore',
    name: 'Köylüoğlu Fresh Market',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/logo.png`,
    description: 'Tokat Merkez online market — taze meyve, sebze, et, şarküteri kapınıza gelsin.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tokat Merkez',
      addressRegion: 'Tokat',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '40.3167',
      longitude: '36.5500',
    },
    telephone: '0850 XXX XX XX',
    priceRange: '₺',
    currenciesAccepted: 'TRY',
    paymentAccepted: 'Kapıda Ödeme',
    openingHours: 'Mo-Sa 08:00-22:00, Su 09:00-21:00',
    areaServed: {
      '@type': 'City',
      name: 'Tokat Merkez',
    },
  };

  return (
    <html lang="tr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', fontWeight: 500 },
            success: { style: { background: '#F0FDF4', color: '#14532D', border: '1px solid #BBF7D0' }, iconTheme: { primary: '#4CAF50', secondary: '#fff' } },
            error: { style: { background: '#FFF7ED', color: '#8C4013', border: '1px solid #FED7AA' }, iconTheme: { primary: '#E8792B', secondary: '#fff' } },
          }}
        />
        <AuthProvider />
        <MainShell>{children}</MainShell>
      </body>
    </html>
  );
}
