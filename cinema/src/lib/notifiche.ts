import 'server-only'
import { inviaPromemoria } from '@/lib/posta'
import type { Archivio, CanaleNotifica, Notifica, Prenotazione } from '@/lib/tipi'
import { istanteSpettacolo, nuovoId } from '@/lib/utili'

/**
 * Notifiche: coda, programmazione e invio.
 *
 * Le notifiche non partono nel momento in cui vengono create: entrano in una
 * coda con l'istante in cui vanno spedite. Serve al promemoria «il tuo film
 * inizia fra mezz'ora», che per definizione va mandato più tardi, e ha un
 * effetto collaterale utile — un guasto del servizio di posta non fa perdere
 * il messaggio, che resta in coda e riparte al giro successivo.
 *
 * Lo smaltimento della coda è esposto dalla rotta `POST /api/notifiche/coda`,
 * che va chiamata periodicamente. Ogni piattaforma ha il suo modo di farlo
 * (Vercel Cron, un servizio di pianificazione, un semplice `curl` da cron di
 * sistema): la rotta è protetta da `NOTIFICHE_SEGRETO` proprio perché l'unico
 * chiamante legittimo è quello schedulatore.
 *
 * Push e SMS sono predisposti ma non collegati: `consegna` mostra dove
 * innestare il fornitore. Senza, restano registrati come «in-coda» e la
 * notifica resta visibile nell'area personale, che è già un canale.
 */

/** Minuti prima dello spettacolo in cui parte il promemoria. */
export const MINUTI_PROMEMORIA = 30

export function accodaNotifica(
  archivio: Archivio,
  notifica: Omit<Notifica, 'id' | 'stato' | 'inviataIl' | 'creataIl'>,
): Notifica {
  const voce: Notifica = {
    ...notifica,
    id: nuovoId('not'),
    stato: 'in-coda',
    inviataIl: '',
    creataIl: new Date().toISOString(),
  }

  archivio.notifiche.unshift(voce)
  if (archivio.notifiche.length > 4000) archivio.notifiche.length = 4000
  return voce
}

/**
 * Programma il promemoria di una prenotazione sui canali scelti dal cliente.
 *
 * Se lo spettacolo è già entro la finestra del promemoria non si accoda nulla:
 * un avviso «inizia fra trenta minuti» spedito a film iniziato è rumore.
 */
export function programmaPromemoria(archivio: Archivio, prenotazione: Prenotazione): void {
  const cliente = prenotazione.clienteId
    ? archivio.clienti.find((voce) => voce.id === prenotazione.clienteId)
    : null

  const inizio = istanteSpettacolo(prenotazione.data, prenotazione.ora)
  const quando = new Date(inizio.getTime() - MINUTI_PROMEMORIA * 60_000)
  if (quando.getTime() <= Date.now()) return

  const canali: CanaleNotifica[] = cliente
    ? (['email', 'push', 'sms'] as const).filter((canale) => cliente.preferenze[canale])
    : ['email']

  for (const canale of canali) {
    accodaNotifica(archivio, {
      clienteId: prenotazione.clienteId ?? '',
      canale,
      tipo: 'promemoria',
      titolo: 'Il tuo film sta per iniziare',
      testo: `Lo spettacolo delle ${prenotazione.ora} inizia fra ${MINUTI_PROMEMORIA} minuti. Codice ${prenotazione.codice}.`,
      riferimento: prenotazione.codice,
      programmataPer: quando.toISOString(),
    })
  }
}

/** Notifica immediata di conferma d'ordine, per lo storico dell'area personale. */
export function annunciaConferma(archivio: Archivio, prenotazione: Prenotazione): void {
  accodaNotifica(archivio, {
    clienteId: prenotazione.clienteId ?? '',
    canale: 'email',
    tipo: 'conferma-ordine',
    titolo: 'Il tuo ordine è confermato',
    testo: `Prenotazione ${prenotazione.codice} confermata per lo spettacolo delle ${prenotazione.ora}.`,
    riferimento: prenotazione.codice,
    programmataPer: new Date().toISOString(),
  })
}

/**
 * Consegna una singola notifica sul suo canale.
 *
 * Restituisce `false` quando il canale non è collegato: chi chiama lascia la
 * notifica in coda invece di segnarla come errore, così si spedirà da sola il
 * giorno in cui il fornitore verrà configurato.
 */
async function consegna(
  archivio: Archivio,
  notifica: Notifica,
  base: string,
): Promise<boolean> {
  if (notifica.canale === 'email') {
    const prenotazione = archivio.prenotazioni.find((voce) => voce.codice === notifica.riferimento)
    if (!prenotazione) return false

    const film = archivio.film.find((voce) => voce.id === prenotazione.filmId)
    const cinema = archivio.cinema.find((voce) => voce.id === prenotazione.cinemaId)

    if (notifica.tipo === 'promemoria') {
      return inviaPromemoria(
        prenotazione,
        film,
        cinema,
        archivio.impostazioni,
        base,
        MINUTI_PROMEMORIA,
      )
    }

    // Le altre email partono al momento dell'evento che le genera: in coda
    // restano solo per comparire nello storico dell'area personale.
    return true
  }

  /*
   * Punto di innesto per le notifiche push.
   *
   * Servono: una chiave VAPID, gli abbonamenti push dei browser (da
   * conservare accanto al cliente) e una richiesta al servizio di push del
   * browser. Sull'app nativa il percorso è lo stesso passando da FCM o APNs.
   * Finché non c'è, la notifica resta in coda senza far fallire lo
   * smaltimento.
   */
  if (notifica.canale === 'push') return false

  /*
   * Punto di innesto per gli SMS.
   *
   * Un `POST` alle API di Twilio o di un aggregatore italiano, con il numero
   * preso dall'anagrafica cliente. L'SMS costa per messaggio: va acceso solo
   * per i promemoria, mai per le promozioni.
   */
  return false
}

/**
 * Smaltisce la coda: spedisce tutte le notifiche scadute.
 *
 * Il tetto per giro evita che un accumulo di giorni faccia scadere per tempo
 * massimo la richiesta dello schedulatore: quelle che restano partono al giro
 * successivo.
 */
export async function smaltisciCoda(
  archivio: Archivio,
  base: string,
  massimoPerGiro = 40,
): Promise<{ inviate: number; rimaste: number }> {
  const adesso = Date.now()
  let inviate = 0

  const dovute = archivio.notifiche.filter(
    (notifica) =>
      notifica.stato === 'in-coda' && new Date(notifica.programmataPer).getTime() <= adesso,
  )

  for (const notifica of dovute.slice(0, massimoPerGiro)) {
    try {
      const esito = await consegna(archivio, notifica, base)
      if (esito) {
        notifica.stato = 'inviata'
        notifica.inviataIl = new Date().toISOString()
        inviate += 1
      }
    } catch (errore) {
      console.error('[notifiche] Consegna non riuscita:', errore)
      notifica.stato = 'errore'
    }
  }

  return { inviate, rimaste: Math.max(0, dovute.length - massimoPerGiro) }
}
