/**
 * Motore dei prezzi.
 *
 * Un solo posto calcola quanto costa un ordine, e lo calcola allo stesso modo
 * nel browser (per il riepilogo che si aggiorna mentre si sceglie) e sul
 * server (per l'importo che si incassa davvero). È una condizione necessaria,
 * non un'eleganza: due formule scritte due volte divergono al primo sconto
 * aggiunto, e il cliente si trova addebitato un totale diverso da quello che
 * ha visto.
 *
 * Il server non si fida mai del totale che arriva dal browser: lo ricalcola
 * con questa stessa funzione partendo dai dati dell'archivio, e se non
 * combacia vince il suo. Vedi `lib/prenotazioni.ts`.
 *
 * Ordine di applicazione, che è quello che determina l'importo finale:
 *
 *   1. prezzo di ogni poltrona  = base + tipologia + formato + posto + sala
 *   2. banco alimentari         (con lo sconto dell'abbonamento, se c'è)
 *   3. promozione automatica o da codice
 *   4. coupon personale
 *   5. commissioni di servizio
 *   6. punti fedeltà riscattati
 *   7. gift card
 *
 * Le promozioni valgono sui biglietti, mai sulle commissioni: quelle sono un
 * costo di incasso e scontarle significherebbe rimetterci sul servizio.
 */

import type {
  Conto,
  Coupon,
  Formato,
  Impostazioni,
  LivelloLoyalty,
  PianoAbbonamento,
  Promozione,
  RigaFood,
  RigaPrezzo,
  Sala,
  Spettacolo,
  TipoPosto,
  TipologiaBiglietto,
} from '@/lib/tipi'
import { centesimi, etichettaPosto, istanteSpettacolo } from '@/lib/utili'

/** Una poltrona scelta, prima che diventi un biglietto. */
export type SelezionePosto = {
  fila: string
  numero: number
  tipoPosto: TipoPosto
  tipologiaId: string
}

/** Tutto ciò che serve a calcolare un ordine. */
export type IngressiConto = {
  spettacolo: Spettacolo
  sala: Sala | null
  selezione: SelezionePosto[]
  tipologie: TipologiaBiglietto[]
  food: RigaFood[]
  impostazioni: Impostazioni
  /** Promozione automatica o inserita con il codice. */
  promozione?: Promozione | null
  coupon?: Coupon | null
  /** Piano dell'abbonamento attivo del cliente, se ne ha uno. */
  piano?: PianoAbbonamento | null
  /** Livello fedeltà: incide solo sui punti guadagnati. */
  livello?: LivelloLoyalty | null
  /** Punti che il cliente ha chiesto di riscattare. */
  puntiDaUsare?: number
  /** Punti effettivamente posseduti: il riscatto non può superarli. */
  puntiDisponibili?: number
  /** Saldo della gift card presentata. */
  saldoGiftCard?: number
}

/** Prezzo di una singola poltrona, con il dettaglio di come ci si arriva. */
export function prezzoPosto(
  posto: SelezionePosto,
  spettacolo: Spettacolo,
  sala: Sala | null,
  tipologie: TipologiaBiglietto[],
  impostazioni: Impostazioni,
  piano?: PianoAbbonamento | null,
): { prezzo: number; tipologia: TipologiaBiglietto | null } {
  const tipologia = tipologie.find((voce) => voce.id === posto.tipologiaId) ?? null

  const supplementoFormato = impostazioni.supplementiFormato[spettacolo.formato] ?? 0
  const supplementoPosto =
    posto.tipoPosto === 'vuoto' ? 0 : (impostazioni.supplementiPosto[posto.tipoPosto] ?? 0)

  // L'abbonamento che comprende un formato ne azzera il supplemento: è
  // esattamente il vantaggio per cui è stato sottoscritto.
  const formatoCompreso = piano?.formatiInclusi.includes(spettacolo.formato) ?? false

  const prezzo =
    spettacolo.prezzoBase +
    (tipologia?.variazione ?? 0) +
    (formatoCompreso ? 0 : supplementoFormato) +
    supplementoPosto +
    (sala?.supplemento ?? 0)

  // Una tipologia molto scontata su uno spettacolo già economico potrebbe
  // scendere sotto zero: il biglietto gratis esiste, quello che paga il cinema
  // no.
  return { prezzo: centesimi(Math.max(0, prezzo)), tipologia }
}

/**
 * Verifica se una promozione è applicabile a uno spettacolo in un dato momento.
 *
 * Il controllo sui giorni e sulle ore guarda lo spettacolo, non l'istante
 * dell'acquisto: una promozione «tutti i mercoledì» vale per i film del
 * mercoledì anche se il biglietto si compra il lunedì.
 */
export function promozioneApplicabile(
  promozione: Promozione,
  contesto: {
    spettacolo: Spettacolo
    /** Identificativo del livello fedeltà del cliente, se collegato. */
    livelloId?: string
    abbonato?: boolean
    /** Utilizzi già fatti da questo cliente. */
    utilizziCliente?: number
    adesso?: Date
  },
): { ok: true } | { ok: false; motivo: string } {
  const { spettacolo } = contesto
  const adesso = contesto.adesso ?? new Date()

  if (!promozione.attiva) return { ok: false, motivo: 'La promozione non è attiva.' }

  const oggi = adesso.toISOString().slice(0, 10)
  if (promozione.dal && oggi < promozione.dal) {
    return { ok: false, motivo: 'La promozione non è ancora iniziata.' }
  }
  if (promozione.al && oggi > promozione.al) {
    return { ok: false, motivo: 'La promozione è scaduta.' }
  }

  if (promozione.limiteUtilizzi > 0 && promozione.utilizzi >= promozione.limiteUtilizzi) {
    return { ok: false, motivo: 'La promozione ha esaurito gli utilizzi disponibili.' }
  }

  if (
    promozione.limitePerCliente > 0 &&
    (contesto.utilizziCliente ?? 0) >= promozione.limitePerCliente
  ) {
    return { ok: false, motivo: 'Hai già usato questa promozione il numero massimo di volte.' }
  }

  const giorno = istanteSpettacolo(spettacolo.data, spettacolo.ora).getDay()
  if (promozione.giorniValidi.length > 0 && !promozione.giorniValidi.includes(giorno)) {
    return { ok: false, motivo: 'La promozione non vale in questo giorno della settimana.' }
  }

  if (promozione.oraDa && spettacolo.ora < promozione.oraDa) {
    return { ok: false, motivo: `La promozione parte dalle ${promozione.oraDa}.` }
  }
  if (promozione.oraA && spettacolo.ora > promozione.oraA) {
    return { ok: false, motivo: `La promozione vale fino alle ${promozione.oraA}.` }
  }

  // Un elenco vuoto significa «nessuna restrizione»: è la convenzione usata in
  // tutta la piattaforma, e permette all'amministratore di creare una
  // promozione valida ovunque senza selezionare tutti i cinema uno per uno.
  if (promozione.cinemaIds.length > 0 && !promozione.cinemaIds.includes(spettacolo.cinemaId)) {
    return { ok: false, motivo: 'La promozione non vale in questo cinema.' }
  }
  if (promozione.filmIds.length > 0 && !promozione.filmIds.includes(spettacolo.filmId)) {
    return { ok: false, motivo: 'La promozione non vale per questo film.' }
  }
  if (promozione.formati.length > 0 && !promozione.formati.includes(spettacolo.formato)) {
    return { ok: false, motivo: `La promozione non vale per il formato ${spettacolo.formato}.` }
  }

  if (promozione.soloAbbonati && !contesto.abbonato) {
    return { ok: false, motivo: 'La promozione è riservata agli abbonati.' }
  }

  if (
    promozione.livelliRichiesti.length > 0 &&
    (!contesto.livelloId || !promozione.livelliRichiesti.includes(contesto.livelloId))
  ) {
    return { ok: false, motivo: 'La promozione è riservata a un livello CLUB superiore.' }
  }

  return { ok: true }
}

/**
 * Sconto prodotto da una promozione sui biglietti.
 *
 * Il 2x1 non dimezza il totale: toglie il più economico di ogni coppia. Con tre
 * biglietti si paga il primo e il terzo e si regala il secondo — e il regalo è
 * il meno caro dei due, non il più caro, che è il modo in cui la promozione
 * viene scritta sui volantini e l'unico che il cinema possa sostenere.
 */
function scontoPromozione(promozione: Promozione, prezziBiglietti: number[], totaleFood: number) {
  const ordinati = [...prezziBiglietti].sort((a, b) => b - a)

  switch (promozione.tipo) {
    case '2x1': {
      let sconto = 0
      for (let indice = 1; indice < ordinati.length; indice += 2) sconto += ordinati[indice]
      return centesimi(sconto)
    }
    case 'percentuale': {
      const totale = ordinati.reduce((somma, prezzo) => somma + prezzo, 0)
      return centesimi((totale * Math.min(100, Math.max(0, promozione.valore))) / 100)
    }
    case 'fisso': {
      const totale = ordinati.reduce((somma, prezzo) => somma + prezzo, 0)
      return centesimi(Math.min(totale, Math.max(0, promozione.valore)))
    }
    case 'food-omaggio':
      return centesimi(Math.min(totaleFood, Math.max(0, promozione.valore)))
    case 'punti-extra':
      // Non sconta nulla: moltiplica i punti. Se ne occupa `calcolaConto`.
      return 0
    default:
      return 0
  }
}

/** Calcola l'intero ordine. È l'unica funzione che stabilisce quanto si paga. */
export function calcolaConto(ingressi: IngressiConto): Conto {
  const {
    spettacolo,
    sala,
    selezione,
    tipologie,
    food,
    impostazioni,
    promozione,
    coupon,
    piano,
    livello,
  } = ingressi

  const righe: RigaPrezzo[] = []
  const prezziBiglietti: number[] = []

  /* 1 ── Biglietti ------------------------------------------------------- */
  for (const posto of selezione) {
    const { prezzo, tipologia } = prezzoPosto(
      posto,
      spettacolo,
      sala,
      tipologie,
      impostazioni,
      piano,
    )
    prezziBiglietti.push(prezzo)
    righe.push({
      etichetta: `Posto ${etichettaPosto(posto.fila, posto.numero)}`,
      dettaglio: [tipologia?.nome ?? 'Intero', posto.tipoPosto === 'premium' ? 'Premium' : '']
        .filter(Boolean)
        .join(' · '),
      importo: prezzo,
    })
  }

  const importoBiglietti = centesimi(prezziBiglietti.reduce((somma, prezzo) => somma + prezzo, 0))

  /* 2 ── Banco alimentari ------------------------------------------------ */
  const foodLordo = centesimi(
    food.reduce((somma, riga) => somma + riga.prezzoUnitario * riga.quantita, 0),
  )
  const scontoAbbonamentoFood =
    piano && piano.scontoFood > 0 ? centesimi((foodLordo * piano.scontoFood) / 100) : 0
  const importoFood = centesimi(foodLordo - scontoAbbonamentoFood)

  for (const riga of food) {
    righe.push({
      etichetta: riga.nome,
      dettaglio: `${riga.quantita} ×`,
      importo: centesimi(riga.prezzoUnitario * riga.quantita),
    })
  }

  /* 3-4 ── Sconti -------------------------------------------------------- */
  const scontiApplicati: { etichetta: string; importo: number }[] = []

  if (scontoAbbonamentoFood > 0 && piano) {
    scontiApplicati.push({
      etichetta: `${piano.nome}: −${piano.scontoFood}% sul banco`,
      importo: scontoAbbonamentoFood,
    })
  }

  let scontoBiglietti = 0

  if (promozione) {
    const sconto = scontoPromozione(promozione, prezziBiglietti, importoFood)
    if (sconto > 0) {
      scontoBiglietti += sconto
      scontiApplicati.push({ etichetta: promozione.titolo, importo: sconto })
    }
  }

  if (coupon && !coupon.usato) {
    const imponibile = Math.max(0, importoBiglietti - scontoBiglietti)
    const sconto =
      coupon.tipo === 'percentuale'
        ? centesimi((imponibile * Math.min(100, Math.max(0, coupon.valore))) / 100)
        : centesimi(Math.min(imponibile, Math.max(0, coupon.valore)))
    if (sconto > 0) {
      scontoBiglietti += sconto
      scontiApplicati.push({ etichetta: `Coupon ${coupon.codice}`, importo: sconto })
    }
  }

  /* 5 ── Commissioni ----------------------------------------------------- */
  // Un ordine vuoto non paga la commissione di servizio: mostrare «0,90 €» a
  // chi non ha ancora scelto nulla è solo un modo per farlo desistere.
  const commissioni =
    selezione.length === 0
      ? 0
      : centesimi(
          impostazioni.commissioneServizio +
            impostazioni.commissionePerBiglietto * selezione.length,
        )

  /* 6 ── Punti fedeltà --------------------------------------------------- */
  const imponibilePrimaDeiPunti = Math.max(
    0,
    centesimi(importoBiglietti + importoFood - scontoBiglietti + commissioni),
  )

  const puntiChiesti = Math.max(0, Math.floor(ingressi.puntiDaUsare ?? 0))
  const puntiPossibili = Math.min(puntiChiesti, Math.floor(ingressi.puntiDisponibili ?? 0))
  // Non si riscattano più punti di quanti ne servano a coprire il conto: il
  // resto resterebbe sul groppone del cliente senza dargli nulla in cambio.
  const puntiUsabili = Math.min(
    puntiPossibili,
    Math.floor(imponibilePrimaDeiPunti / Math.max(0.0001, impostazioni.valorePunto)),
  )
  const scontoPunti = centesimi(puntiUsabili * impostazioni.valorePunto)

  if (scontoPunti > 0) {
    scontiApplicati.push({
      etichetta: `${puntiUsabili} punti CLUB`,
      importo: scontoPunti,
    })
  }

  /* 7 ── Gift card ------------------------------------------------------- */
  const dopoPunti = Math.max(0, centesimi(imponibilePrimaDeiPunti - scontoPunti))
  const giftCard = centesimi(Math.min(dopoPunti, Math.max(0, ingressi.saldoGiftCard ?? 0)))

  if (giftCard > 0) {
    scontiApplicati.push({ etichetta: 'Gift card', importo: giftCard })
  }

  const totale = Math.max(0, centesimi(dopoPunti - giftCard))

  /* Punti guadagnati ------------------------------------------------------ */
  // Si guadagnano sull'importo effettivamente speso: pagare con i punti non ne
  // rigenera altri, altrimenti il circuito si autoalimenta.
  const moltiplicatoreLivello = livello?.moltiplicatore ?? 1
  const moltiplicatorePromozione =
    promozione?.tipo === 'punti-extra' ? Math.max(1, promozione.valore) : 1

  const puntiAccreditati = Math.floor(
    totale * impostazioni.puntiPerEuro * moltiplicatoreLivello * moltiplicatorePromozione,
  )

  return {
    righe,
    importoBiglietti,
    importoFood,
    sconto: centesimi(scontoBiglietti + scontoAbbonamentoFood + scontoPunti + giftCard),
    scontiApplicati,
    commissioni,
    totale,
    puntiAccreditati,
  }
}

/**
 * Prezzo «a partire da» mostrato nelle schede e negli elenchi.
 *
 * È il prezzo della poltrona più economica: intero non scontato, posto
 * standard, nessun supplemento facoltativo. Dichiarare il prezzo minimo reale
 * evita la sorpresa al checkout, che è la prima causa di carrelli abbandonati
 * in biglietteria.
 */
export function prezzoDaPartireDa(
  spettacolo: Spettacolo,
  sala: Sala | null,
  impostazioni: Impostazioni,
): number {
  return centesimi(
    Math.max(
      0,
      spettacolo.prezzoBase +
        (impostazioni.supplementiFormato[spettacolo.formato] ?? 0) +
        (sala?.supplemento ?? 0),
    ),
  )
}

/** Supplemento dichiarato di un formato, per la scheda del film. */
export function supplementoFormato(formato: Formato, impostazioni: Impostazioni): number {
  return impostazioni.supplementiFormato[formato] ?? 0
}
