import 'server-only'
import type { MetodoPagamento } from '@/lib/tipi'

/**
 * Pagamenti online.
 *
 * L'integrazione passa dalle API HTTP dei fornitori: nessun SDK, nessuna
 * dipendenza, e lo stesso codice funziona su Node e sui runtime serverless.
 *
 * Il principio che regge tutto il modulo: i dati della carta non entrano mai
 * nella piattaforma. Il cliente li inserisce sulle pagine di Stripe o di
 * PayPal, e qui torna soltanto un identificativo di operazione. Non c'è nessun
 * punto del codice in cui un numero di carta possa essere letto, registrato o
 * dimenticato in un file di log, e non deve essercene mai uno.
 *
 * Senza chiavi configurate la piattaforma non si rompe: il pagamento online
 * non viene proposto e la prenotazione si conclude con il ritiro in cassa. È
 * la ragione per cui `preparaPagamento` può restituire `null` — chi la chiama
 * lo tratta come «si paga allo sportello», non come un errore.
 *
 *   STRIPE_SECRET_KEY        chiave segreta Stripe (sk_...)
 *   STRIPE_WEBHOOK_SECRET    segreto per verificare i riscontri (whsec_...)
 *   PAYPAL_CLIENT_ID         identificativo dell'applicazione PayPal
 *   PAYPAL_CLIENT_SECRET     segreto dell'applicazione PayPal
 *   PAYPAL_AMBIENTE          `sandbox` (predefinito) oppure `produzione`
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

const STRIPE = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK = process.env.STRIPE_WEBHOOK_SECRET
const PAYPAL_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_SEGRETO = process.env.PAYPAL_CLIENT_SECRET

const PAYPAL_BASE =
  process.env.PAYPAL_AMBIENTE === 'produzione'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

/**
 * Metodi realmente utilizzabili con la configurazione attuale.
 *
 * Apple Pay e Google Pay passano dalla stessa sessione Stripe: non sono
 * fornitori a sé, sono modi di presentare la carta. Compaiono nell'elenco solo
 * se Stripe è configurato, e vanno abilitati anche nel cruscotto Stripe —
 * senza quel passaggio il pulsante non comparirebbe comunque sulla pagina di
 * pagamento, per quanto il sito lo prometta.
 */
export function metodiDisponibili(): MetodoPagamento[] {
  const metodi: MetodoPagamento[] = []
  if (STRIPE) metodi.push('carta', 'apple-pay', 'google-pay')
  if (PAYPAL_ID && PAYPAL_SEGRETO) metodi.push('paypal')
  // Il ritiro in cassa non dipende da nessun servizio esterno.
  metodi.push('cassa')
  return metodi
}

/** Vero se esiste almeno un fornitore configurato. */
export function pagamentiOnlineAttivi(): boolean {
  return Boolean(STRIPE) || Boolean(PAYPAL_ID && PAYPAL_SEGRETO)
}

export type RichiestaPagamento = {
  metodo: MetodoPagamento
  /** Importo in euro. Viene convertito in centesimi dove serve. */
  importo: number
  descrizione: string
  /** Codice della prenotazione: torna indietro nei riscontri del fornitore. */
  riferimento: string
  email: string
  urlSuccesso: string
  urlAnnullo: string
}

export type EsitoPagamento = {
  /** Indirizzo a cui mandare il cliente per completare il pagamento. */
  url: string
  /** Identificativo dell'operazione presso il fornitore. */
  riferimento: string
}

/** Importo in centesimi, come lo vogliono le API di pagamento. */
function centesimi(euro: number): number {
  return Math.round(euro * 100)
}

/**
 * Prepara il pagamento e restituisce l'indirizzo a cui indirizzare il cliente.
 * `null` significa «questo metodo non è online»: si prosegue con la cassa.
 */
export async function preparaPagamento(
  richiesta: RichiestaPagamento,
): Promise<EsitoPagamento | null> {
  if (richiesta.importo <= 0) return null

  switch (richiesta.metodo) {
    case 'carta':
    case 'apple-pay':
    case 'google-pay':
      return preparaStripe(richiesta)
    case 'paypal':
      return preparaPayPal(richiesta)
    default:
      return null
  }
}

/* ── Stripe ──────────────────────────────────────────────────────────────── */

async function preparaStripe(richiesta: RichiestaPagamento): Promise<EsitoPagamento | null> {
  if (!STRIPE) return null

  // L'API di Stripe accetta corpi `application/x-www-form-urlencoded` con la
  // notazione a parentesi quadre per gli oggetti annidati.
  const corpo = new URLSearchParams({
    mode: 'payment',
    success_url: richiesta.urlSuccesso,
    cancel_url: richiesta.urlAnnullo,
    client_reference_id: richiesta.riferimento,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'eur',
    'line_items[0][price_data][unit_amount]': String(centesimi(richiesta.importo)),
    'line_items[0][price_data][product_data][name]': richiesta.descrizione,
    'metadata[prenotazione]': richiesta.riferimento,
  })

  if (richiesta.email) corpo.set('customer_email', richiesta.email)

  try {
    const risposta = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        // Stripe deduplica le richieste con questa chiave: un doppio clic sul
        // pulsante «paga» non crea due sessioni e non addebita due volte.
        'Idempotency-Key': `prenotazione-${richiesta.riferimento}`,
      },
      body: corpo,
    })

    const dati = (await risposta.json()) as { id?: string; url?: string; error?: { message: string } }

    if (!risposta.ok || !dati.url || !dati.id) {
      console.error('[pagamenti] Stripe ha rifiutato la richiesta:', dati.error?.message ?? risposta.status)
      return null
    }

    return { url: dati.url, riferimento: dati.id }
  } catch (errore) {
    console.error('[pagamenti] Stripe non raggiungibile:', errore)
    return null
  }
}

/**
 * Verifica la firma di un riscontro Stripe.
 *
 * Senza questo controllo chiunque conosca l'indirizzo della rotta potrebbe
 * dichiarare pagata una prenotazione qualsiasi: è il singolo punto in cui la
 * sicurezza dell'incasso si gioca davvero, e per questo la rotta rifiuta il
 * riscontro quando il segreto non è configurato invece di accettarlo per
 * comodità.
 */
export function riscontroStripeValido(
  corpoGrezzo: string,
  intestazione: string | null,
  tolleranzaSecondi = 300,
): boolean {
  if (!STRIPE_WEBHOOK || !intestazione) return false

  const parti = new Map(
    intestazione.split(',').map((pezzo) => {
      const separatore = pezzo.indexOf('=')
      return [pezzo.slice(0, separatore).trim(), pezzo.slice(separatore + 1).trim()] as const
    }),
  )

  const momento = Number(parti.get('t'))
  const firmaRicevuta = parti.get('v1')
  if (!Number.isFinite(momento) || !firmaRicevuta) return false

  // Un riscontro vecchio è un riscontro riprodotto: si scarta.
  if (Math.abs(Date.now() / 1000 - momento) > tolleranzaSecondi) return false

  const attesa = createHmac('sha256', STRIPE_WEBHOOK)
    .update(`${momento}.${corpoGrezzo}`)
    .digest('hex')

  const a = Buffer.from(attesa)
  const b = Buffer.from(firmaRicevuta)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/* ── PayPal ──────────────────────────────────────────────────────────────── */

async function tokenPayPal(): Promise<string | null> {
  if (!PAYPAL_ID || !PAYPAL_SEGRETO) return null

  try {
    const risposta = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${PAYPAL_ID}:${PAYPAL_SEGRETO}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!risposta.ok) return null
    const dati = (await risposta.json()) as { access_token?: string }
    return dati.access_token ?? null
  } catch (errore) {
    console.error('[pagamenti] PayPal non raggiungibile:', errore)
    return null
  }
}

async function preparaPayPal(richiesta: RichiestaPagamento): Promise<EsitoPagamento | null> {
  const token = await tokenPayPal()
  if (!token) return null

  try {
    const risposta = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: richiesta.riferimento,
            description: richiesta.descrizione.slice(0, 127),
            amount: { currency_code: 'EUR', value: richiesta.importo.toFixed(2) },
          },
        ],
        application_context: {
          brand_name: richiesta.descrizione.split('—')[0].trim().slice(0, 127),
          user_action: 'PAY_NOW',
          return_url: richiesta.urlSuccesso,
          cancel_url: richiesta.urlAnnullo,
        },
      }),
    })

    const dati = (await risposta.json()) as {
      id?: string
      links?: { rel: string; href: string }[]
    }

    const approvazione = dati.links?.find((collegamento) => collegamento.rel === 'approve')
    if (!risposta.ok || !dati.id || !approvazione) {
      console.error('[pagamenti] PayPal ha rifiutato la richiesta:', risposta.status)
      return null
    }

    return { url: approvazione.href, riferimento: dati.id }
  } catch (errore) {
    console.error('[pagamenti] PayPal non raggiungibile:', errore)
    return null
  }
}

/** Incassa un ordine PayPal approvato dal cliente. */
export async function incassaPayPal(ordineId: string): Promise<boolean> {
  const token = await tokenPayPal()
  if (!token) return false

  try {
    const risposta = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${ordineId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })

    if (!risposta.ok) return false
    const dati = (await risposta.json()) as { status?: string }
    return dati.status === 'COMPLETED'
  } catch (errore) {
    console.error('[pagamenti] Incasso PayPal non riuscito:', errore)
    return false
  }
}

/** Nome leggibile di un metodo, per riepiloghi e pannello. */
export const NOMI_METODO: Record<MetodoPagamento, string> = {
  carta: 'Carta di credito',
  'apple-pay': 'Apple Pay',
  'google-pay': 'Google Pay',
  paypal: 'PayPal',
  'gift-card': 'Gift card',
  punti: 'Punti CLUB',
  cassa: 'Cassa del cinema',
}
