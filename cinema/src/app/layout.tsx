import type { Metadata, Viewport } from 'next'
import { Archivo, Barlow_Condensed, Inter } from 'next/font/google'
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
/*
 * Tre caratteri, ciascuno con un compito.
 *
 * Archivo per i titoli: è una grottesca stretta e robusta, pensata per i pesi
 * alti — quello che serve a un titolo di sezione che deve reggere accanto a una
 * fila di locandine senza sparire.
 *
 * Inter per il testo corrente, dove la leggibilità viene prima del carattere.
 *
 * Barlow Condensed per i numeri che stanno in poco spazio: orari, prezzi,
 * numeri di posto. Un orario in una griglia fitta sta stretto in una grottesca
 * normale, e rimpicciolirlo lo renderebbe illeggibile: un condensato risolve
 * il problema allargando invece di ridurre.
 */
const archivio = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-archivio',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const stretto = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-stretto',
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
  // Un colore solo, senza distinzione per `prefers-color-scheme`: il tema
  // predefinito è scuro a prescindere dall'impostazione del sistema, e
  // dichiarare il chiaro qui farebbe colorare la barra del browser in modo
  // diverso dalla pagina.
  themeColor: '#0a0a0c',
}

export default function RadiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      className={`${archivio.variable} ${inter.variable} ${stretto.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ScriptTema />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}

/** Usato dal titolo di ripiego se l'archivio non fosse leggibile. */
export const NOME_RIPIEGO = MARCHIO.nome
