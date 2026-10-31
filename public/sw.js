/*
 * Service worker di Io Riparo: è quello che rende il sito un'app installabile
 * e la fa aprire anche senza rete.
 *
 * - Pagine: prima la rete, così si vede sempre la versione pubblicata; senza
 *   rete, l'ultima copia salvata del guscio dell'app.
 * - File in /assets/: hanno l'impronta nel nome e non cambiano mai, quindi
 *   si servono dalla copia salvata.
 * - Marchio, foto e icone: la copia salvata subito, aggiornata in background.
 *
 * Nessuna richiesta verso altri domini passa da qui: archivio online, invio
 * moduli e misure vanno sempre in rete, mai serviti da una copia vecchia.
 */

const VERSIONE = 'v1'
const GUSCIO = `ioriparo-guscio-${VERSIONE}`
const FILE = `ioriparo-file-${VERSIONE}`
/** Oltre questo numero di file salvati, si tolgono i più vecchi. */
const MASSIMO_FILE = 80

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(GUSCIO)
      .then((c) => c.addAll(['/', '/site.webmanifest', '/marchio/icona-192.png']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomi) =>
        Promise.all(
          nomi
            .filter((n) => n.startsWith('ioriparo-') && n !== GUSCIO && n !== FILE)
            .map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

async function riduci() {
  const cache = await caches.open(FILE)
  const chiavi = await cache.keys()
  for (const chiave of chiavi.slice(0, Math.max(0, chiavi.length - MASSIMO_FILE))) {
    await cache.delete(chiave)
  }
}

async function pagina(richiesta) {
  try {
    const risposta = await fetch(richiesta)
    // Ogni indirizzo del sito restituisce lo stesso guscio: basta tenerne uno.
    if (risposta.ok) {
      const copia = risposta.clone()
      void caches.open(GUSCIO).then((c) => c.put('/', copia))
    }
    return risposta
  } catch {
    const salvata = await caches.match('/', { cacheName: GUSCIO })
    return salvata ?? Response.error()
  }
}

async function primaCopia(richiesta) {
  const salvata = await caches.match(richiesta)
  if (salvata) return salvata
  const risposta = await fetch(richiesta)
  if (risposta.ok) {
    const copia = risposta.clone()
    void caches
      .open(FILE)
      .then((c) => c.put(richiesta, copia))
      .then(riduci)
  }
  return risposta
}

async function copiaPoiRete(richiesta) {
  const salvata = await caches.match(richiesta)
  const dallaRete = fetch(richiesta)
    .then((risposta) => {
      if (risposta.ok) {
        const copia = risposta.clone()
        void caches
          .open(FILE)
          .then((c) => c.put(richiesta, copia))
          .then(riduci)
      }
      return risposta
    })
    .catch(() => salvata ?? Response.error())
  return salvata ?? dallaRete
}

self.addEventListener('fetch', (evento) => {
  const richiesta = evento.request
  if (richiesta.method !== 'GET') return
  const url = new URL(richiesta.url)
  if (url.origin !== self.location.origin) return

  if (richiesta.mode === 'navigate') {
    evento.respondWith(pagina(richiesta))
    return
  }
  if (url.pathname.startsWith('/assets/')) {
    evento.respondWith(primaCopia(richiesta))
    return
  }
  // Sitemap, robots e il service worker stesso vanno sempre letti freschi.
  if (/\.(png|jpe?g|webp|avif|svg|ico|webmanifest|woff2?)$/.test(url.pathname)) {
    evento.respondWith(copiaPoiRete(richiesta))
  }
})
