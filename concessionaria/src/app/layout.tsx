import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'

import { ScriptTema } from '@/componenti/layout/TemaToggle'
import { AZIENDA } from '@/dati/azienda'
import { BASE } from '@/lib/seo'

/**
 * Impianto comune a tutto il progetto: documento, caratteri e metadati di
 * base. L'intestazione, il piè di pagina e il banner cookie non stanno qui ma
 * nel gruppo `(sito)`, perché il pannello di amministrazione ha una sua
 * struttura e non deve ereditarli.
 *
 * `next/font` scarica i due caratteri in fase di compilazione e li serve dal
 * dominio del sito: nessuna richiesta a Google al caricamento della pagina,
 * nessun cookie di terze parti e nessuno spostamento del testo grazie ai
 * fallback metrici calcolati automaticamente.
 */
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: BASE,
  title: {
    default: `${AZIENDA.nomeCompleto} — Vendita, noleggio e detailing a ${AZIENDA.indirizzo.citta}`,
    template: `%s | ${AZIENDA.nomeCompleto}`,
  },
  description: AZIENDA.descrizione,
  applicationName: AZIENDA.nomeCompleto,
  authors: [{ name: AZIENDA.ragioneSociale }],
  keywords: [
    'concessionaria Tortolì',
    'auto usate Ogliastra',
    'moto usate Sardegna',
    'noleggio auto Tortolì',
    'noleggio moto Ogliastra',
    'car detailing Sardegna',
    'trattamento ceramico auto',
    'finanziamento auto',
    AZIENDA.nomeCompleto,
  ],
  creator: AZIENDA.ragioneSociale,
  publisher: AZIENDA.ragioneSociale,
  formatDetection: { telephone: true, address: true, email: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: AZIENDA.nomeCompleto,
    url: '/',
    images: [{ url: '/immagini/social.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  // Le icone sono rilevate da Next dai file `icon.svg` e `apple-icon.png` in `src/app/`.
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f4' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0705' },
  ],
}

export default function RadiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${sora.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <ScriptTema />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
