import type { Metadata, Viewport } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'

import { ScriptTema } from '@/componenti/layout/TemaToggle'
import { MARCHIO } from '@/dati/marchio'
import { leggi } from '@/lib/archivio'
import { BASE } from '@/lib/seo'

/**
 * Impianto comune a tutto il progetto: documento, caratteri e metadati di
 * base. L'intestazione, il piè di pagina e gli avvisi non stanno qui ma nel
 * gruppo `(sito)`, perché il pannello di amministrazione ha una sua struttura
 * e non deve ereditarli.
 *
 * `next/font` scarica i due caratteri in fase di compilazione e li serve dal
 * dominio del sito: nessuna richiesta a Google al caricamento della pagina,
 * nessun cookie di terze parti e nessuno spostamento del testo grazie ai
 * fallback metrici calcolati automaticamente.
 */
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

/**
 * I metadati leggono il nome del marchio dall'archivio, non dalle costanti:
 * chi rinomina la rete dal pannello si aspetta che cambi anche il titolo nella
 * scheda del browser, ed è una di quelle cose che, se non funzionano, fanno
 * sembrare finto tutto il resto.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await leggi()
  const { marchio } = impostazioni

  return {
    metadataBase: BASE,
    title: {
      default: `${marchio.nome} — ${marchio.claim}`,
      template: `%s | ${marchio.nome}`,
    },
    description: marchio.descrizione,
    applicationName: marchio.nome,
    keywords: [
      'biglietti cinema',
      'orari cinema',
      'programmazione cinematografica',
      'film in sala',
      'prenotazione posti cinema',
      'abbonamento cinema',
      marchio.nome,
    ],
    creator: marchio.nome,
    publisher: marchio.nome,
    formatDetection: { telephone: true, address: true, email: true },
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      siteName: marchio.nome,
      url: '/',
    },
    twitter: { card: 'summary_large_image' },
    // Le icone sono rilevate da Next dal file `icon.svg` in `src/app/`.
    manifest: '/manifest.webmanifest',
    robots: { index: true, follow: true },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#07060c' },
    { media: '(prefers-color-scheme: light)', color: '#f7f5fb' },
  ],
}

export default function RadiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <ScriptTema />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}

/** Usato dal titolo di ripiego se l'archivio non fosse leggibile. */
export const NOME_RIPIEGO = MARCHIO.nome
