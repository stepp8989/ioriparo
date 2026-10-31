import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Collegamento all'archivio online.
 *
 * Le due variabili sono pubbliche per natura: l'indirizzo del progetto e la
 * chiave "anon" finiscono nel codice di qualunque sito che usi Supabase. Non
 * sono un segreto perché da sole non danno accesso a nulla — i permessi sono
 * decisi dalle regole del database (`supabase/schema.sql`), che aprono le
 * tabelle al solo personale autenticato.
 *
 * La chiave `service_role`, invece, è un segreto e non deve MAI comparire qui.
 *
 * Finché le variabili non sono impostate `supabase` resta `null` e il
 * gestionale continua a lavorare sull'archivio locale del browser: il sito
 * pubblico funziona lo stesso e nulla si rompe durante il passaggio.
 */
/**
 * Riporta l'indirizzo alla radice del progetto.
 *
 * Nel pannello Supabase l'indirizzo più visibile è quello dell'API REST
 * (`…supabase.co/rest/v1/`), ed è naturale copiare quello. Al client serve
 * invece la radice: i pezzi successivi li aggiunge da solo, e con la coda già
 * presente costruirebbe indirizzi doppi che non rispondono. Togliamola qui,
 * invece di lasciare che il collegamento fallisca in silenzio.
 */
function radiceProgetto(valore: string | undefined): string | undefined {
  const pulito = valore?.trim().replace(/\/+$/, '')
  return pulito ? pulito.replace(/\/(rest|auth|storage|realtime)\/v\d+$/, '') : undefined
}

const URL_PROGETTO = radiceProgetto(import.meta.env.VITE_SUPABASE_URL as string | undefined)
const CHIAVE_ANON = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

export const archivioOnline = Boolean(URL_PROGETTO && CHIAVE_ANON)

export const supabase: SupabaseClient | null = archivioOnline
  ? createClient(URL_PROGETTO!, CHIAVE_ANON!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

/** Stato di una riparazione visibile al cliente: nessun dato personale. */
export interface StatoPubblico {
  codice: string
  dispositivo: string
  tipo_dispositivo: string
  stato: string
  data_accettazione: string | null
  data_prevista: string | null
  data_consegna: string | null
}

export type EsitoRicerca =
  | { trovata: true; pratica: StatoPubblico }
  | { trovata: false; motivo: 'inesistente' | 'non-collegato' | 'errore' }

/**
 * Cerca una pratica per codice.
 *
 * Passa dalla funzione `stato_riparazione` del database, l'unico punto in cui
 * il pubblico può leggere: le tabelle restano chiuse.
 */
export async function cercaPratica(codice: string): Promise<EsitoRicerca> {
  if (!supabase) return { trovata: false, motivo: 'non-collegato' }

  const { data, error } = await supabase.rpc('stato_riparazione', {
    codice_cercato: codice.trim(),
  })

  if (error) return { trovata: false, motivo: 'errore' }
  const pratica = (data as StatoPubblico[] | null)?.[0]
  return pratica ? { trovata: true, pratica } : { trovata: false, motivo: 'inesistente' }
}

/**
 * Deposita nel gestionale una richiesta arrivata dal sito, **oltre** all'invio
 * per e-mail: i due canali sono indipendenti, così se uno dei due non funziona
 * la richiesta non va persa.
 */
export async function depositaRichiesta(
  tipo: string,
  dati: { nome?: string; telefono?: string; email?: string; campi: Record<string, string> },
): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('richieste').insert({
    tipo,
    nome: dati.nome ?? '',
    telefono: dati.telefono ?? '',
    email: dati.email || null,
    dati: dati.campi,
  })
  return !error
}

/** Totali della tessera fedeltà restituiti dal database. */
export type EsitoTessera =
  | { trovata: true; clienteId: string; speso: number; puntiUsati: number; amici: number }
  | { trovata: false; motivo: 'inesistente' | 'non-collegato' | 'errore' }

/**
 * Tessera fedeltà del cliente che ha la pratica `codice`.
 *
 * Passa dalla funzione `tessera_fedelta`, che restituisce i soli totali:
 * il saldo punti si calcola qui con le regole del programma.
 */
export async function cercaTessera(codice: string): Promise<EsitoTessera> {
  if (!supabase) return { trovata: false, motivo: 'non-collegato' }
  const { data, error } = await supabase.rpc('tessera_fedelta', { codice_cercato: codice.trim() })
  if (error) return { trovata: false, motivo: 'errore' }
  const riga = (
    data as { cliente_id: string; speso: number | string; punti_usati: number | string; amici: number }[] | null
  )?.[0]
  if (!riga) return { trovata: false, motivo: 'inesistente' }
  return {
    trovata: true,
    clienteId: riga.cliente_id,
    speso: Number(riga.speso) || 0,
    puntiUsati: Number(riga.punti_usati) || 0,
    amici: riga.amici ?? 0,
  }
}

/** Regole del programma fedeltà impostate nel gestionale, se l'archivio è online. */
export async function leggiRegoleFedelta(): Promise<Record<string, unknown> | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('regole_fedelta')
  if (error || !data || typeof data !== 'object') return null
  return data as Record<string, unknown>
}
