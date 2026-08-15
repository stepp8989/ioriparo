import { leggi } from '@/lib/archivio'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { media } from '@/lib/utili'

/**
 * Numeri riassuntivi per la pagina iniziale del pannello e per le statistiche.
 *
 * L'aggregazione avviene qui invece che nel browser per due ragioni: il
 * pannello riceve una risposta di pochi chilobyte invece dell'intero archivio,
 * e i dati personali di clienti e prenotazioni non escono affatto.
 */

/** Etichetta `AAAA-MM` dei dodici mesi fino a oggi, dal più vecchio. */
function ultimiMesi(quanti = 12): string[] {
  const mesi: string[] = []
  const data = new Date()
  data.setDate(1)

  for (let indice = quanti - 1; indice >= 0; indice -= 1) {
    const mese = new Date(data.getFullYear(), data.getMonth() - indice, 1)
    mesi.push(`${mese.getFullYear()}-${String(mese.getMonth() + 1).padStart(2, '0')}`)
  }

  return mesi
}

/** Conta quante voci cadono in ciascun mese, secondo il campo data indicato. */
function perMese(voci: Array<Record<string, unknown>>, campo: string, mesi: string[]) {
  const conteggio = new Map(mesi.map((mese) => [mese, 0]))

  for (const voce of voci) {
    const valore = voce[campo]
    if (typeof valore !== 'string') continue
    const mese = valore.slice(0, 7)
    if (conteggio.has(mese)) conteggio.set(mese, (conteggio.get(mese) ?? 0) + 1)
  }

  return mesi.map((mese) => ({ mese, valore: conteggio.get(mese) ?? 0 }))
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const archivio = await leggi()
  const mesi = ultimiMesi()
  const oggi = new Date().toISOString().slice(0, 10)

  const veicoliVisibili = archivio.veicoli.filter((veicolo) => veicolo.visibile)
  const noleggiAttivi = archivio.noleggi.filter((noleggio) =>
    ['in-attesa', 'confermato', 'in-corso'].includes(noleggio.stato),
  )
  const recensioniPubblicate = archivio.recensioni.filter((recensione) => recensione.pubblicata)

  // Il fatturato considera solo i noleggi non annullati: contare anche quelli
  // gonfierebbe il dato con soldi mai incassati.
  const incassoNoleggi = archivio.noleggi
    .filter((noleggio) => noleggio.stato !== 'annullato')
    .reduce((somma, noleggio) => somma + noleggio.totale, 0)

  return Response.json({
    riepilogo: {
      veicoli: veicoliVisibili.length,
      veicoliTotali: archivio.veicoli.length,
      auto: veicoliVisibili.filter((veicolo) => veicolo.tipo === 'auto').length,
      moto: veicoliVisibili.filter((veicolo) => veicolo.tipo === 'moto').length,
      inVetrina: veicoliVisibili.filter((veicolo) => veicolo.inVetrina).length,
      venduti: archivio.veicoli.filter((veicolo) => veicolo.stato === 'venduto').length,
      valoreCatalogo: veicoliVisibili.reduce((somma, veicolo) => somma + veicolo.prezzo, 0),

      richiesteNuove: archivio.richieste.filter((richiesta) => richiesta.stato === 'nuova').length,
      richiesteTotali: archivio.richieste.length,

      noleggiAttivi: noleggiAttivi.length,
      noleggiTotali: archivio.noleggi.length,
      noleggiInCorso: archivio.noleggi.filter((noleggio) => noleggio.dal <= oggi && noleggio.al >= oggi && noleggio.stato !== 'annullato').length,
      incassoNoleggi,

      appuntamentiInAttesa: archivio.appuntamenti.filter(
        (appuntamento) => appuntamento.stato === 'in-attesa',
      ).length,
      appuntamentiTotali: archivio.appuntamenti.length,

      messaggiDaLeggere: archivio.messaggi.filter((messaggio) => !messaggio.letto).length,
      messaggiTotali: archivio.messaggi.length,

      clienti: archivio.clienti.length,
      iscrittiNewsletter: archivio.newsletter.length,

      recensioni: recensioniPubblicate.length,
      valutazioneMedia: media(recensioniPubblicate.map((recensione) => recensione.voto)),

      articoliPubblicati: archivio.articoli.filter((articolo) => articolo.pubblicato).length,
      offerteAttive: archivio.offerte.filter(
        (offerta) => offerta.attiva && offerta.scadenza >= oggi,
      ).length,
    },

    andamento: {
      richieste: perMese(archivio.richieste, 'creataIl', mesi),
      noleggi: perMese(archivio.noleggi, 'creatoIl', mesi),
      appuntamenti: perMese(archivio.appuntamenti, 'creatoIl', mesi),
      clienti: perMese(archivio.clienti, 'creatoIl', mesi),
    },

    ripartizioni: {
      alimentazione: raggruppa(veicoliVisibili, 'alimentazione'),
      condizione: raggruppa(veicoliVisibili, 'condizione'),
      tipoRichiesta: raggruppa(archivio.richieste, 'tipo'),
      servizioDetailing: raggruppa(archivio.appuntamenti, 'servizioNome'),
    },
  })
}

/** Conteggio per valore di un campo, ordinato dal più frequente. */
function raggruppa(voci: Array<Record<string, unknown>>, campo: string) {
  const conteggio = new Map<string, number>()

  for (const voce of voci) {
    const valore = voce[campo]
    if (typeof valore !== 'string') continue
    conteggio.set(valore, (conteggio.get(valore) ?? 0) + 1)
  }

  return [...conteggio.entries()]
    .map(([nome, valore]) => ({ nome, valore }))
    .sort((a, b) => b.valore - a.valore)
}
