import 'server-only'
import { INDIRIZZO_COMPLETO, RISTORANTE } from '@/dati/ristorante'
import type { Prenotazione } from '@/lib/tipi'
import { dataEstesa } from '@/lib/utili'

/**
 * Invio delle email di conferma.
 *
 * L'integrazione usa l'API HTTP di Resend, che non richiede dipendenze e
 * funziona anche su runtime serverless. Senza le variabili d'ambiente il sito
 * resta pienamente funzionante: la conferma viene mostrata a schermo e la
 * richiesta arriva comunque nel pannello, mentre in console si vede il
 * messaggio che sarebbe partito. Così si può sviluppare senza chiavi e
 * attivare l'invio in un secondo momento.
 *
 *   RESEND_API_KEY   chiave dell'account Resend
 *   POSTA_MITTENTE   indirizzo verificato, es. "Aurea <prenotazioni@dominio.it>"
 */

const CHIAVE = process.env.RESEND_API_KEY
const MITTENTE = process.env.POSTA_MITTENTE ?? `${RISTORANTE.nomeCompleto} <${RISTORANTE.email}>`

type Messaggio = {
  a: string
  oggetto: string
  html: string
  testo: string
}

async function spedisci(messaggio: Messaggio): Promise<boolean> {
  if (!CHIAVE) {
    console.info(
      `[posta] Invio non configurato. Destinatario: ${messaggio.a} — Oggetto: ${messaggio.oggetto}`,
    )
    return false
  }

  try {
    const risposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CHIAVE}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: MITTENTE,
        to: [messaggio.a],
        subject: messaggio.oggetto,
        html: messaggio.html,
        text: messaggio.testo,
      }),
    })

    if (!risposta.ok) {
      console.error('[posta] Invio rifiutato dal servizio:', await risposta.text())
      return false
    }
    return true
  } catch (errore) {
    // Un problema di rete non deve far fallire la prenotazione: è già salvata.
    console.error('[posta] Invio non riuscito:', errore)
    return false
  }
}

/** Impaginazione comune a tutte le email: sobria e leggibile ovunque. */
function modello(titolo: string, corpo: string): string {
  return `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:32px 16px;background:#f7f3ec;font-family:Georgia,'Times New Roman',serif;color:#1b1815">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e0d6c4">
    <tr><td style="padding:32px 32px 24px;border-bottom:1px solid #e0d6c4;text-align:center">
      <p style="margin:0;font-size:22px;letter-spacing:6px;text-transform:uppercase">${RISTORANTE.nome}</p>
      <p style="margin:6px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a37b32">Ristorante</p>
    </td></tr>
    <tr><td style="padding:32px">
      <h1 style="margin:0 0 20px;font-size:24px;font-weight:normal">${titolo}</h1>
      ${corpo}
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid #e0d6c4;font-family:Arial,sans-serif;font-size:12px;color:#6b6257">
      <p style="margin:0 0 4px">${RISTORANTE.nomeCompleto} — ${INDIRIZZO_COMPLETO}</p>
      <p style="margin:0">${RISTORANTE.telefono} · ${RISTORANTE.email}</p>
    </td></tr>
  </table>
</body></html>`
}

/** Conferma inviata al cliente subito dopo la richiesta di prenotazione. */
export async function confermaPrenotazione(prenotazione: Prenotazione): Promise<boolean> {
  const riepilogo = [
    ['Codice', prenotazione.codice],
    ['Nome', `${prenotazione.nome} ${prenotazione.cognome}`],
    ['Data', dataEstesa(prenotazione.data)],
    ['Orario', prenotazione.ora],
    ['Persone', String(prenotazione.persone)],
    ...(prenotazione.note ? [['Richieste', prenotazione.note]] : []),
  ]

  const righe = riepilogo
    .map(
      ([voce, valore]) =>
        `<tr><td style="padding:8px 0;font-family:Arial,sans-serif;font-size:13px;color:#6b6257;width:120px">${voce}</td>
         <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:14px">${valore}</td></tr>`,
    )
    .join('')

  return spedisci({
    a: prenotazione.email,
    oggetto: `Prenotazione confermata — ${RISTORANTE.nomeCompleto} (${prenotazione.codice})`,
    html: modello(
      'La vostra prenotazione è confermata',
      `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#1b1815">
         Gentile ${prenotazione.nome}, il tavolo è riservato. Ecco il riepilogo:
       </p>
       <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;border-top:1px solid #e0d6c4;border-bottom:1px solid #e0d6c4">${righe}</table>
       <p style="font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#6b6257">
         Per modifiche o disdette chiamateci al ${RISTORANTE.telefono} indicando il codice
         <strong>${prenotazione.codice}</strong>. Se non potete venire vi chiediamo di avvisarci:
         il tavolo resta libero per qualcun altro.
       </p>`,
    ),
    testo: `La vostra prenotazione da ${RISTORANTE.nomeCompleto} è confermata.
${riepilogo.map(([voce, valore]) => `${voce}: ${valore}`).join('\n')}

Per modifiche chiamate il ${RISTORANTE.telefono} indicando il codice ${prenotazione.codice}.
${INDIRIZZO_COMPLETO}`,
  })
}

/** Avviso interno allo staff: una nuova richiesta è arrivata nel pannello. */
export async function avvisaStaff(prenotazione: Prenotazione): Promise<boolean> {
  return spedisci({
    a: RISTORANTE.emailInfo,
    oggetto: `Nuova prenotazione: ${prenotazione.data} ${prenotazione.ora} — ${prenotazione.persone} p.`,
    html: modello(
      'Nuova richiesta di prenotazione',
      `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7">
        ${prenotazione.nome} ${prenotazione.cognome} — ${prenotazione.persone} persone<br>
        ${dataEstesa(prenotazione.data)} alle ${prenotazione.ora}<br>
        ${prenotazione.telefono} · ${prenotazione.email}<br>
        ${prenotazione.note ? `Richieste: ${prenotazione.note}` : 'Nessuna richiesta particolare.'}
      </p>`,
    ),
    testo: `Nuova prenotazione ${prenotazione.codice}: ${prenotazione.nome} ${prenotazione.cognome}, ${prenotazione.persone} persone, ${prenotazione.data} ${prenotazione.ora}. ${prenotazione.telefono} ${prenotazione.email}. ${prenotazione.note}`,
  })
}
