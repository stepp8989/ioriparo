import 'server-only'
import { AGENZIA } from '@/dati/agenzia'
import type { Richiesta } from '@/lib/tipi'
import { dataEstesa } from '@/lib/utili'

/**
 * Notifica per email delle nuove richieste.
 *
 * Usa l'API HTTP di Resend (https://resend.com): nessuna dipendenza da
 * installare e funziona anche su runtime serverless. Senza le variabili
 * d'ambiente il sito resta pienamente funzionante — la conferma appare a
 * schermo e la richiesta viene registrata — mentre in console si legge il
 * messaggio che sarebbe partito. Così si sviluppa senza chiavi e si attiva
 * l'invio in un secondo momento.
 *
 *   RESEND_API_KEY      chiave dell'account
 *   POSTA_MITTENTE      indirizzo verificato, es. "Orbita <ciao@dominio.it>"
 *   POSTA_DESTINATARIO  a chi arrivano le richieste
 */

const CHIAVE = process.env.RESEND_API_KEY
const MITTENTE = process.env.POSTA_MITTENTE ?? `${AGENZIA.nomeCompleto} <${AGENZIA.email}>`
const DESTINATARIO = process.env.POSTA_DESTINATARIO ?? AGENZIA.email

type Messaggio = { a: string; oggetto: string; html: string; testo: string; rispondiA?: string }

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
      headers: { Authorization: `Bearer ${CHIAVE}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: MITTENTE,
        to: [messaggio.a],
        subject: messaggio.oggetto,
        html: messaggio.html,
        text: messaggio.testo,
        ...(messaggio.rispondiA ? { reply_to: messaggio.rispondiA } : {}),
      }),
    })

    if (!risposta.ok) {
      console.error('[posta] Invio rifiutato dal servizio:', await risposta.text())
      return false
    }
    return true
  } catch (errore) {
    // Un problema di rete non deve far fallire la richiesta: è già registrata.
    console.error('[posta] Invio non riuscito:', errore)
    return false
  }
}

/** Testo dell'utente reso sicuro dentro l'HTML dell'email. */
function protetto(testo: string): string {
  return testo
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Notifica interna: una nuova richiesta di preventivo è arrivata. */
export async function avvisaNuovaRichiesta(richiesta: Richiesta): Promise<boolean> {
  const righe: [string, string][] = [
    ['Nome', richiesta.nome],
    ['Azienda', richiesta.azienda || '—'],
    ['Email', richiesta.email],
    ['Telefono', richiesta.telefono || '—'],
    ['Tipo di sito', richiesta.tipoSito],
    ['Ricevuta il', dataEstesa(richiesta.creataIl)],
  ]

  const tabella = righe
    .map(
      ([voce, valore]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7280;white-space:nowrap">${voce}</td>` +
        `<td style="padding:6px 0;color:#111827"><strong>${protetto(valore)}</strong></td></tr>`,
    )
    .join('')

  return spedisci({
    a: DESTINATARIO,
    rispondiA: richiesta.email,
    oggetto: `Nuova richiesta di preventivo — ${richiesta.nome}${richiesta.azienda ? ` (${richiesta.azienda})` : ''}`,
    html: `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:32px 16px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#111827">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e5e7eb">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#3b82f6">${AGENZIA.nomeCompleto}</p>
    <h1 style="margin:0 0 20px;font-size:20px">Nuova richiesta di preventivo</h1>
    <table style="border-collapse:collapse;font-size:14px;width:100%">${tabella}</table>
    <p style="margin:20px 0 6px;color:#6b7280;font-size:13px">Messaggio</p>
    <div style="white-space:pre-wrap;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;font-size:14px;line-height:1.6">${protetto(richiesta.messaggio)}</div>
    <p style="margin:22px 0 0;font-size:13px;color:#6b7280">Rispondi a questa email per scrivere direttamente a ${protetto(richiesta.nome)}.</p>
  </div>
</body></html>`,
    testo: righe
      .map(([voce, valore]) => `${voce}: ${valore}`)
      .concat('', richiesta.messaggio)
      .join('\n'),
  })
}

/** Conferma al cliente: la richiesta è arrivata, ecco i tempi di risposta. */
export async function confermaAlCliente(richiesta: Richiesta): Promise<boolean> {
  return spedisci({
    a: richiesta.email,
    oggetto: `Ho ricevuto la tua richiesta — ${AGENZIA.nomeCompleto}`,
    html: `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:32px 16px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#111827">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e5e7eb">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#3b82f6">${AGENZIA.nomeCompleto}</p>
    <h1 style="margin:0 0 16px;font-size:20px">Ciao ${protetto(richiesta.nome)}, richiesta ricevuta.</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65">Ti rispondo entro ${AGENZIA.tempi.risposta} con qualche domanda e una prima idea di percorso. Nel frattempo, se ti viene in mente qualcosa, rispondi pure a questa email.</p>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.65">Se preferisci sentirmi subito: <a href="tel:${AGENZIA.telefonoLink}" style="color:#3b82f6">${AGENZIA.telefono}</a>.</p>
    <p style="margin:0;font-size:13px;color:#6b7280">${AGENZIA.nomeCompleto} — ${AGENZIA.motto}</p>
  </div>
</body></html>`,
    testo:
      `Ciao ${richiesta.nome}, ho ricevuto la tua richiesta.\n\n` +
      `Ti rispondo entro ${AGENZIA.tempi.risposta}. Se preferisci sentirmi subito: ${AGENZIA.telefono}.\n\n` +
      `${AGENZIA.nomeCompleto} — ${AGENZIA.motto}`,
  })
}
