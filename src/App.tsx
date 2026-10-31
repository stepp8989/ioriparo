import { Suspense } from 'react'
import { createBrowserRouter, createHashRouter, Navigate, RouterProvider } from 'react-router-dom'
import { GestionaleProvider } from '@/data/store'

/**
 * Su hosting statico senza riscrittura degli URL (anteprime, GitHub Pages)
 * si compila con `VITE_ROUTER=hash` e la navigazione passa dal fragment.
 */
const creaRouter = import.meta.env.VITE_ROUTER === 'hash' ? createHashRouter : createBrowserRouter

/**
 * Ogni pagina è un modulo separato: la home pubblica non scarica il codice del
 * gestionale (e viceversa), così il primo caricamento resta leggero.
 */
const pagina = (carica: () => Promise<Record<string, unknown>>, esporta: string) => async () => ({
  Component: (await carica())[esporta] as React.ComponentType,
})

/**
 * Con `VITE_SOLO_GESTIONALE=1` il sito pubblico resta fuori: è la build da
 * pubblicare sul dominio di un'altra attività, che deve trovarsi il gestionale
 * e nient'altro. Senza, il suo indirizzo mostrerebbe il sito di Io Riparo.
 *
 * Implica il gestionale: una build senza sito e senza gestionale non
 * servirebbe a nulla, e dimenticare la seconda variabile è facile.
 */
const soloGestionale = import.meta.env.VITE_SOLO_GESTIONALE === '1'

/**
 * Il gestionale entra nella build solo con `VITE_GESTIONALE=1`. Mostra i dati
 * dell'attività, quindi non deve finire per sbaglio in una build del sito: chi
 * lo vuole online lo chiede esplicitamente, e a quel punto `AppLayout` pretende
 * l'accesso con le credenziali dell'archivio online.
 */
const conGestionale =
  (import.meta.env.VITE_GESTIONALE === '1' || soloGestionale) &&
  import.meta.env.VITE_ANTEPRIMA !== '1'

const rotteGestionale = !conGestionale
  ? []
  : [
      {
        path: '/gestionale',
        lazy: pagina(() => import('@/components/layout/AppLayout'), 'AppLayout'),
        children: [
          { index: true, lazy: pagina(() => import('@/pages/Dashboard'), 'Dashboard') },

          { path: 'clienti', lazy: pagina(() => import('@/pages/clienti/ClientiList'), 'ClientiList') },
          { path: 'clienti/:id', lazy: pagina(() => import('@/pages/clienti/DettaglioCliente'), 'DettaglioCliente') },

          { path: 'riparazioni', lazy: pagina(() => import('@/pages/riparazioni/RiparazioniList'), 'RiparazioniList') },
          { path: 'riparazioni/nuova', lazy: pagina(() => import('@/pages/riparazioni/NuovaRiparazione'), 'NuovaRiparazione') },
          { path: 'riparazioni/:id', lazy: pagina(() => import('@/pages/riparazioni/DettaglioRiparazione'), 'DettaglioRiparazione') },
          {
            path: 'riparazioni/:id/modifica',
            lazy: pagina(() => import('@/pages/riparazioni/ModificaRiparazione'), 'ModificaRiparazione'),
          },

          { path: 'richieste', lazy: pagina(() => import('@/pages/Richieste'), 'Richieste') },
          { path: 'preventivi', lazy: pagina(() => import('@/pages/Preventivi'), 'Preventivi') },
          { path: 'fatture', lazy: pagina(() => import('@/pages/Fatture'), 'Fatture') },
          { path: 'magazzino', lazy: pagina(() => import('@/pages/Magazzino'), 'Magazzino') },
          { path: 'ordini', lazy: pagina(() => import('@/pages/OrdiniFornitori'), 'OrdiniFornitori') },
          { path: 'scadenze', lazy: pagina(() => import('@/pages/Scadenze'), 'Scadenze') },
          { path: 'impianti', lazy: pagina(() => import('@/pages/Impianti'), 'Impianti') },
          { path: 'fedelta', lazy: pagina(() => import('@/pages/Fedelta'), 'Fedelta') },
          { path: 'statistiche', lazy: pagina(() => import('@/pages/Statistiche'), 'Statistiche') },
          { path: 'profilo', lazy: pagina(() => import('@/pages/Profilo'), 'Profilo') },
          { path: 'impostazioni', lazy: pagina(() => import('@/pages/Impostazioni'), 'Impostazioni') },
          { path: 'backup', lazy: pagina(() => import('@/pages/Backup'), 'Backup') },

          { path: '*', lazy: pagina(() => import('@/pages/NonTrovata'), 'NonTrovata') },
        ],
      },
    ]

/** Nella build del solo gestionale la radice porta dentro, e basta. */
const rotteSito = soloGestionale
  ? [{ path: '*', element: <Navigate to="/gestionale" replace /> }]
  : [
  /* ─── Sito pubblico ─── */
  {
    // Caricati a richiesta come tutto il resto. Importati in cima al file
    // finivano nella build del solo gestionale anche senza essere usati: i
    // fogli di stile del sito contano come effetto collaterale, quindi il
    // modulo non si puo' scartare, e con lui entravano i dati di Io Riparo.
    path: '/',
    lazy: pagina(() => import('@/sito/SitoLayout'), 'SitoLayout'),
    children: [
      { index: true, lazy: pagina(() => import('@/sito/pagine/Home'), 'Home') },
      { path: 'chi-siamo', lazy: pagina(() => import('@/sito/pagine/ChiSiamo'), 'ChiSiamo') },
      { path: 'servizi', lazy: pagina(() => import('@/sito/pagine/Servizi'), 'Servizi') },
      { path: 'servizi/:id', lazy: pagina(() => import('@/sito/pagine/Servizio'), 'Servizio') },
      { path: 'galleria', lazy: pagina(() => import('@/sito/pagine/GalleriaPagina'), 'GalleriaPagina') },
      { path: 'blog', lazy: pagina(() => import('@/sito/pagine/Blog'), 'Blog') },
      { path: 'blog/:slug', lazy: pagina(() => import('@/sito/pagine/Blog'), 'PaginaArticolo') },
      { path: 'contatti', lazy: pagina(() => import('@/sito/pagine/Contatti'), 'Contatti') },
      { path: 'preventivo', lazy: pagina(() => import('@/sito/pagine/Preventivo'), 'Preventivo') },
      { path: 'prenota', lazy: pagina(() => import('@/sito/pagine/Prenota'), 'Prenota') },
      { path: 'stato-riparazione', lazy: pagina(() => import('@/sito/pagine/StatoRiparazione'), 'StatoRiparazione') },
      { path: 'area-clienti', lazy: pagina(() => import('@/sito/pagine/AreaClienti'), 'AreaClienti') },
      { path: 'tessera', lazy: pagina(() => import('@/sito/pagine/Tessera'), 'Tessera') },
      { path: 'invito/:codice', lazy: pagina(() => import('@/sito/pagine/Tessera'), 'Invito') },
      { path: 'privacy', lazy: pagina(() => import('@/sito/pagine/Legali'), 'Privacy') },
      { path: 'cookie-policy', lazy: pagina(() => import('@/sito/pagine/Legali'), 'CookiePolicy') },
      { path: 'mappa-del-sito', lazy: pagina(() => import('@/sito/pagine/Legali'), 'MappaSito') },
      { path: '*', lazy: pagina(() => import('@/sito/pagine/Legali'), 'NonTrovata') },
    ],
  },
]

const router = creaRouter([...rotteSito, ...rotteGestionale])

export function App() {
  return (
    <GestionaleProvider>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    </GestionaleProvider>
  )
}
