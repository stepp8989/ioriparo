import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Sora } from 'next/font/google'
import './globals.css'

import { AGENZIA } from '@/dati/agenzia'
import { BASE } from '@/lib/seo'
import { Testata } from '@/componenti/layout/Testata'
import { PiePagina } from '@/componenti/layout/PiePagina'
import { CampoParticelle } from '@/componenti/effetti/CampoParticelle'
import { Cursore } from '@/componenti/effetti/Cursore'
import { Caricamento } from '@/componenti/effetti/Caricamento'

/**
 * Impianto comune: documento, caratteri, metadati, cornice.
 *
 * `next/font` scarica i caratteri in fase di compilazione e li serve dal
 * dominio del sito: nessuna richiesta a Google al caricamento, nessun cookie di
 * terze parti, e nessuno spostamento del testo grazie ai fallback metrici
 * calcolati automaticamente. Sono tre famiglie e non una perché ognuna ha un
 * mestiere — Sora per i titoli, Inter per la lettura, JetBrains Mono per i
 * pezzi che devono somigliare a codice.
 *
 * Il campo particellare, il cursore e la schermata d'apertura stanno qui e non
 * nella pagina: sono la cornice, e restano gli stessi ovunque si navighi.
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

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-spazio',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: BASE,
  title: {
    default: `${AGENZIA.nomeCompleto} — Siti web professionali per aziende e attività`,
    template: `%s | ${AGENZIA.nomeCompleto}`,
  },
  description: AGENZIA.descrizione,
  applicationName: AGENZIA.nomeCompleto,
  authors: [{ name: AGENZIA.ragioneSociale }],
  keywords: [
    'realizzazione siti web',
    'siti web professionali',
    'web designer',
    'sito web aziendale',
    'e-commerce su misura',
    'realizzazione e-commerce',
    'restyling sito web',
    'web agency',
    'siti web per negozi',
    'siti web per ristoranti',
    AGENZIA.nomeCompleto,
  ],
  creator: AGENZIA.ragioneSociale,
  publisher: AGENZIA.ragioneSociale,
  formatDetection: { telephone: true, address: false, email: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: AGENZIA.nomeCompleto,
    url: '/',
    title: `${AGENZIA.nomeCompleto} — Siti web professionali su misura`,
    description: AGENZIA.descrizione,
    // L'immagine per i social è generata da `opengraph-image.tsx`: Next la
    // rileva dal nome del file e la dichiara da sé.
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Il sito è a tema scuro fisso: una sola dichiarazione, nessuna alternativa.
  themeColor: '#04060d',
  colorScheme: 'dark',
}

export default function RadiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${sora.variable} ${inter.variable} ${mono.variable}`}>
      <body className="min-h-svh antialiased">
        <CampoParticelle />
        <Caricamento />
        <Cursore />

        <Testata />
        <main id="contenuto">{children}</main>
        <PiePagina />
      </body>
    </html>
  )
}
