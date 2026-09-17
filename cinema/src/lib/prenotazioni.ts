import 'server-only'
import { annota } from '@/lib/archivio'
import { contenutoQr } from '@/lib/biglietti'
import { accreditaPunti, riscattaPunti } from '@/lib/loyalty'
import { annunciaConferma, programmaPromemoria } from '@/lib/notifiche'
import { calcolaConto, promozioneApplicabile, type SelezionePosto } from '@/lib/prezzi'
import { capienza, trovaPosto } from '@/lib/posti'
import type {
  Archivio,
  Conto,
  Coupon,
  Disponibilita,
  GiftCard,
  PianoAbbonamento,
  Prenotazione,
  Promozione,
  RigaFood,
  Spettacolo,
} from '@/lib/tipi'
import { chiavePosto, minutiAllInizio, nuovoCodice, nuovoId } from '@/lib/utili'

/**
 * Cuore della biglietteria: disponibilità dei posti, blocco durante il
 * checkout, creazione e conferma delle prenotazioni.
 *
 * Due principi governano tutto il modulo.
 *
 * Il primo: un posto è occupato se esiste una prenotazione che lo tiene. Non
 * c'è una tabella separata dei posti venduti da mantenere allineata con le
 * prenotazioni — sarebbe una seconda verità, e prima o poi le due
 * divergerebbero lasciando poltrone invendibili o vendute due volte.
 *
 * Il secondo: il totale lo decide il server. Il browser calcola lo stesso
 * importo per mostrarlo mentre si sceglie, ma quello che si incassa viene
 * ricalcolato qui dai dati dell'archivio. Un totale che arriva dal browser è
 * un suggerimento, mai un dato.
 */

/**
 * Una prenotazione occupa i suoi posti se è pagata, oppure se è ancora in
 * attesa ma il blocco non è scaduto.
 *
 * È il punto in cui si decide che un carrello abbandonato non tiene ostaggio
 * una poltrona per sempre: passati i minuti di blocco, il posto torna
 * acquistabile senza che nessuno debba fare pulizia.
 */
export function occupaPosti(prenotazione: Prenotazione, adesso = new Date()): boolean {
  if (prenotazione.stato === 'annullata' || prenotazione.stato === 'rimborsata') return false
  if (prenotazione.stato === 'in-attesa') {
    return new Date(prenotazione.scadenzaBlocco).getTime() > adesso.getTime()
  }
  return true
}

/** Chiavi `fila-numero` dei posti non più disponibili per uno spettacolo. */
export function postiOccupati(
  archivio: Archivio,
  spettacoloId: string,
  adesso = new Date(),
  escludiPrenotazione = '',
): Set<string> {
  const occupati = new Set<string>()

  for (const prenotazione of archivio.prenotazioni) {
    if (prenotazione.spettacoloId !== spettacoloId) continue
    if (prenotazione.id === escludiPrenotazione) continue
    if (!occupaPosti(prenotazione, adesso)) continue

    for (const posto of prenotazione.posti) {
      occupati.add(chiavePosto(posto.fila, posto.numero))
    }
  }

  return occupati
}

/** Fotografia della disponibilità di uno spettacolo, per la mappa della sala. */
export function disponibilita(
  archivio: Archivio,
  spettacolo: Spettacolo,
  adesso = new Date(),
): Disponibilita {
  const sala = archivio.sale.find((voce) => voce.id === spettacolo.salaId)
  const occupati = postiOccupati(archivio, spettacolo.id, adesso)
  const totale = sala ? capienza(sala.schema) : 0

  const mancanti = minutiAllInizio(spettacolo.data, spettacolo.ora, adesso)

  return {
    spettacoloId: spettacolo.id,
    occupati: [...occupati],
    liberi: Math.max(0, totale - occupati.size),
    totale,
    venditaChiusa:
      spettacolo.stato === 'annullato' ||
      mancanti < archivio.impostazioni.chiusuraVenditaMinuti,
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * Costruzione di un ordine
 * ────────────────────────────────────────────────────────────────────── */

export type RichiestaOrdine = {
  spettacoloId: string
  selezione: SelezionePosto[]
  food: RigaFood[]
  promoCodice: string
  giftCardCodice: string
  puntiDaUsare: number
  clienteId: string | null
  ospite: { nome: string; email: string; telefono: string } | null
}

export type EsitoOrdine =
  | { ok: false; errore: string; stato: number }
  | {
      ok: true
      conto: Conto
      spettacolo: Spettacolo
      promozione: Promozione | null
      coupon: Coupon | null
      giftCard: GiftCard | null
      piano: PianoAbbonamento | null
      /** Posti con prezzo e tipologia già risolti, pronti a diventare biglietti. */
      posti: (SelezionePosto & { prezzo: number; tipologiaNome: string })[]
      /**
       * Righe del banco con nome e prezzo presi dal listino.
       *
       * Devono uscire da qui: quelle che arrivano dal browser portano solo
       * l'identificativo del prodotto e la quantità, perché nome e prezzo non
       * si accettano dall'esterno. Copiando quelle nella prenotazione si
       * salverebbero righe senza nome e a prezzo zero — il totale resterebbe
       * giusto, ma il biglietto e le statistiche del banco no.
       */
      food: RigaFood[]
    }

/**
 * Valida una richiesta d'ordine e ne calcola il conto, senza scrivere nulla.
 *
 * È usata sia dal riepilogo (che chiede «quanto verrebbe») sia dalla creazione
 * vera e propria: la stessa funzione, così il prezzo mostrato un istante prima
 * del pagamento è quello che si paga.
 */
export function valutaOrdine(
  archivio: Archivio,
  richiesta: RichiestaOrdine,
  adesso = new Date(),
  escludiPrenotazione = '',
): EsitoOrdine {
  const { impostazioni } = archivio

  const spettacolo = archivio.spettacoli.find((voce) => voce.id === richiesta.spettacoloId)
  if (!spettacolo) return { ok: false, errore: 'Spettacolo non trovato.', stato: 404 }
  if (spettacolo.stato === 'annullato') {
    return { ok: false, errore: 'Lo spettacolo è stato annullato.', stato: 409 }
  }

  const mancanti = minutiAllInizio(spettacolo.data, spettacolo.ora, adesso)
  if (mancanti < impostazioni.chiusuraVenditaMinuti) {
    return {
      ok: false,
      errore: 'La vendita online per questo spettacolo è chiusa. I biglietti sono acquistabili in cassa.',
      stato: 409,
    }
  }

  if (richiesta.selezione.length === 0) {
    return { ok: false, errore: 'Nessun posto selezionato.', stato: 400 }
  }
  if (richiesta.selezione.length > impostazioni.postiMassimiPerOrdine) {
    return {
      ok: false,
      errore: `Si possono acquistare al massimo ${impostazioni.postiMassimiPerOrdine} posti per ordine.`,
      stato: 400,
    }
  }

  const sala = archivio.sale.find((voce) => voce.id === spettacolo.salaId) ?? null
  if (!sala) return { ok: false, errore: 'Sala non configurata.', stato: 409 }

  /* Posti: esistono? sono liberi? non sono duplicati? ---------------------- */
  const occupati = postiOccupati(archivio, spettacolo.id, adesso, escludiPrenotazione)
  const visti = new Set<string>()

  const selezioneRisolta: SelezionePosto[] = []

  for (const scelta of richiesta.selezione) {
    const chiave = chiavePosto(scelta.fila, scelta.numero)

    if (visti.has(chiave)) {
      return { ok: false, errore: `Il posto ${chiave} è stato indicato due volte.`, stato: 400 }
    }
    visti.add(chiave)

    const posto = trovaPosto(sala.schema, scelta.fila, scelta.numero)
    if (!posto) {
      return { ok: false, errore: `Il posto ${chiave} non esiste in questa sala.`, stato: 400 }
    }
    if (occupati.has(chiave)) {
      return {
        ok: false,
        errore: `Il posto ${chiave} è appena stato occupato da qualcun altro. Sceglietene un altro.`,
        stato: 409,
      }
    }

    // Il tipo di poltrona lo dice lo schema della sala, non il browser: da
    // lì dipende il supplemento, e accettarlo dall'esterno significherebbe
    // lasciar comprare una poltrona premium al prezzo di una standard.
    selezioneRisolta.push({
      fila: scelta.fila,
      numero: scelta.numero,
      tipoPosto: posto.tipo,
      tipologiaId: scelta.tipologiaId,
    })
  }

  /* Tipologie di biglietto ------------------------------------------------ */
  const tipologie = archivio.tipologieBiglietto.filter((voce) => voce.attiva)

  for (const scelta of selezioneRisolta) {
    const tipologia = tipologie.find((voce) => voce.id === scelta.tipologiaId)
    if (!tipologia) {
      return { ok: false, errore: 'Tipologia di biglietto non valida.', stato: 400 }
    }
  }

  for (const tipologia of tipologie) {
    if (tipologia.massimoPerOrdine <= 0) continue
    const quanti = selezioneRisolta.filter((voce) => voce.tipologiaId === tipologia.id).length
    if (quanti > tipologia.massimoPerOrdine) {
      return {
        ok: false,
        errore: `Si possono acquistare al massimo ${tipologia.massimoPerOrdine} biglietti «${tipologia.nome}» per ordine.`,
        stato: 400,
      }
    }
  }

  /* Banco alimentari: prezzi presi dal listino, mai dal browser ----------- */
  const food: RigaFood[] = []

  for (const riga of richiesta.food) {
    const prodotto = archivio.food.find((voce) => voce.id === riga.prodottoId)
    if (!prodotto || !prodotto.disponibile) continue
    if (prodotto.cinemaIds.length > 0 && !prodotto.cinemaIds.includes(spettacolo.cinemaId)) {
      return {
        ok: false,
        errore: `«${prodotto.nome}» non è disponibile in questo cinema.`,
        stato: 400,
      }
    }

    const quantita = Math.max(0, Math.min(20, Math.trunc(riga.quantita)))
    if (quantita === 0) continue

    food.push({
      prodottoId: prodotto.id,
      nome: prodotto.nome,
      quantita,
      prezzoUnitario: prodotto.prezzo,
    })
  }

  /* Cliente, abbonamento e livello fedeltà -------------------------------- */
  const cliente = richiesta.clienteId
    ? (archivio.clienti.find((voce) => voce.id === richiesta.clienteId) ?? null)
    : null

  const sottoscrizione = cliente
    ? (archivio.sottoscrizioni.find(
        (voce) =>
          voce.clienteId === cliente.id &&
          voce.stato === 'attiva' &&
          voce.dal <= spettacolo.data &&
          voce.al >= spettacolo.data,
      ) ?? null)
    : null

  const piano = sottoscrizione
    ? (archivio.piani.find((voce) => voce.id === sottoscrizione.pianoId) ?? null)
    : null

  const livello = cliente
    ? (archivio.livelliLoyalty.find((voce) => voce.id === cliente.livelloId) ?? null)
    : null

  /* Promozione o coupon --------------------------------------------------- */
  let promozione: Promozione | null = null
  let coupon: Coupon | null = null

  const codice = richiesta.promoCodice.trim().toUpperCase()

  if (codice) {
    coupon = archivio.coupon.find((voce) => voce.codice === codice) ?? null

    if (coupon) {
      if (coupon.usato) return { ok: false, errore: 'Coupon già utilizzato.', stato: 409 }
      if (coupon.scadenza && coupon.scadenza < spettacolo.data) {
        return { ok: false, errore: 'Coupon scaduto.', stato: 409 }
      }
      if (coupon.clienteId && coupon.clienteId !== richiesta.clienteId) {
        return { ok: false, errore: 'Questo coupon è intestato a un altro account.', stato: 403 }
      }
    } else {
      promozione = archivio.promozioni.find((voce) => voce.codice === codice) ?? null
      if (!promozione) {
        return { ok: false, errore: 'Codice non riconosciuto.', stato: 404 }
      }

      const utilizziCliente = richiesta.clienteId
        ? archivio.prenotazioni.filter(
            (voce) =>
              voce.clienteId === richiesta.clienteId &&
              voce.promoCodice === codice &&
              voce.stato !== 'annullata',
          ).length
        : 0

      const esito = promozioneApplicabile(promozione, {
        spettacolo,
        livelloId: cliente?.livelloId,
        abbonato: Boolean(piano),
        utilizziCliente,
        adesso,
      })

      if (!esito.ok) return { ok: false, errore: esito.motivo, stato: 409 }
    }
  }

  // Le promozioni senza codice si applicano da sole: è quello che il pubblico
  // si aspetta da un «mercoledì al cinema», e costringerlo a scrivere una
  // parola magica per ottenerlo serve solo a farlo pagare di più per
  // distrazione. Fra quelle valide vince la più conveniente.
  if (!promozione && !coupon) {
    const automatiche = archivio.promozioni.filter(
      (voce) =>
        voce.attiva &&
        !voce.codice &&
        promozioneApplicabile(voce, {
          spettacolo,
          livelloId: cliente?.livelloId,
          abbonato: Boolean(piano),
          adesso,
        }).ok,
    )

    let miglioreSconto = 0
    for (const candidata of automatiche) {
      const prova = calcolaConto({
        spettacolo,
        sala,
        selezione: selezioneRisolta,
        tipologie,
        food,
        impostazioni,
        promozione: candidata,
        piano,
        livello,
      })
      if (prova.sconto > miglioreSconto) {
        miglioreSconto = prova.sconto
        promozione = candidata
      }
    }
  }

  /* Gift card -------------------------------------------------------------- */
  let giftCard: GiftCard | null = null
  const codiceGift = richiesta.giftCardCodice.trim().toUpperCase()

  if (codiceGift) {
    giftCard = archivio.giftCard.find((voce) => voce.codice === codiceGift) ?? null
    if (!giftCard) return { ok: false, errore: 'Gift card non riconosciuta.', stato: 404 }
    if (giftCard.stato === 'annullata') {
      return { ok: false, errore: 'Gift card annullata.', stato: 409 }
    }
    if (giftCard.stato === 'programmata') {
      return { ok: false, errore: 'Gift card non ancora attiva.', stato: 409 }
    }
    if (giftCard.saldo <= 0) {
      return { ok: false, errore: 'Gift card esaurita.', stato: 409 }
    }
  }

  /* Conto ------------------------------------------------------------------ */
  const conto = calcolaConto({
    spettacolo,
    sala,
    selezione: selezioneRisolta,
    tipologie,
    food,
    impostazioni,
    promozione,
    coupon,
    piano,
    livello,
    puntiDaUsare: richiesta.puntiDaUsare,
    puntiDisponibili: cliente?.punti ?? 0,
    saldoGiftCard: giftCard?.saldo ?? 0,
  })

  const posti = selezioneRisolta.map((scelta, indice) => ({
    ...scelta,
    prezzo: conto.righe[indice]?.importo ?? 0,
    tipologiaNome: tipologie.find((voce) => voce.id === scelta.tipologiaId)?.nome ?? 'Intero',
  }))

  return { ok: true, conto, spettacolo, promozione, coupon, giftCard, piano, posti, food }
}

/* ─────────────────────────────────────────────────────────────────────────
 * Creazione e conferma
 * ────────────────────────────────────────────────────────────────────── */

/** Codice di prenotazione non ancora in uso. */
export function codiceLibero(archivio: Archivio, lunghezza = 6): string {
  for (let tentativo = 0; tentativo < 40; tentativo += 1) {
    const codice = nuovoCodice(lunghezza)
    if (!archivio.prenotazioni.some((voce) => voce.codice === codice)) return codice
  }
  // Dopo quaranta collisioni l'alfabeto scelto è troppo stretto per il numero
  // di prenotazioni esistenti: si allunga il codice invece di insistere.
  return nuovoCodice(lunghezza + 2)
}

/**
 * Crea una prenotazione in attesa di pagamento, bloccando i posti.
 *
 * La prenotazione nasce sempre `in-attesa`: è la conferma del pagamento a
 * emettere i biglietti. Così un pagamento che non va a buon fine non lascia in
 * giro biglietti validi, e i posti si liberano da soli alla scadenza del
 * blocco.
 */
export function creaPrenotazione(
  archivio: Archivio,
  richiesta: RichiestaOrdine,
  esito: Extract<EsitoOrdine, { ok: true }>,
  adesso = new Date(),
): Prenotazione {
  const { spettacolo, conto, posti, food } = esito

  const codice = codiceLibero(archivio)
  const scadenza = new Date(
    adesso.getTime() + archivio.impostazioni.minutiBloccoPosti * 60_000,
  ).toISOString()

  const prenotazione: Prenotazione = {
    id: nuovoId('pre'),
    codice,
    clienteId: richiesta.clienteId,
    ospite: richiesta.clienteId ? null : richiesta.ospite,
    spettacoloId: spettacolo.id,
    filmId: spettacolo.filmId,
    cinemaId: spettacolo.cinemaId,
    salaId: spettacolo.salaId,
    data: spettacolo.data,
    ora: spettacolo.ora,
    posti: posti.map((posto) => ({
      fila: posto.fila,
      numero: posto.numero,
      tipoPosto: posto.tipoPosto,
      tipologiaId: posto.tipologiaId,
      tipologiaNome: posto.tipologiaNome,
      prezzo: posto.prezzo,
      // Dieci caratteri: il codice del singolo biglietto non viene mai dettato
      // a voce, quindi può permettersi di essere lungo, e più è lungo meno
      // senso ha provare a indovinarlo.
      codiceBiglietto: nuovoCodice(10),
      utilizzatoIl: null,
    })),
    food: food.map((riga) => ({ ...riga })),
    importoBiglietti: conto.importoBiglietti,
    importoFood: conto.importoFood,
    sconto: conto.sconto,
    scontiApplicati: conto.scontiApplicati,
    commissioni: conto.commissioni,
    totale: conto.totale,
    promoCodice: esito.promozione?.codice || esito.coupon?.codice || null,
    giftCardCodice: esito.giftCard?.codice ?? null,
    puntiUsati: 0,
    puntiAccreditati: conto.puntiAccreditati,
    pagamento: {
      metodo: 'carta',
      stato: 'in-attesa',
      riferimento: '',
      importo: conto.totale,
      creatoIl: adesso.toISOString(),
    },
    stato: 'in-attesa',
    scadenzaBlocco: scadenza,
    creataIl: adesso.toISOString(),
    aggiornataIl: adesso.toISOString(),
  }

  // I punti riscattati si scalano solo alla conferma del pagamento: scalarli
  // adesso significherebbe toglierli a chi abbandona il carrello.
  const scontoPunti = conto.scontiApplicati.find((voce) => voce.etichetta.endsWith('punti CLUB'))
  if (scontoPunti) {
    prenotazione.puntiUsati = Math.round(
      scontoPunti.importo / Math.max(0.0001, archivio.impostazioni.valorePunto),
    )
  }

  archivio.prenotazioni.unshift(prenotazione)
  return prenotazione
}

/** Contenuto dei QR di una prenotazione, uno per posto. */
export function qrDellaPrenotazione(prenotazione: Prenotazione): { posto: string; qr: string }[] {
  return prenotazione.posti.map((posto) => ({
    posto: `${posto.fila}${posto.numero}`,
    qr: contenutoQr(prenotazione.codice, posto.codiceBiglietto),
  }))
}

/* ─────────────────────────────────────────────────────────────────────────
 * Conferma, annullamento e pulizia
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Conferma il pagamento: è il momento in cui i biglietti diventano validi.
 *
 * Qui si consumano davvero punti, gift card e coupon. Farlo solo adesso, e non
 * alla creazione dell'ordine, significa che un pagamento abbandonato non
 * brucia nulla: il cliente ritrova i suoi punti e la sua gift card intatti.
 *
 * La funzione è scritta per essere invocabile più volte senza danno — i
 * riscontri dei fornitori di pagamento arrivano spesso in doppia copia, e una
 * seconda chiamata non deve accreditare i punti due volte.
 */
export function confermaPagamento(
  archivio: Archivio,
  prenotazione: Prenotazione,
  metodo: Prenotazione['pagamento']['metodo'],
  riferimento: string,
  adesso = new Date(),
): { giaConfermata: boolean } {
  if (prenotazione.stato === 'confermata' || prenotazione.stato === 'utilizzata') {
    return { giaConfermata: true }
  }

  prenotazione.pagamento = {
    metodo,
    stato: 'riuscito',
    riferimento,
    importo: prenotazione.totale,
    creatoIl: adesso.toISOString(),
  }
  prenotazione.stato = 'confermata'
  prenotazione.aggiornataIl = adesso.toISOString()

  /* Punti riscattati ------------------------------------------------------- */
  if (prenotazione.clienteId && prenotazione.puntiUsati > 0) {
    const riuscito = riscattaPunti(
      archivio,
      prenotazione.clienteId,
      prenotazione.puntiUsati,
      'Sconto su prenotazione',
      prenotazione.codice,
    )
    // Se i punti nel frattempo non ci sono più, la prenotazione resta valida:
    // il cliente ha pagato la differenza e il cinema ha incassato. Si annota
    // il fatto perché è un'anomalia da guardare, non da nascondere.
    if (!riuscito) {
      prenotazione.puntiUsati = 0
      annota(
        archivio,
        'sistema',
        'punti-insufficienti',
        prenotazione.codice,
        'Sconto punti applicato ma saldo non più capiente al momento della conferma.',
      )
    }
  }

  /* Punti guadagnati ------------------------------------------------------- */
  if (prenotazione.clienteId && prenotazione.puntiAccreditati > 0) {
    accreditaPunti(
      archivio,
      prenotazione.clienteId,
      prenotazione.puntiAccreditati,
      'Acquisto biglietti',
      prenotazione.codice,
    )
  }

  /* Gift card -------------------------------------------------------------- */
  if (prenotazione.giftCardCodice) {
    const giftCard = archivio.giftCard.find((voce) => voce.codice === prenotazione.giftCardCodice)
    const usata = prenotazione.scontiApplicati.find((voce) => voce.etichetta === 'Gift card')

    if (giftCard && usata) {
      const importo = Math.min(giftCard.saldo, usata.importo)
      giftCard.saldo = Math.round((giftCard.saldo - importo) * 100) / 100
      giftCard.movimenti.unshift({
        importo,
        prenotazioneId: prenotazione.codice,
        creatoIl: adesso.toISOString(),
      })
      if (giftCard.saldo <= 0) giftCard.stato = 'esaurita'
    }
  }

  /* Coupon e promozioni ---------------------------------------------------- */
  if (prenotazione.promoCodice) {
    const coupon = archivio.coupon.find((voce) => voce.codice === prenotazione.promoCodice)
    if (coupon) {
      coupon.usato = true
      coupon.usatoIl = adesso.toISOString()
      coupon.prenotazioneId = prenotazione.codice
    } else {
      const promozione = archivio.promozioni.find(
        (voce) => voce.codice === prenotazione.promoCodice,
      )
      if (promozione) promozione.utilizzi += 1
    }
  }

  // Le promozioni automatiche non hanno codice ma vanno comunque contate.
  for (const sconto of prenotazione.scontiApplicati) {
    const automatica = archivio.promozioni.find(
      (voce) => !voce.codice && voce.titolo === sconto.etichetta,
    )
    if (automatica) automatica.utilizzi += 1
  }

  /* Abbonamento ------------------------------------------------------------ */
  if (prenotazione.clienteId) {
    const sottoscrizione = archivio.sottoscrizioni.find(
      (voce) =>
        voce.clienteId === prenotazione.clienteId &&
        voce.stato === 'attiva' &&
        voce.dal <= prenotazione.data &&
        voce.al >= prenotazione.data,
    )
    if (sottoscrizione) sottoscrizione.ingressiUsati += prenotazione.posti.length
  }

  /* Notifiche -------------------------------------------------------------- */
  annunciaConferma(archivio, prenotazione)
  programmaPromemoria(archivio, prenotazione)

  annota(
    archivio,
    prenotazione.clienteId ?? 'ospite',
    'pagamento-confermato',
    prenotazione.codice,
    `${prenotazione.posti.length} posti, ${prenotazione.totale.toFixed(2)} € con ${metodo}.`,
  )

  return { giaConfermata: false }
}

/**
 * Annulla una prenotazione e restituisce quello che il cliente aveva speso in
 * punti e gift card.
 *
 * Il rimborso del denaro non avviene qui: va fatto dal cruscotto del fornitore
 * di pagamento, che è l'unico posto in cui può avvenire davvero. Questa
 * funzione libera i posti e riporta indietro i valori interni; `rimborsata`
 * segnala che anche il denaro è stato restituito.
 */
export function annullaPrenotazione(
  archivio: Archivio,
  prenotazione: Prenotazione,
  motivo: string,
  attore: string,
  rimborsata = false,
  adesso = new Date(),
): void {
  if (prenotazione.stato === 'annullata' || prenotazione.stato === 'rimborsata') return

  const eraConfermata = prenotazione.stato === 'confermata' || prenotazione.stato === 'utilizzata'

  prenotazione.stato = rimborsata ? 'rimborsata' : 'annullata'
  prenotazione.aggiornataIl = adesso.toISOString()
  if (rimborsata) prenotazione.pagamento.stato = 'rimborsato'

  if (eraConfermata) {
    // Punti: si restituiscono quelli riscattati e si tolgono quelli guadagnati.
    if (prenotazione.clienteId) {
      if (prenotazione.puntiUsati > 0) {
        accreditaPunti(
          archivio,
          prenotazione.clienteId,
          prenotazione.puntiUsati,
          'Restituzione per annullamento',
          prenotazione.codice,
        )
      }
      if (prenotazione.puntiAccreditati > 0) {
        riscattaPunti(
          archivio,
          prenotazione.clienteId,
          prenotazione.puntiAccreditati,
          'Storno per annullamento',
          prenotazione.codice,
        )
      }
    }

    // Gift card: torna il credito consumato.
    if (prenotazione.giftCardCodice) {
      const giftCard = archivio.giftCard.find((voce) => voce.codice === prenotazione.giftCardCodice)
      const movimento = giftCard?.movimenti.find(
        (voce) => voce.prenotazioneId === prenotazione.codice,
      )
      if (giftCard && movimento) {
        giftCard.saldo = Math.round((giftCard.saldo + movimento.importo) * 100) / 100
        giftCard.movimenti = giftCard.movimenti.filter((voce) => voce !== movimento)
        if (giftCard.stato === 'esaurita' && giftCard.saldo > 0) giftCard.stato = 'attiva'
      }
    }

    // Coupon: torna spendibile.
    if (prenotazione.promoCodice) {
      const coupon = archivio.coupon.find((voce) => voce.codice === prenotazione.promoCodice)
      if (coupon && coupon.prenotazioneId === prenotazione.codice) {
        coupon.usato = false
        coupon.usatoIl = ''
        coupon.prenotazioneId = ''
      } else {
        const promozione = archivio.promozioni.find(
          (voce) => voce.codice === prenotazione.promoCodice,
        )
        if (promozione && promozione.utilizzi > 0) promozione.utilizzi -= 1
      }
    }
  }

  // Le notifiche non ancora partite vanno tolte: un promemoria per uno
  // spettacolo annullato è peggio di nessun promemoria.
  for (const notifica of archivio.notifiche) {
    if (notifica.riferimento === prenotazione.codice && notifica.stato === 'in-coda') {
      notifica.stato = 'errore'
    }
  }

  annota(archivio, attore, rimborsata ? 'rimborso' : 'annullamento', prenotazione.codice, motivo)
}

/**
 * Elimina le prenotazioni mai pagate e ormai scadute.
 *
 * Non è indispensabile — `occupaPosti` le ignora comunque — ma tenerle
 * all'infinito gonfia l'archivio e sporca le statistiche di vendita. Si
 * conservano ventiquattr'ore, il tempo di accorgersi di un pagamento rimasto
 * in sospeso.
 */
export function ripulisciScadute(archivio: Archivio, adesso = new Date()): number {
  const limite = adesso.getTime() - 24 * 3_600_000
  const prima = archivio.prenotazioni.length

  archivio.prenotazioni = archivio.prenotazioni.filter((prenotazione) => {
    if (prenotazione.stato !== 'in-attesa') return true
    return new Date(prenotazione.scadenzaBlocco).getTime() > limite
  })

  return prima - archivio.prenotazioni.length
}
