import 'server-only'
import type { MetodoPagamento } from '@/lib/tipi'

/**
 * Pagamenti online dell'acconto di noleggio.
 *
 * Sono supportati Stripe e PayPal, entrambi attraverso le rispettive API HTTP:
 * nessun SDK, nessuna dipendenza, e il codice funziona identico su Node e sui
 * runtime serverless.
 *
 * Senza chiavi configurate il sito non si rompe: il metodo online non viene
 * proposto e il noleggio si conclude con il pagamento al ritiro. È la ragione
 * per cui `preparaPagamento` può restituire `null` — chi la chiama deve
 * trattare quel caso come «si paga in sede», non come un errore.
 *
 *   STRIPE_SECRET_KEY        chiave segreta Stripe (sk_...)
 *   PAYPAL_CLIENT_ID         identificativo dell'applicazione PayPal
 *   PAYPAL_CLIENT_SECRET     segreto dell'applicazione PayPal
 *   PAYPAL_AMBIENTE          `sandbox` (predefinito) oppure `produzione`
 */

const STRIPE = process.env.STRIPE_SECRET_KEY
const PAYPAL_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_SEGRETO = process.env.PAYPAL_CLIENT_SECRET

const PAYPAL_BASE =
  process.env.PAYPAL_AMBIENTE === 'produzione'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

/** Metodi di pagamento realmente utilizzabili con la configurazione attuale. */
export function metodiDisponibili(): MetodoPagamento[] {
  const metodi: MetodoPagamento[] = []
  if (STRIPE) metodi.push('stripe')
  if (PAYPAL_ID && PAYPAL_SEGRETO) metodi.push('paypal')
  // Il pagamento al ritiro è sempre possibile: non dipende da nessun servizio.
  metodi.push('in-sede')
  return metodi
}

export type RichiestaPagamento = {
  metodo: MetodoPagamento
  /** Importo in euro. Viene convertito in centesimi dove serve. */
  importo: number
  descrizione: string
  /** Codice interno dell'operazione: torna indietro nei riscontri del servizio. */
  riferimento: string
  email: string
  urlSuccesso: string
  urlAnnullo: string
}

export type EsitoPagamento = {
  /** Indirizzo a cui mandare il cliente per completare il pagamento. */
  url: string
  /** Identificativo dell'operazione presso il servizio. */
  riferimento: string
}

/** Importo in centesimi, come lo vogliono le API di pagamento. */
function centesimi(euro: number): number {
  return Math.round(euro * 100)
}

/**
 * Prepara il pagamento e restituisce l'indirizzo a cui indirizzare il cliente.
 * Restituisce `null` quando il metodo non è configurato o non è online: in quel
 * caso si prosegue con il pagamento al ritiro.
 */
export async function preparaPagamento(
  richiesta: RichiestaPagamento,
): Promise<EsitoPagamento | null> {
  if (richiesta.importo <= 0) return null
  if (richiesta.metodo === 'stripe') return preparaStripe(richiesta)
  if (richiesta.metodo === 'paypal') return preparaPayPal(richiesta)
  return null
}

/* ── Stripe ──────────────────────────────────────────────────────────────── */

async function preparaStripe(richiesta: RichiestaPagamento): Promise<EsitoPagamento | null> {
  if (!STRIPE) return null

  // L'API di Stripe accetta corpi `application/x-www-form-urlencoded` con la
  // notazione a parentesi quadre per gli oggetti annidati.
  const corpo = new URLSearchParams({
    mode: 'payment',
    'payment_method_types[0]': 'card',
    success_url: richiesta.urlSuccesso,
    cancel_url: richiesta.urlAnnullo,
    customer_email: richiesta.email,
    client_reference_id: richiesta.riferimento,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'eur',
    'line_items[0][price_data][unit_amount]': String(centesimi(richiesta.importo)),
    'line_items[0][price_data][product_data][name]': richiesta.descrizione,
    'metadata[riferimento]': richiesta.riferimento,
  })

  try {
    const risposta = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        // Protegge dai doppi addebiti se la richiesta viene ritentata.
        'Idempotency-Key': richiesta.riferimento,
      },
      body: corpo,
    })

    const dati = (await risposta.json()) as { id?: string; url?: string; error?: { message?: string } }

    if (!risposta.ok || !dati.url || !dati.id) {
      console.error('[pagamenti] Stripe ha rifiutato la sessione:', dati.error?.message ?? dati)
      return null
    }

    return { url: dati.url, riferimento: dati.id }
  } catch (errore) {
    console.error('[pagamenti] Stripe non raggiungibile:', errore)
    return null
  }
}

/** Vero se la sessione Stripe risulta pagata. */
export async function stripePagata(sessioneId: string): Promise<boolean> {
  if (!STRIPE) return false

  try {
    const risposta = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessioneId)}`,
      { headers: { Authorization: `Bearer ${STRIPE}` } },
    )
    if (!risposta.ok) return false

    const dati = (await risposta.json()) as { payment_status?: string }
    return dati.payment_status === 'paid'
  } catch (errore) {
    console.error('[pagamenti] Verifica Stripe non riuscita:', errore)
    return false
  }
}

/* ── PayPal ──────────────────────────────────────────────────────────────── */

/** Token di accesso PayPal, tenuto finché è valido. */
let tokenPayPal: { valore: string; scadenza: number } | null = null

async function accessoPayPal(): Promise<string | null> {
  if (!PAYPAL_ID || !PAYPAL_SEGRETO) return null
  if (tokenPayPal && tokenPayPal.scadenza > Date.now()) return tokenPayPal.valore

  try {
    const risposta = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${PAYPAL_ID}:${PAYPAL_SEGRETO}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!risposta.ok) {
      console.error('[pagamenti] PayPal ha rifiutato le credenziali:', await risposta.text())
      return null
    }

    const dati = (await risposta.json()) as { access_token?: string; expires_in?: number }
    if (!dati.access_token) return null

    // Si tiene un minuto di margine sulla scadenza dichiarata.
    tokenPayPal = {
      valore: dati.access_token,
      scadenza: Date.now() + Math.max((dati.expires_in ?? 600) - 60, 60) * 1000,
    }
    return tokenPayPal.valore
  } catch (errore) {
    console.error('[pagamenti] PayPal non raggiungibile:', errore)
    return null
  }
}

async function preparaPayPal(richiesta: RichiestaPagamento): Promise<EsitoPagamento | null> {
  const token = await accessoPayPal()
  if (!token) return null

  try {
    const risposta = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': richiesta.riferimento,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: richiesta.riferimento,
            description: richiesta.descrizione.slice(0, 127),
            amount: { currency_code: 'EUR', value: richiesta.importo.toFixed(2) },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              user_action: 'PAY_NOW',
              return_url: richiesta.urlSuccesso,
              cancel_url: richiesta.urlAnnullo,
            },
          },
        },
      }),
    })

    const dati = (await risposta.json()) as {
      id?: string
      links?: Array<{ rel: string; href: string }>
    }

    const approvazione = dati.links?.find((link) => link.rel === 'payer-action' || link.rel === 'approve')

    if (!risposta.ok || !dati.id || !approvazione) {
      console.error('[pagamenti] PayPal ha rifiutato l’ordine:', dati)
      return null
    }

    return { url: approvazione.href, riferimento: dati.id }
  } catch (errore) {
    console.error('[pagamenti] PayPal non raggiungibile:', errore)
    return null
  }
}

/**
 * Incassa un ordine PayPal già approvato dal cliente.
 * Va chiamata al ritorno sul sito, prima di considerare pagato il noleggio.
 */
export async function incassaPayPal(ordineId: string): Promise<boolean> {
  const token = await accessoPayPal()
  if (!token) return false

  try {
    const risposta = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(ordineId)}/capture`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      },
    )

    const dati = (await risposta.json()) as { status?: string }

    // `ORDER_ALREADY_CAPTURED` non è un guasto: è il cliente che ha ricaricato
    // la pagina di ritorno. Si verifica lo stato dell'ordine e si conclude.
    if (!risposta.ok) {
      const testo = JSON.stringify(dati)
      if (testo.includes('ORDER_ALREADY_CAPTURED')) return statoPayPal(ordineId)
      console.error('[pagamenti] Incasso PayPal non riuscito:', testo)
      return false
    }

    return dati.status === 'COMPLETED'
  } catch (errore) {
    console.error('[pagamenti] Incasso PayPal non riuscito:', errore)
    return false
  }
}

/** Vero se l'ordine PayPal risulta completato. */
async function statoPayPal(ordineId: string): Promise<boolean> {
  const token = await accessoPayPal()
  if (!token) return false

  try {
    const risposta = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${encodeURIComponent(ordineId)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!risposta.ok) return false

    const dati = (await risposta.json()) as { status?: string }
    return dati.status === 'COMPLETED'
  } catch {
    return false
  }
}
