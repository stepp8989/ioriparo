import type { Archivio, Prenotazione } from '@/lib/tipi'
import { capienza } from '@/lib/posti'
import { centesimi, oggiIso, sommaGiorni } from '@/lib/utili'

/**
 * Statistiche di vendita.
 *
 * Tutto si calcola a partire dalle prenotazioni: non esiste una tabella di
 * riepiloghi da tenere aggiornata, perché sarebbe una seconda verità che prima
 * o poi smetterebbe di combaciare con la prima. Su un archivio di qualche
 * decina di migliaia di righe il calcolo al volo è istantaneo; quando non lo
 * sarà più, il posto giusto per i riepiloghi precalcolati è il database, non
 * questo file.
 *
 * Una scelta che conta: gli incassi contano solo le prenotazioni pagate. Le
 * prenotazioni in attesa non sono soldi, sono intenzioni, e sommarle
 * gonfierebbe ogni numero del cruscotto.
 */

export type Periodo = 'giorno' | 'settimana' | 'mese' | 'anno'

export type Filtro = {
  periodo?: Periodo
  cinemaId?: string
  filmId?: string
  /** Data di riferimento; in mancanza, oggi. */
  al?: string
}

/** Vero se la prenotazione rappresenta un incasso reale. */
function incassata(prenotazione: Prenotazione): boolean {
  return prenotazione.stato === 'confermata' || prenotazione.stato === 'utilizzata'
}

function giorniDelPeriodo(periodo: Periodo): number {
  switch (periodo) {
    case 'giorno':
      return 1
    case 'settimana':
      return 7
    case 'mese':
      return 30
    default:
      return 365
  }
}

export function calcolaStatistiche(archivio: Archivio, filtro: Filtro = {}) {
  const periodo = filtro.periodo ?? 'settimana'
  const al = filtro.al ?? oggiIso()
  const giorni = giorniDelPeriodo(periodo)
  const dal = sommaGiorni(al, -(giorni - 1))

  const nelPeriodo = archivio.prenotazioni.filter((prenotazione) => {
    if (prenotazione.data < dal || prenotazione.data > al) return false
    if (filtro.cinemaId && prenotazione.cinemaId !== filtro.cinemaId) return false
    if (filtro.filmId && prenotazione.filmId !== filtro.filmId) return false
    return true
  })

  const pagate = nelPeriodo.filter(incassata)

  /* ── Totali ─────────────────────────────────────────────────────────── */
  const biglietti = pagate.reduce((somma, voce) => somma + voce.posti.length, 0)
  const incassoBiglietti = centesimi(pagate.reduce((somma, voce) => somma + voce.importoBiglietti, 0))
  const incassoFood = centesimi(pagate.reduce((somma, voce) => somma + voce.importoFood, 0))
  const commissioni = centesimi(pagate.reduce((somma, voce) => somma + voce.commissioni, 0))
  const sconti = centesimi(pagate.reduce((somma, voce) => somma + voce.sconto, 0))
  const incasso = centesimi(pagate.reduce((somma, voce) => somma + voce.totale, 0))

  /* ── Serie giornaliera ──────────────────────────────────────────────── */
  const serie = Array.from({ length: giorni }, (_, indice) => {
    const data = sommaGiorni(dal, indice)
    const delGiorno = pagate.filter((voce) => voce.data === data)
    return {
      data,
      incasso: centesimi(delGiorno.reduce((somma, voce) => somma + voce.totale, 0)),
      biglietti: delGiorno.reduce((somma, voce) => somma + voce.posti.length, 0),
    }
  })

  /* ── Classifiche ────────────────────────────────────────────────────── */
  const perFilm = new Map<string, { biglietti: number; incasso: number }>()
  const perOra = new Map<string, number>()
  const perCinema = new Map<string, { biglietti: number; incasso: number }>()
  const foodVenduto = new Map<string, { quantita: number; incasso: number }>()
  const couponUsati = new Map<string, number>()

  for (const prenotazione of pagate) {
    const film = perFilm.get(prenotazione.filmId) ?? { biglietti: 0, incasso: 0 }
    film.biglietti += prenotazione.posti.length
    film.incasso = centesimi(film.incasso + prenotazione.importoBiglietti)
    perFilm.set(prenotazione.filmId, film)

    perOra.set(prenotazione.ora, (perOra.get(prenotazione.ora) ?? 0) + prenotazione.posti.length)

    const cinema = perCinema.get(prenotazione.cinemaId) ?? { biglietti: 0, incasso: 0 }
    cinema.biglietti += prenotazione.posti.length
    cinema.incasso = centesimi(cinema.incasso + prenotazione.totale)
    perCinema.set(prenotazione.cinemaId, cinema)

    for (const riga of prenotazione.food) {
      const voce = foodVenduto.get(riga.prodottoId) ?? { quantita: 0, incasso: 0 }
      voce.quantita += riga.quantita
      voce.incasso = centesimi(voce.incasso + riga.prezzoUnitario * riga.quantita)
      foodVenduto.set(riga.prodottoId, voce)
    }

    if (prenotazione.promoCodice) {
      couponUsati.set(
        prenotazione.promoCodice,
        (couponUsati.get(prenotazione.promoCodice) ?? 0) + 1,
      )
    }
  }

  const nomeFilm = new Map(archivio.film.map((voce) => [voce.id, voce.titolo]))
  const nomeCinema = new Map(archivio.cinema.map((voce) => [voce.id, voce.nome]))
  const nomeFood = new Map(archivio.food.map((voce) => [voce.id, voce.nome]))

  /* ── Occupazione delle sale ─────────────────────────────────────────── */
  const spettacoliPeriodo = archivio.spettacoli.filter((spettacolo) => {
    if (spettacolo.data < dal || spettacolo.data > al) return false
    if (spettacolo.stato === 'annullato') return false
    if (filtro.cinemaId && spettacolo.cinemaId !== filtro.cinemaId) return false
    if (filtro.filmId && spettacolo.filmId !== filtro.filmId) return false
    return true
  })

  const salePerId = new Map(archivio.sale.map((sala) => [sala.id, sala]))
  const postiOfferti = spettacoliPeriodo.reduce((somma, spettacolo) => {
    const sala = salePerId.get(spettacolo.salaId)
    return somma + (sala ? capienza(sala.schema) : 0)
  }, 0)

  /* ── Pubblico ───────────────────────────────────────────────────────── */
  const nuoviClienti = archivio.clienti.filter(
    (cliente) => cliente.creatoIl.slice(0, 10) >= dal && cliente.creatoIl.slice(0, 10) <= al,
  ).length

  const abbonamentiAttivi = archivio.sottoscrizioni.filter((voce) => voce.stato === 'attiva').length

  // Presenze effettive contro biglietti venduti: la differenza è il tasso di
  // mancata presenza, uno dei pochi numeri su cui una sala possa agire davvero.
  const ingressi = pagate.reduce(
    (somma, voce) => somma + voce.posti.filter((posto) => posto.utilizzatoIl).length,
    0,
  )

  const classifica = <T,>(mappa: Map<string, T>, nomi: Map<string, string>, chiave: (voce: T) => number) =>
    [...mappa.entries()]
      .map(([id, voce]) => ({ id, nome: nomi.get(id) ?? id, ...voce }))
      .sort((a, b) => chiave(b as T) - chiave(a as T))
      .slice(0, 10)

  return {
    periodo,
    dal,
    al,
    totali: {
      ordini: pagate.length,
      biglietti,
      incasso,
      incassoBiglietti,
      incassoFood,
      commissioni,
      sconti,
      scontrinoMedio: pagate.length > 0 ? centesimi(incasso / pagate.length) : 0,
      annullate: nelPeriodo.filter((voce) => voce.stato === 'annullata').length,
      rimborsate: nelPeriodo.filter((voce) => voce.stato === 'rimborsata').length,
      inAttesa: nelPeriodo.filter((voce) => voce.stato === 'in-attesa').length,
    },
    serie,
    occupazione: {
      postiOfferti,
      postiVenduti: biglietti,
      percentuale: postiOfferti > 0 ? Math.round((biglietti / postiOfferti) * 1000) / 10 : 0,
      spettacoli: spettacoliPeriodo.length,
    },
    presenze: {
      ingressi,
      biglietti,
      mancatePresenze: Math.max(0, biglietti - ingressi),
      percentuale: biglietti > 0 ? Math.round((ingressi / biglietti) * 1000) / 10 : 0,
    },
    film: classifica(perFilm, nomeFilm, (voce) => (voce as { biglietti: number }).biglietti),
    cinema: classifica(perCinema, nomeCinema, (voce) => (voce as { incasso: number }).incasso),
    food: classifica(foodVenduto, nomeFood, (voce) => (voce as { quantita: number }).quantita),
    orari: [...perOra.entries()]
      .map(([ora, biglietti]) => ({ ora, biglietti }))
      .sort((a, b) => a.ora.localeCompare(b.ora)),
    coupon: [...couponUsati.entries()]
      .map(([codice, utilizzi]) => ({ codice, utilizzi }))
      .sort((a, b) => b.utilizzi - a.utilizzi)
      .slice(0, 10),
    pubblico: {
      nuoviClienti,
      clientiTotali: archivio.clienti.length,
      abbonamentiAttivi,
      puntiInCircolazione: archivio.clienti.reduce((somma, cliente) => somma + cliente.punti, 0),
    },
  }
}

export type Statistiche = ReturnType<typeof calcolaStatistiche>
