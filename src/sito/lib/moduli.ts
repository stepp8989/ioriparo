import { depositaRichiesta } from '@/lib/supabase'
import { AZIENDA } from '../dati/azienda'
import { invitoRicordato } from './fedelta'

/**
 * Invio dei moduli del sito: Contatti, Preventivo, Prenotazione e Newsletter.
 *
 * Il sito è statico: non c'è un backend e nessuna richiesta viene salvata nel
 * browser. Le richieste partono in JSON verso **Formspree**, che le recapita a
 * `AZIENDA.email`; la conferma di successo compare solo dopo una risposta
 * positiva del servizio, mai prima.
 *
 * Se l'endpoint viene svuotato (`VITE_MODULI_ENDPOINT=" "`) resta il ripiego sul
 * programma di posta del visitatore, con destinatario, oggetto e testo già
 * compilati: utile in sviluppo, non è la modalità di produzione.
 *
 * Per usare un servizio diverso (Web3Forms, Getform, Basin) basta cambiare
 * `VITE_MODULI_ENDPOINT`, più `VITE_MODULI_CHIAVE` dove serve una chiave.
 */

/**
 * Modulo Formspree di Io Riparo, che recapita a `AZIENDA.email`.
 *
 * Non è un segreto: l'indirizzo di un modulo Formspree finisce nel codice di
 * ogni sito che lo usa. Sta qui, e non solo in `.env`, perché il sito funzioni
 * da qualunque hosting senza dover configurare variabili d'ambiente; per le
 * prove si può comunque scavalcare con `VITE_MODULI_ENDPOINT`.
 */
const FORMSPREE = 'https://formspree.io/f/mpqvknlr'

const ENDPOINT = (import.meta.env.VITE_MODULI_ENDPOINT as string | undefined)?.trim() || FORMSPREE
const CHIAVE = (import.meta.env.VITE_MODULI_CHIAVE as string | undefined)?.trim()

/** Vero quando il servizio di invio è configurato. */
export const invioAttivo = Boolean(ENDPOINT)

export type Modulo = 'contatti' | 'preventivo' | 'appuntamento' | 'newsletter'

export interface DatiModulo {
  /** Etichetta → valore, nell'ordine in cui compaiono nell'e-mail */
  campi: Record<string, string>
  /** Indirizzo a cui rispondere: facoltativo, alcuni moduli chiedono solo il telefono */
  email?: string
  nome?: string
}

export type Esito =
  | { ok: true; via: 'servizio' | 'posta' }
  | { ok: false; errore: string }

/**
 * Messaggi d'errore per i casi che Formspree segnala davvero. Sono pensati per
 * il visitatore: dicono cosa è successo e come farsi sentire lo stesso.
 */
const ERRORI: Record<string, string> = {
  validazione: 'Alcuni dati non sono stati accettati. Controlla l’indirizzo e-mail e riprova.',
  limite: 'Abbiamo ricevuto troppe richieste in poco tempo. Riprova fra qualche minuto oppure chiamaci.',
  bloccato: 'Il modulo non è al momento disponibile. Scrivici su WhatsApp o chiamaci: ti rispondiamo subito.',
  rete: 'Invio non riuscito: controlla la connessione e riprova. Se il problema resta, chiamaci o scrivici su WhatsApp.',
  servizio: 'Il servizio di invio non ha risposto. Riprova fra poco oppure contattaci per telefono o WhatsApp.',
}

/** Traduce la risposta di Formspree in un motivo comprensibile. */
async function motivoErrore(risposta: Response): Promise<string> {
  if (risposta.status === 429) return ERRORI.limite
  if (risposta.status === 403 || risposta.status === 404) return ERRORI.bloccato
  if (risposta.status === 400 || risposta.status === 422) {
    // Formspree elenca i campi rifiutati in `errors`
    const corpo = (await risposta.json().catch(() => null)) as { errors?: { message?: string }[] } | null
    const dettaglio = corpo?.errors?.map((e) => e.message).filter(Boolean).join('; ')
    return dettaglio ? `${ERRORI.validazione} (${dettaglio})` : ERRORI.validazione
  }
  return ERRORI.servizio
}

const OGGETTI: Record<Modulo, string> = {
  contatti: 'Nuovo messaggio dal sito',
  preventivo: 'Nuova richiesta di preventivo dal sito',
  appuntamento: 'Nuova richiesta di appuntamento dal sito',
  newsletter: 'Nuova iscrizione alla newsletter',
}

const corpoTestuale = (dati: DatiModulo) =>
  Object.entries(dati.campi)
    .filter(([, v]) => v)
    .map(([etichetta, valore]) => `${etichetta}: ${valore}`)
    .join('\n')

/**
 * Indirizzo di risposta valido, se il visitatore lo ha lasciato: un valore
 * inventato come "non indicata" farebbe scartare la richiesta dal servizio.
 */
const rispostaA = (dati: DatiModulo) => {
  const email = dati.email?.trim()
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : undefined
}

/** Oggetto dell'e-mail: chi ha scritto, riconoscibile già dall'elenco messaggi. */
const oggettoDi = (modulo: Modulo, dati: DatiModulo) =>
  `${OGGETTI[modulo]} — ${dati.nome ?? rispostaA(dati) ?? AZIENDA.nome}`

/**
 * Recapito del telefono fra i campi del modulo, per la scheda che finisce nel
 * gestionale. Le chiavi sono le etichette mostrate al visitatore, quindi si
 * cerca per parola e non per nome esatto.
 */
const telefonoDi = (dati: DatiModulo) =>
  Object.entries(dati.campi).find(([etichetta]) => /telefono|cellulare/i.test(etichetta))?.[1]?.trim()

/**
 * Fa arrivare la richiesta anche nel gestionale, sotto «Richieste dal sito».
 *
 * È un canale in più rispetto all'e-mail, non un suo sostituto: se l'archivio
 * online non è configurato la funzione non fa nulla, e un suo errore non tocca
 * in alcun modo l'esito mostrato al visitatore.
 */
function annotaNelGestionale(modulo: Modulo, dati: DatiModulo) {
  void depositaRichiesta(modulo, {
    nome: dati.nome,
    telefono: telefonoDi(dati),
    email: rispostaA(dati),
    campi: dati.campi,
  }).catch(() => false)
}

/** Apre il client di posta con il messaggio già pronto. */
function apriPosta(modulo: Modulo, dati: DatiModulo): Esito {
  const oggetto = encodeURIComponent(oggettoDi(modulo, dati))
  const corpo = encodeURIComponent(`${corpoTestuale(dati)}\n\n—\nInviato dal sito ${AZIENDA.nome}`)
  window.location.href = `mailto:${AZIENDA.email}?subject=${oggetto}&body=${corpo}`
  return { ok: true, via: 'posta' }
}

/**
 * Recapita il modulo. Non solleva eccezioni.
 *
 * Con il servizio configurato la conferma di successo arriva **solo** dopo una
 * risposta positiva del servizio: se l'invio fallisce il visitatore vede il
 * motivo e i recapiti alternativi, non un falso "inviato".
 *
 * Senza servizio configurato resta il ripiego sul programma di posta, che tiene
 * il sito utilizzabile ma richiede al visitatore di premere "Invia".
 */
export async function inviaModulo(modulo: Modulo, dati: DatiModulo): Promise<Esito> {
  // Chi è arrivato con il link di un amico porta con sé il codice invito: il
  // laboratorio lo trova nella richiesta e applica lo sconto di benvenuto.
  const invito = invitoRicordato()
  if (invito && (modulo === 'preventivo' || modulo === 'appuntamento')) {
    dati = { ...dati, campi: { ...dati.campi, 'Codice invito': invito } }
  }

  annotaNelGestionale(modulo, dati)

  if (!ENDPOINT) return apriPosta(modulo, dati)

  const risposta = rispostaA(dati)
  const corpo: Record<string, unknown> = {
    ...dati.campi,
    // Formspree usa `email` per impostare il "Rispondi a" del messaggio
    ...(risposta ? { email: risposta, _replyto: risposta } : {}),
    _subject: oggettoDi(modulo, dati),
    modulo,
    origine: window.location.href,
  }
  if (CHIAVE) corpo.access_key = CHIAVE

  let esito: Response
  try {
    esito = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(corpo),
    })
  } catch {
    return { ok: false, errore: ERRORI.rete } // connessione assente o richiesta bloccata
  }

  if (!esito.ok) return { ok: false, errore: await motivoErrore(esito) }
  return { ok: true, via: 'servizio' }
}

/**
 * Filtro anti-spam senza CAPTCHA: un campo invisibile che solo i robot
 * compilano e un tempo minimo di compilazione.
 */
export function sospetto(esca: string, apertoIl: number): boolean {
  return esca.trim().length > 0 || Date.now() - apertoIl < 2500
}

/** Campo esca da inserire in ogni modulo: invisibile e non raggiungibile da tastiera. */
export const propsEsca = {
  type: 'text' as const,
  name: 'indirizzo-secondario',
  tabIndex: -1,
  autoComplete: 'off',
  'aria-hidden': true,
  style: {
    position: 'absolute' as const,
    left: '-9999px',
    width: '1px',
    height: '1px',
    opacity: 0,
    pointerEvents: 'none' as const,
  },
}
