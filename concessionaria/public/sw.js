/**
 * Registratore di servizio.
 *
 * Fa due cose sole, ed è deliberato: tenere in cache le risorse statiche già
 * scaricate e mostrare una pagina decente quando la connessione manca. Una
 * strategia più aggressiva — servire dalla cache anche le pagine — su un sito
 * dove prezzi e disponibilità cambiano ogni giorno farebbe più danni che
 * vantaggi: qualcuno vedrebbe come disponibile un veicolo venduto la settimana
 * prima.
 *
 * Regole applicate:
 *   • navigazioni  → prima la rete; se non risponde, la pagina di cortesia
 *   • immagini, caratteri e file compilati → prima la cache, poi la rete
 *   • tutto il resto (API comprese) → solo rete, mai in cache
 */

const VERSIONE = 'aurora-v1'
const CACHE_STATICA = `${VERSIONE}-statiche`
const PAGINA_OFFLINE = '/offline.html'

/** Risorse indispensabili alla pagina di cortesia, messe da parte all'installazione. */
const ESSENZIALI = [PAGINA_OFFLINE, '/marchio/icona.svg']

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_STATICA)
      .then((cache) => cache.addAll(ESSENZIALI))
      // Se una risorsa non c'è, il registratore si installa lo stesso: meglio
      // una cache incompleta di un service worker che non parte affatto.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chiavi) =>
        Promise.all(
          chiavi.filter((chiave) => !chiave.startsWith(VERSIONE)).map((chiave) => caches.delete(chiave)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

/** Vero per le risorse che possono restare in cache senza diventare bugiarde. */
function daTenere(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/immagini/') ||
    url.pathname.startsWith('/marchio/') ||
    /\.(?:woff2?|png|jpg|jpeg|webp|avif|svg|ico)$/.test(url.pathname)
  )
}

self.addEventListener('fetch', (evento) => {
  const richiesta = evento.request

  // Solo le letture: una prenotazione non deve mai essere servita da una cache.
  if (richiesta.method !== 'GET') return

  const url = new URL(richiesta.url)

  // Domini esterni e rotte API: si va sempre in rete.
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (richiesta.mode === 'navigate') {
    evento.respondWith(
      fetch(richiesta).catch(() =>
        caches.match(PAGINA_OFFLINE).then((risposta) => risposta ?? Response.error()),
      ),
    )
    return
  }

  if (!daTenere(url)) return

  evento.respondWith(
    caches.match(richiesta).then((salvata) => {
      if (salvata) return salvata

      return fetch(richiesta).then((risposta) => {
        // Si tengono solo le risposte complete e valide: una 404 in cache
        // resterebbe una 404 anche dopo aver caricato il file mancante.
        if (risposta.ok && risposta.status === 200) {
          const copia = risposta.clone()
          caches.open(CACHE_STATICA).then((cache) => cache.put(richiesta, copia))
        }
        return risposta
      })
    }),
  )
})
