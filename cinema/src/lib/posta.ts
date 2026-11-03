import 'server-only'
import type { Cinema, Film, GiftCard, Impostazioni, Prenotazione } from '@/lib/tipi'
import { dataEstesa, elencoPosti, prezzoPieno } from '@/lib/utili'

/**
 * Email transazionali.
 *
 * L'integrazione usa l'API HTTP di Resend: nessuna dipendenza, funziona anche
 * su runtime serverless. Senza le variabili d'ambiente la piattaforma resta
 * pienamente funzionante — la conferma viene mostrata a schermo, i biglietti
 * sono già nell'area personale e in console compare il messaggio che sarebbe
 * partito. Si sviluppa senza chiavi e si attiva l'invio quando si vuole.
 *
 *   RESEND_API_KEY   chiave dell'account Resend
 *   POSTA_MITTENTE   indirizzo verificato, es. "CINEMAX <biglietti@dominio.it>"
 *   POSTA_STAFF      destinatario degli avvisi interni
 *
 * Nota sul QR: nell'email non viene incorporato. I client di posta trattano le
 * immagini in modi imprevedibili — molti le bloccano finché non si dà il
 * consenso — e un biglietto che non si vede è un cliente fermo alla porta.
 * L'email porta il codice in chiaro e il collegamento alla pagina del
 * biglietto, dove il QR c'è sempre e si aggiorna se la prenotazione cambia.
 */

const CHIAVE = process.env.RESEND_API_KEY
const STAFF = process.env.POSTA_STAFF ?? ''

type Messaggio = {
  a: string
  oggetto: string
  html: string
  testo: string
}

async function spedisci(messaggio: Messaggio, impostazioni: Impostazioni): Promise<boolean> {
  const mittente =
    process.env.POSTA_MITTENTE ?? `${impostazioni.marchio.nome} <${impostazioni.marchio.email}>`

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
        from: mittente,
        to: [messaggio.a],
        subject: messaggio.oggetto,
        html: messaggio.html,
        text: messaggio.testo,
      }),
    })

    if (!risposta.ok) {
      console.error('[posta] Invio non riuscito:', risposta.status, await risposta.text())
      return false
    }
    return true
  } catch (errore) {
    console.error('[posta] Servizio non raggiungibile:', errore)
    return false
  }
}

/** Sfugge il testo prima di metterlo nell'HTML dell'email. */
function pulito(testo: string): string {
  return testo
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Impianto grafico comune.
 *
 * Tabelle e stili in linea non sono trascuratezza: sono l'unico modo per
 * ottenere un risultato prevedibile nei client di posta, che ignorano i fogli
 * di stile esterni e buona parte del CSS moderno.
 */
function guscio(impostazioni: Impostazioni, titolo: string, corpo: string): string {
  const { marchio } = impostazioni
  return `<!doctype html><html lang="it"><body style="margin:0;padding:0;background:#f4f2f8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#17131f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2f8;padding:28px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(20,16,30,.09)">
<tr><td style="background:#0d0a16;padding:26px 30px">
<span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.18em">${pulito(marchio.nome)}</span>
<div style="color:${marchio.colore};font-size:12px;letter-spacing:.2em;text-transform:uppercase;margin-top:6px">${pulito(marchio.claim)}</div>
</td></tr>
<tr><td style="padding:30px">
<h1 style="margin:0 0 18px;font-size:21px;line-height:1.3">${pulito(titolo)}</h1>
${corpo}
</td></tr>
<tr><td style="background:#faf8fd;padding:20px 30px;font-size:12px;color:#6b6280;line-height:1.6">
${pulito(marchio.nome)} · ${pulito(marchio.email)} · ${pulito(marchio.telefono)}<br>
Ricevi questo messaggio perché hai effettuato un acquisto o una richiesta sul nostro sito.
</td></tr>
</table></td></tr></table></body></html>`
}

function bottone(url: string, etichetta: string, colore: string): string {
  return `<p style="margin:26px 0"><a href="${url}" style="display:inline-block;background:${colore};color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:999px;font-weight:700">${pulito(etichetta)}</a></p>`
}

/* ── Conferma di acquisto ────────────────────────────────────────────────── */

export async function inviaConfermaPrenotazione(
  prenotazione: Prenotazione,
  film: Film | undefined,
  cinema: Cinema | undefined,
  sala: string,
  impostazioni: Impostazioni,
  base: string,
): Promise<boolean> {
  const destinatario = prenotazione.ospite?.email ?? ''
  if (!destinatario) return false

  const url = `${base}/biglietto/${prenotazione.codice}`
  const posti = elencoPosti(prenotazione.posti)

  const righe = [
    ['Film', film?.titolo ?? '—'],
    ['Cinema', cinema ? `${impostazioni.marchio.nome} ${cinema.nome}` : '—'],
    ['Sala', sala],
    ['Data', dataEstesa(prenotazione.data)],
    ['Ora', prenotazione.ora],
    ['Posti', posti],
    ['Totale', prezzoPieno(prenotazione.totale)],
  ]

  const tabella = righe
    .map(
      ([etichetta, valore]) =>
        `<tr><td style="padding:7px 0;color:#6b6280;font-size:14px">${pulito(etichetta)}</td><td style="padding:7px 0;text-align:right;font-weight:600;font-size:14px">${pulito(valore)}</td></tr>`,
    )
    .join('')

  const corpo = `
<p style="margin:0 0 8px;font-size:15px;line-height:1.6">Il tuo ordine è confermato. Mostra il codice QR all'ingresso della sala: lo trovi nella pagina del biglietto e nella tua area personale.</p>
<div style="margin:22px 0;padding:18px;border:1px dashed #d9d3e6;border-radius:14px;text-align:center">
  <div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#6b6280">Codice prenotazione</div>
  <div style="font-size:30px;font-weight:700;letter-spacing:.24em;margin-top:6px">${pulito(prenotazione.codice)}</div>
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${tabella}</table>
${bottone(url, 'Apri il biglietto', impostazioni.marchio.colore)}
<p style="margin:0;font-size:13px;color:#6b6280;line-height:1.6">Ti consigliamo di arrivare dieci minuti prima. Il biglietto vale per il singolo posto indicato: se entrate separatamente, ciascuno mostri il proprio QR.</p>`

  const testo = [
    `Ordine confermato — codice ${prenotazione.codice}`,
    ...righe.map(([etichetta, valore]) => `${etichetta}: ${valore}`),
    `Biglietto: ${url}`,
  ].join('\n')

  return spedisci(
    {
      a: destinatario,
      oggetto: `Biglietti confermati — ${film?.titolo ?? 'il tuo film'} (${prenotazione.codice})`,
      html: guscio(impostazioni, 'Il tuo ordine è confermato', corpo),
      testo,
    },
    impostazioni,
  )
}

/* ── Promemoria prima dello spettacolo ───────────────────────────────────── */

export async function inviaPromemoria(
  prenotazione: Prenotazione,
  film: Film | undefined,
  cinema: Cinema | undefined,
  impostazioni: Impostazioni,
  base: string,
  minuti: number,
): Promise<boolean> {
  const destinatario = prenotazione.ospite?.email ?? ''
  if (!destinatario) return false

  const corpo = `
<p style="margin:0 0 14px;font-size:15px;line-height:1.6">
<strong>${pulito(film?.titolo ?? 'Il tuo film')}</strong> inizia fra ${minuti} minuti
${cinema ? `al ${pulito(impostazioni.marchio.nome)} ${pulito(cinema.nome)}` : ''}.
</p>
<p style="margin:0 0 6px;font-size:15px">Posti: <strong>${pulito(elencoPosti(prenotazione.posti))}</strong></p>
<p style="margin:0;font-size:15px">Codice: <strong style="letter-spacing:.18em">${pulito(prenotazione.codice)}</strong></p>
${bottone(`${base}/biglietto/${prenotazione.codice}`, 'Mostra il QR', impostazioni.marchio.colore)}`

  return spedisci(
    {
      a: destinatario,
      oggetto: `Fra ${minuti} minuti: ${film?.titolo ?? 'il tuo film'}`,
      html: guscio(impostazioni, `Il tuo film inizia fra ${minuti} minuti`, corpo),
      testo: `${film?.titolo ?? 'Il tuo film'} inizia fra ${minuti} minuti. Posti ${elencoPosti(prenotazione.posti)}. Codice ${prenotazione.codice}. ${base}/biglietto/${prenotazione.codice}`,
    },
    impostazioni,
  )
}

/* ── Gift card ───────────────────────────────────────────────────────────── */

export async function inviaGiftCard(
  giftCard: GiftCard,
  impostazioni: Impostazioni,
  base: string,
): Promise<boolean> {
  if (!giftCard.destinatario.email) return false

  const corpo = `
<p style="margin:0 0 10px;font-size:15px;line-height:1.6">
${pulito(giftCard.mittente.nome || 'Qualcuno')} ti ha regalato il cinema.
</p>
${giftCard.messaggio ? `<blockquote style="margin:18px 0;padding:14px 18px;background:#faf8fd;border-left:3px solid ${impostazioni.marchio.colore};border-radius:0 10px 10px 0;font-style:italic;color:#4a4360">${pulito(giftCard.messaggio)}</blockquote>` : ''}
<div style="margin:22px 0;padding:22px;border-radius:16px;background:linear-gradient(135deg,${impostazioni.marchio.colore},${impostazioni.marchio.coloreAlt});color:#ffffff;text-align:center">
  <div style="font-size:12px;letter-spacing:.22em;text-transform:uppercase;opacity:.85">Gift card</div>
  <div style="font-size:38px;font-weight:700;margin:8px 0">${prezzoPieno(giftCard.valoreIniziale)}</div>
  <div style="font-size:19px;letter-spacing:.22em;font-weight:600">${pulito(giftCard.codice)}</div>
</div>
<p style="margin:0;font-size:14px;line-height:1.6;color:#6b6280">Inserisci il codice al momento del pagamento: puoi usarlo in più volte finché resta credito.</p>
${bottone(`${base}/film`, 'Scegli un film', impostazioni.marchio.colore)}`

  return spedisci(
    {
      a: giftCard.destinatario.email,
      oggetto: `Hai ricevuto una gift card ${impostazioni.marchio.nome}`,
      html: guscio(impostazioni, 'Un regalo per te', corpo),
      testo: `Gift card ${impostazioni.marchio.nome} da ${prezzoPieno(giftCard.valoreIniziale)}. Codice: ${giftCard.codice}. ${giftCard.messaggio}`,
    },
    impostazioni,
  )
}

/* ── Avviso interno ──────────────────────────────────────────────────────── */

/** Segnalazione allo staff: vendite anomale, rimborsi, spettacoli annullati. */
export async function avvisaStaff(
  oggetto: string,
  testo: string,
  impostazioni: Impostazioni,
): Promise<boolean> {
  const destinatario = STAFF || impostazioni.marchio.email
  if (!destinatario) return false

  return spedisci(
    {
      a: destinatario,
      oggetto,
      html: guscio(impostazioni, oggetto, `<p style="font-size:15px;line-height:1.7">${pulito(testo).replace(/\n/g, '<br>')}</p>`),
      testo,
    },
    impostazioni,
  )
}
