import 'server-only'
import { AZIENDA, INDIRIZZO_COMPLETO } from '@/dati/azienda'
import type { Appuntamento, Noleggio, Richiesta } from '@/lib/tipi'
import { NOMI_TIPO_RICHIESTA } from '@/lib/tipi'
import { dataEstesa, prezzo } from '@/lib/utili'

/**
 * Invio delle email di conferma e degli avvisi allo staff.
 *
 * L'integrazione usa l'API HTTP di Resend, che non richiede dipendenze e
 * funziona anche su runtime serverless. Senza le variabili d'ambiente il sito
 * resta pienamente funzionante: la conferma viene mostrata a schermo e la
 * richiesta arriva comunque nel pannello, mentre in console si vede il
 * messaggio che sarebbe partito. Così si può sviluppare senza chiavi e
 * attivare l'invio in un secondo momento.
 *
 *   RESEND_API_KEY   chiave dell'account Resend
 *   POSTA_MITTENTE   indirizzo verificato, es. "Aurora Motori <info@dominio.it>"
 *   POSTA_STAFF      destinatario degli avvisi interni
 */

const CHIAVE = process.env.RESEND_API_KEY
const MITTENTE = process.env.POSTA_MITTENTE ?? `${AZIENDA.nomeCompleto} <${AZIENDA.email}>`
const STAFF = process.env.POSTA_STAFF ?? AZIENDA.email

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
    // Un problema di rete non deve far fallire l'operazione: è già salvata.
    console.error('[posta] Invio non riuscito:', errore)
    return false
  }
}

/**
 * Neutralizza i caratteri che in HTML cambierebbero la struttura del
 * messaggio. I testi arrivano da moduli pubblici: senza questo passaggio, un
 * nome contenente un tag finirebbe interpretato dal client di posta.
 */
function testoSicuro(valore: string): string {
  return valore
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Impaginazione comune a tutte le email: sobria e leggibile ovunque. */
function modello(titolo: string, corpo: string): string {
  return `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:32px 16px;background:#0a0705;font-family:Arial,Helvetica,sans-serif;color:#f5efe7">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#16110c;border:1px solid #2c231a;border-radius:16px">
    <tr><td style="padding:32px 32px 24px;border-bottom:1px solid #2c231a;text-align:center">
      <p style="margin:0;font-size:22px;letter-spacing:8px;text-transform:uppercase;color:#ffffff">${AZIENDA.nome}</p>
      <p style="margin:8px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#e59243">Motori</p>
    </td></tr>
    <tr><td style="padding:32px">
      <h1 style="margin:0 0 20px;font-size:22px;font-weight:600;color:#ffffff">${titolo}</h1>
      ${corpo}
    </td></tr>
    <tr><td style="padding:24px 32px;border-top:1px solid #2c231a;font-size:12px;color:#a49686">
      <p style="margin:0 0 4px">${AZIENDA.ragioneSociale} — ${INDIRIZZO_COMPLETO}</p>
      <p style="margin:0">${AZIENDA.telefono} · ${AZIENDA.email}</p>
    </td></tr>
  </table>
</body></html>`
}

/** Riga «etichetta: valore» usata dentro il corpo delle email. */
function riga(etichetta: string, valore: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:#a49686;width:42%">${etichetta}</td>
    <td style="padding:8px 0;font-size:14px;color:#f5efe7;font-weight:600">${testoSicuro(valore)}</td>
  </tr>`
}

function tabella(righe: string[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #2c231a">${righe.join('')}</table>`
}

/* ── Noleggi ─────────────────────────────────────────────────────────────── */

export async function confermaNoleggio(noleggio: Noleggio): Promise<boolean> {
  const righe = tabella([
    riga('Codice', noleggio.codice),
    riga('Veicolo', noleggio.veicoloTitolo),
    riga('Ritiro', dataEstesa(noleggio.dal)),
    riga('Riconsegna', dataEstesa(noleggio.al)),
    riga('Giorni', String(noleggio.giorni)),
    riga('Totale', prezzo(noleggio.totale)),
    riga('Cauzione', prezzo(noleggio.cauzione)),
    noleggio.consegnaDomicilio
      ? riga('Consegna', noleggio.indirizzoConsegna || 'A domicilio')
      : riga('Ritiro presso', INDIRIZZO_COMPLETO),
  ])

  return spedisci({
    a: noleggio.email,
    oggetto: `Noleggio confermato — codice ${noleggio.codice}`,
    html: modello(
      `Gentile ${testoSicuro(noleggio.nome)}, il noleggio è confermato`,
      `<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#c9bcab">
         Grazie per aver scelto ${AZIENDA.nomeCompleto}. Conservate il codice: serve al ritiro,
         insieme a patente e documento d’identità in corso di validità.
       </p>${righe}
       <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#a49686">
         Per modificare o annullare il noleggio scriveteci o chiamate lo ${AZIENDA.telefono}.
       </p>`,
    ),
    testo:
      `Noleggio confermato — codice ${noleggio.codice}\n` +
      `${noleggio.veicoloTitolo}\n` +
      `Dal ${dataEstesa(noleggio.dal)} al ${dataEstesa(noleggio.al)} (${noleggio.giorni} giorni)\n` +
      `Totale ${prezzo(noleggio.totale)} — cauzione ${prezzo(noleggio.cauzione)}\n` +
      `${AZIENDA.nomeCompleto} — ${AZIENDA.telefono}`,
  })
}

export async function avvisaStaffNoleggio(noleggio: Noleggio): Promise<boolean> {
  return spedisci({
    a: STAFF,
    oggetto: `Nuovo noleggio ${noleggio.codice} — ${noleggio.veicoloTitolo}`,
    html: modello(
      'Nuova richiesta di noleggio',
      tabella([
        riga('Cliente', `${noleggio.nome} ${noleggio.cognome}`),
        riga('Telefono', noleggio.telefono),
        riga('Email', noleggio.email),
        riga('Veicolo', noleggio.veicoloTitolo),
        riga('Periodo', `${dataEstesa(noleggio.dal)} → ${dataEstesa(noleggio.al)}`),
        riga('Totale', prezzo(noleggio.totale)),
        riga('Pagamento', noleggio.pagamento.metodo),
        riga('Note', noleggio.note || '—'),
      ]),
    ),
    testo: `Nuovo noleggio ${noleggio.codice}: ${noleggio.nome} ${noleggio.cognome}, ${noleggio.veicoloTitolo}, ${noleggio.dal} → ${noleggio.al}`,
  })
}

/* ── Richieste commerciali ───────────────────────────────────────────────── */

export async function confermaRichiesta(richiesta: Richiesta): Promise<boolean> {
  const righe: string[] = [
    riga('Codice', richiesta.codice),
    riga('Tipo', NOMI_TIPO_RICHIESTA[richiesta.tipo]),
  ]
  if (richiesta.veicoloTitolo) righe.push(riga('Veicolo', richiesta.veicoloTitolo))
  if (richiesta.data) righe.push(riga('Data proposta', dataEstesa(richiesta.data)))
  if (richiesta.ora) righe.push(riga('Ora', richiesta.ora))
  if (richiesta.finanziamento) {
    righe.push(riga('Importo', prezzo(richiesta.finanziamento.importo)))
    righe.push(riga('Durata', `${richiesta.finanziamento.durataMesi} mesi`))
    righe.push(riga('Rata stimata', `${prezzo(richiesta.finanziamento.rata)} al mese`))
  }

  return spedisci({
    a: richiesta.email,
    oggetto: `Richiesta ricevuta — codice ${richiesta.codice}`,
    html: modello(
      `Gentile ${testoSicuro(richiesta.nome)}, abbiamo ricevuto la richiesta`,
      `<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#c9bcab">
         Un consulente vi risponde entro un giorno lavorativo. Se preferite parlarne subito,
         chiamate lo ${AZIENDA.telefono}: il codice qui sotto ci fa trovare la pratica in un attimo.
       </p>${tabella(righe)}`,
    ),
    testo: `Richiesta ricevuta — codice ${richiesta.codice}. Vi risponderemo entro un giorno lavorativo.`,
  })
}

export async function avvisaStaffRichiesta(richiesta: Richiesta): Promise<boolean> {
  return spedisci({
    a: STAFF,
    oggetto: `${NOMI_TIPO_RICHIESTA[richiesta.tipo]} — ${richiesta.nome} ${richiesta.cognome}`,
    html: modello(
      `Nuova richiesta: ${NOMI_TIPO_RICHIESTA[richiesta.tipo]}`,
      tabella([
        riga('Cliente', `${richiesta.nome} ${richiesta.cognome}`),
        riga('Telefono', richiesta.telefono),
        riga('Email', richiesta.email),
        riga('Veicolo', richiesta.veicoloTitolo || '—'),
        riga('Messaggio', richiesta.messaggio || '—'),
      ]),
    ),
    testo: `Nuova richiesta ${richiesta.codice} da ${richiesta.nome} ${richiesta.cognome} (${richiesta.telefono})`,
  })
}

/* ── Appuntamenti in officina e detailing ────────────────────────────────── */

export async function confermaAppuntamento(appuntamento: Appuntamento): Promise<boolean> {
  return spedisci({
    a: appuntamento.email,
    oggetto: `Appuntamento ricevuto — codice ${appuntamento.codice}`,
    html: modello(
      `Gentile ${testoSicuro(appuntamento.nome)}, abbiamo segnato l’appuntamento`,
      `<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#c9bcab">
         Vi confermiamo l’orario per telefono entro poche ore, dopo aver verificato la
         disponibilità della cabina.
       </p>${tabella([
         riga('Codice', appuntamento.codice),
         riga('Trattamento', appuntamento.servizioNome),
         riga('Data', dataEstesa(appuntamento.data)),
         riga('Ora', appuntamento.ora),
         riga('Veicolo', appuntamento.veicolo || '—'),
         riga('Preventivo', `da ${prezzo(appuntamento.prezzo)}`),
       ])}`,
    ),
    testo: `Appuntamento ${appuntamento.codice} per ${appuntamento.servizioNome} il ${appuntamento.data} alle ${appuntamento.ora}.`,
  })
}

export async function avvisaStaffAppuntamento(appuntamento: Appuntamento): Promise<boolean> {
  return spedisci({
    a: STAFF,
    oggetto: `Detailing ${appuntamento.codice} — ${appuntamento.servizioNome}`,
    html: modello(
      'Nuovo appuntamento',
      tabella([
        riga('Cliente', `${appuntamento.nome} ${appuntamento.cognome}`),
        riga('Telefono', appuntamento.telefono),
        riga('Trattamento', appuntamento.servizioNome),
        riga('Quando', `${dataEstesa(appuntamento.data)} alle ${appuntamento.ora}`),
        riga('Veicolo', `${appuntamento.veicolo} ${appuntamento.targa}`),
        riga('Note', appuntamento.note || '—'),
      ]),
    ),
    testo: `Nuovo appuntamento ${appuntamento.codice}: ${appuntamento.servizioNome} il ${appuntamento.data} alle ${appuntamento.ora}`,
  })
}

/* ── Area clienti ────────────────────────────────────────────────────────── */

export async function benvenutoCliente(nome: string, email: string): Promise<boolean> {
  return spedisci({
    a: email,
    oggetto: `Benvenuto in ${AZIENDA.nomeCompleto}`,
    html: modello(
      `Benvenuto, ${testoSicuro(nome)}`,
      `<p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#c9bcab">
         Il vostro account è attivo. Dall’area riservata potete seguire noleggi e appuntamenti,
         rivedere le richieste inviate e scaricare documenti e fatture.
       </p>
       <p style="margin:0;font-size:13px;line-height:1.7;color:#a49686">
         Se non siete stati voi a registrarvi, ignorate questo messaggio o scriveteci a ${AZIENDA.email}.
       </p>`,
    ),
    testo: `Benvenuto in ${AZIENDA.nomeCompleto}. Il vostro account è attivo.`,
  })
}
