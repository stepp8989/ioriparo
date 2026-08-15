import { supabase } from '@/lib/supabase'

/**
 * Misure di visita del sito pubblico.
 *
 * Registra una riga per pagina vista: quanto ci si è rimasti, fin dove si è
 * scorso, da dove si arrivava e quali azioni sono state fatte (telefono,
 * WhatsApp, e-mail, moduli). Serve a rispondere alle domande che si fa chi
 * tiene il negozio — quali pagine funzionano, dove la gente se ne va, cosa
 * porta contatti veri — non a seguire le persone.
 *
 * Tre regole che valgono per tutto questo file:
 *
 * 1. **Solo con il consenso statistico.** Senza spunta non parte niente:
 *    nessuna riga, nessun identificativo, nemmeno in memoria.
 * 2. **Niente dati personali.** Nessun indirizzo IP (non lo vediamo e non lo
 *    salviamo), nessun identificativo che sopravviva alla scheda del browser,
 *    nessun parametro dell'indirizzo — lì dentro finiscono nomi e codici.
 *    Della provenienza si tiene solo il nome del sito, mai l'indirizzo intero,
 *    perché quello a volte contiene la ricerca fatta su Google.
 * 3. **Se qualcosa non funziona, il sito non se ne accorge.** Le misure sono
 *    l'ultima cosa che deve poter rompere una pagina: ogni errore viene
 *    ingoiato in silenzio.
 */

/** Azioni che contano davvero per il negozio. */
export type Azione = 'telefono' | 'whatsapp' | 'email' | 'modulo' | 'preventivo' | 'mappa'

interface Pagina {
  pagina: string
  ingresso: boolean
  provenienza: string | null
  campagna: string | null
  inizio: number
  scorrimento: number
  azioni: Set<Azione>
}

const CHIAVE_SESSIONE = 'ioriparo_misure_sessione'

let attive = false
let corrente: Pagina | null = null
let sessione = ''

/**
 * Identificativo della visita: casuale, tenuto in `sessionStorage`, quindi
 * muore chiudendo la scheda. Serve solo a cucire insieme le pagine di una
 * stessa visita — chi torna domani è una visita nuova, e va bene così.
 */
function sessioneCorrente(): string {
  try {
    const salvata = sessionStorage.getItem(CHIAVE_SESSIONE)
    if (salvata) return salvata
    const nuova = Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-6)
    sessionStorage.setItem(CHIAVE_SESSIONE, nuova)
    return nuova
  } catch {
    // Navigazione privata con le memorie bloccate: la visita non si cuce,
    // ma le singole pagine si contano lo stesso.
    return Math.random().toString(36).slice(2, 12)
  }
}

/** Solo il nome del sito da cui si arriva. Da dentro casa non conta. */
function provenienzaDi(): string | null {
  try {
    const rif = document.referrer
    if (!rif) return null
    const host = new URL(rif).hostname.replace(/^www\./, '')
    return host === location.hostname.replace(/^www\./, '') ? null : host.slice(0, 60)
  } catch {
    return null
  }
}

/** Etichetta della campagna, se il link era marcato. */
function campagnaDi(): string | null {
  try {
    const p = new URLSearchParams(location.search)
    const valore = p.get('utm_source') ?? p.get('utm_campaign')
    return valore ? valore.slice(0, 40) : null
  } catch {
    return null
  }
}

/**
 * Dispositivo, sistema e browser, letti dalla stringa che il browser dichiara.
 * È una lettura grossolana e va bene così: serve a distinguere telefono da
 * computer, non a riconoscere il modello.
 */
function ambiente() {
  const ua = navigator.userAgent
  const tablet = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)
  const telefono = /Mobi|iPhone|Android.*Mobile|Windows Phone/i.test(ua)

  const sistema =
    /iPhone|iPad|iPod/i.test(ua) ? 'iOS'
    : /Android/i.test(ua) ? 'Android'
    : /Mac OS X/i.test(ua) ? 'macOS'
    : /Windows/i.test(ua) ? 'Windows'
    : /Linux/i.test(ua) ? 'Linux'
    : null

  // L'ordine conta: Edge e Opera dichiarano anche "Chrome", Chrome dichiara
  // anche "Safari". Il primo che corrisponde vince.
  const browser =
    /Edg\//i.test(ua) ? 'Edge'
    : /OPR\/|Opera/i.test(ua) ? 'Opera'
    : /SamsungBrowser/i.test(ua) ? 'Samsung Internet'
    : /Firefox\//i.test(ua) ? 'Firefox'
    : /Chrome\//i.test(ua) ? 'Chrome'
    : /Safari\//i.test(ua) ? 'Safari'
    : null

  return {
    dispositivo: tablet ? 'tablet' : telefono ? 'smartphone' : 'computer',
    sistema,
    browser,
  }
}

/** Percentuale di pagina scorsa in questo momento. */
function scorrimentoOra(): number {
  const doc = document.documentElement
  const scorribile = doc.scrollHeight - doc.clientHeight
  if (scorribile <= 0) return 100
  return Math.min(100, Math.round(((window.scrollY + doc.clientHeight) / doc.scrollHeight) * 100))
}

function aggiornaScorrimento() {
  if (corrente) corrente.scorrimento = Math.max(corrente.scorrimento, scorrimentoOra())
}

/**
 * Deposita la pagina appena lasciata.
 *
 * Si usa `sendBeacon` quando c'è: è l'unico modo perché la riga parta davvero
 * mentre la scheda si chiude — una normale richiesta verrebbe annullata.
 */
function deposita(p: Pagina) {
  const secondi = Math.min(7200, Math.round((Date.now() - p.inizio) / 1000))
  // Sotto il secondo non è una visita: è un rimbalzo tecnico, uno che ha
  // sbagliato pagina o il ritorno indietro premuto subito.
  if (secondi < 1 && p.azioni.size === 0) return

  const riga = {
    sessione,
    pagina: p.pagina.slice(0, 120),
    ingresso: p.ingresso,
    provenienza: p.provenienza,
    campagna: p.campagna,
    ...ambiente(),
    secondi,
    scorrimento: p.scorrimento,
    azioni: [...p.azioni],
  }

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const chiave = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (url && chiave && typeof navigator.sendBeacon === 'function') {
    const radice = url.trim().replace(/\/+$/, '').replace(/\/(rest|auth)\/v\d+$/, '')
    // La chiave sta nell'indirizzo perche' `sendBeacon` non permette
    // intestazioni: e' la chiave pubblica, quella che gia' viaggia in chiaro
    // in ogni richiesta del sito.
    const inviato = navigator.sendBeacon(
      `${radice}/rest/v1/visite?apikey=${encodeURIComponent(chiave.trim())}`,
      new Blob([JSON.stringify(riga)], { type: 'application/json' }),
    )
    if (inviato) return
  }

  // Ripiego: la scheda è ancora viva (cambio pagina interno, non chiusura).
  void supabase?.from('visite').insert(riga)
}

/** Chiude la pagina in corso e ne apre una nuova. */
export function cambiaPagina(percorso: string) {
  if (!attive) return
  const pulito = percorso.split('?')[0].split('#')[0] || '/'

  // Stessa pagina: non è una vista nuova. Senza questo controllo la prima
  // pagina veniva aperta due volte — una dall'accensione delle misure e una
  // dal primo passaggio del router — e la seconda perdeva sia il segno di
  // ingresso sia la provenienza.
  if (corrente?.pagina === pulito) return

  aggiornaScorrimento()
  if (corrente) deposita(corrente)

  corrente = {
    // Solo il percorso: nei parametri finiscono codici pratica e nomi.
    pagina: pulito,
    ingresso: corrente === null,
    provenienza: corrente === null ? provenienzaDi() : null,
    campagna: corrente === null ? campagnaDi() : null,
    inizio: Date.now(),
    scorrimento: scorrimentoOra(),
    azioni: new Set(),
  }
}

/** Segna un'azione sulla pagina in corso. */
export function segnaAzione(azione: Azione) {
  if (attive && corrente) corrente.azioni.add(azione)
}

/** Riconosce le azioni che contano guardando dove si è cliccato. */
function daClic(evento: MouseEvent) {
  const elemento = (evento.target as Element | null)?.closest('a,button')
  if (!elemento) return

  const href = elemento.getAttribute('href') ?? ''
  if (href.startsWith('tel:')) return segnaAzione('telefono')
  if (/wa\.me|whatsapp/i.test(href)) return segnaAzione('whatsapp')
  if (href.startsWith('mailto:')) return segnaAzione('email')
  if (/google\.[a-z.]+\/maps|maps\.app/i.test(href)) return segnaAzione('mappa')
  if (href.includes('/preventivo')) return segnaAzione('preventivo')
}

function daNascondimento() {
  if (document.visibilityState === 'hidden' && corrente) {
    aggiornaScorrimento()
    deposita(corrente)
    // Il tempo riparte da adesso: se torna, non si conta due volte l'attesa.
    corrente.inizio = Date.now()
    corrente.azioni.clear()
    corrente.ingresso = false
  }
}

/**
 * Accende o spegne le misure secondo il consenso.
 *
 * Togliendo la spunta si smette all'istante e si dimentica anche la sessione:
 * chi cambia idea non deve restare cucito a quello che ha fatto prima.
 */
export function impostaMisure(consenso: string) {
  const permesse = consenso === 'tutti' || consenso.includes('statistici')

  if (permesse && !attive) {
    attive = true
    sessione = sessioneCorrente()
    window.addEventListener('scroll', aggiornaScorrimento, { passive: true })
    document.addEventListener('click', daClic, true)
    document.addEventListener('visibilitychange', daNascondimento)
    cambiaPagina(location.pathname)
    return
  }

  if (!permesse) {
    if (attive) {
      attive = false
      corrente = null
      sessione = ''
      window.removeEventListener('scroll', aggiornaScorrimento)
      document.removeEventListener('click', daClic, true)
      document.removeEventListener('visibilitychange', daNascondimento)
    }
    // Fuori dal controllo su `attive`: chi ritira il consenso e poi ricarica
    // arriva qui con le misure già spente, e l'identificativo della visita
    // precedente resterebbe in memoria fino alla chiusura della scheda.
    try {
      sessionStorage.removeItem(CHIAVE_SESSIONE)
    } catch {
      /* memorie bloccate: non c'era niente da togliere */
    }
  }
}
