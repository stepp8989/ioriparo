import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

import { ScriptTema } from '@/componenti/layout/TemaToggle'
import { RISTORANTE } from '@/dati/ristorante'
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
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: BASE,
  title: {
    default: `${RISTORANTE.nomeCompleto} — ${RISTORANTE.claim} a ${RISTORANTE.indirizzo.citta}`,
    template: `%s | ${RISTORANTE.nomeCompleto}`,
  },
  description: RISTORANTE.descrizione,
  applicationName: RISTORANTE.nomeCompleto,
  authors: [{ name: RISTORANTE.ragioneSociale }],
  keywords: [
    'ristorante Firenze',
    'cucina toscana',
    'prenota tavolo Firenze',
    'ristorante di lusso',
    'bistecca alla fiorentina',
    RISTORANTE.nomeCompleto,
  ],
  creator: RISTORANTE.ragioneSociale,
  publisher: RISTORANTE.ragioneSociale,
  formatDetection: { telephone: true, address: true, email: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: RISTORANTE.nomeCompleto,
    url: '/',
    images: [{ url: '/immagini/ambienti/social.jpg', width: 1200, height: 630 }],
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
    { media: '(prefers-color-scheme: light)', color: '#f7f3ec' },
    { media: '(prefers-color-scheme: dark)', color: '#100e0c' },
  ],
}

export default function RadiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${cormorant.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <ScriptTema />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
