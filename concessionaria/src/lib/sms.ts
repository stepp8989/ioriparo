import 'server-only'
import { AZIENDA } from '@/dati/azienda'

/**
 * Notifiche via SMS.
 *
 * Usa l'API HTTP di Twilio, senza dipendenze aggiuntive. Come per le email,
 * l'assenza delle variabili d'ambiente non blocca nulla: l'operazione è già
 * salvata, e in console si vede il messaggio che sarebbe partito.
 *
 *   TWILIO_ACCOUNT_SID   identificativo dell'account
 *   TWILIO_AUTH_TOKEN    token di autenticazione
 *   TWILIO_MITTENTE      numero o alfanumerico del mittente
 *
 * L'SMS ha senso per gli avvisi che il cliente deve leggere subito: la
 * conferma del giorno di ritiro, il promemoria del test drive. Per tutto il
 * resto l'email costa meno e si legge meglio.
 */

const SID = process.env.TWILIO_ACCOUNT_SID
const TOKEN = process.env.TWILIO_AUTH_TOKEN
const MITTENTE = process.env.TWILIO_MITTENTE ?? AZIENDA.telefonoLink

export async function inviaSms(numero: string, testo: string): Promise<boolean> {
  if (!SID || !TOKEN) {
    console.info(`[sms] Invio non configurato. A: ${numero} — ${testo}`)
    return false
  }

  try {
    const risposta = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${SID}:${TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: numero, From: MITTENTE, Body: testo }),
    })

    if (!risposta.ok) {
      console.error('[sms] Invio rifiutato dal servizio:', await risposta.text())
      return false
    }
    return true
  } catch (errore) {
    console.error('[sms] Invio non riuscito:', errore)
    return false
  }
}

/** Promemoria del ritiro, inviato alla conferma del noleggio. */
export async function smsNoleggioConfermato(
  numero: string,
  codice: string,
  dal: string,
): Promise<boolean> {
  return inviaSms(
    numero,
    `${AZIENDA.nomeCompleto}: noleggio confermato, codice ${codice}. Ritiro il ${dal}. ` +
      `Portate patente e documento. Info ${AZIENDA.telefono}`,
  )
}

/** Conferma dell'appuntamento in officina o nel reparto detailing. */
export async function smsAppuntamentoConfermato(
  numero: string,
  data: string,
  ora: string,
): Promise<boolean> {
  return inviaSms(
    numero,
    `${AZIENDA.nomeCompleto}: appuntamento confermato per il ${data} alle ${ora}. ` +
      `Per spostarlo chiamate lo ${AZIENDA.telefono}`,
  )
}
