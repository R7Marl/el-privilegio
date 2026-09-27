import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const description = 'Organización integral de eventos sociales, casamientos, quince años y celebraciones. Cotiza servicios, catering y ambientación online.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'El Privilegio | Organización de eventos', template: '%s | El Privilegio' },
  description,
  keywords: ['organización de eventos', 'eventos sociales', 'casamientos', 'quince años', 'catering para eventos', 'salón de eventos', 'ambientación de eventos'],
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'es_AR', url: '/', siteName: 'El Privilegio', title: 'El Privilegio | Organización de eventos', description, images: [{ url: '/gallery/evento-exterior.jpeg', alt: 'Evento organizado por El Privilegio' }] },
  twitter: { card: 'summary_large_image', title: 'El Privilegio | Organización de eventos', description, images: ['/gallery/evento-exterior.jpeg'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = { '@context': 'https://schema.org', '@type': 'EventPlanningService', name: 'El Privilegio', description, url: siteUrl, telephone: '+5491131872510', image: `${siteUrl}/gallery/evento-exterior.jpeg`, areaServed: 'Argentina', sameAs: [] };
  return <html lang="es-AR"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
}
