/**
 * Programma fedeltà «CLUB».
 *
 * I livelli non sono scritti nel codice: stanno nell'archivio e
 * l'amministratore li aggiunge, rinomina e ritara dal pannello. Qui c'è solo
 * la meccanica — come si sale, quanto si guadagna, quanto vale un punto — e
 * nessuna soglia numerica.
 *
 * Una scelta di fondo: il livello si calcola sui punti accumulati da sempre
 * (`puntiStorici`), non su quelli ancora a disposizione. Chi riscatta i punti
 * non deve retrocedere di livello per averlo fatto, altrimenti il programma
 * insegna a non usarli — che è l'opposto di quello per cui esiste.
 */

import type { Archivio, Cliente, LivelloLoyalty, MovimentoPunti, PremioLoyalty } from '@/lib/tipi'
import { nuovoId } from '@/lib/utili'

/** Livelli ordinati dal più basso al più alto. */
export function livelliOrdinati(livelli: LivelloLoyalty[]): LivelloLoyalty[] {
  return [...livelli].sort((a, b) =>
    a.puntiMinimi === b.puntiMinimi ? a.ordine - b.ordine : a.puntiMinimi - b.puntiMinimi,
  )
}

/** Livello che spetta a un totale di punti accumulati. */
export function livelloPerPunti(
  livelli: LivelloLoyalty[],
  puntiStorici: number,
): LivelloLoyalty | null {
  const ordinati = livelliOrdinati(livelli)
  let raggiunto: LivelloLoyalty | null = ordinati[0] ?? null

  for (const livello of ordinati) {
    if (puntiStorici >= livello.puntiMinimi) raggiunto = livello
  }

  return raggiunto
}

/** Avanzamento verso il livello successivo, per la barra dell'area personale. */
export function progressoLivello(cliente: Cliente, livelli: LivelloLoyalty[]) {
  const ordinati = livelliOrdinati(livelli)
  const attuale = livelloPerPunti(ordinati, cliente.puntiStorici)
  const prossimo = ordinati.find((livello) => livello.puntiMinimi > cliente.puntiStorici) ?? null

  if (!prossimo) {
    return { attuale, prossimo: null, mancanti: 0, percentuale: 100 }
  }

  const base = attuale?.puntiMinimi ?? 0
  const intervallo = Math.max(1, prossimo.puntiMinimi - base)
  const fatti = Math.max(0, cliente.puntiStorici - base)

  return {
    attuale,
    prossimo,
    mancanti: Math.max(0, prossimo.puntiMinimi - cliente.puntiStorici),
    percentuale: Math.min(100, Math.round((fatti / intervallo) * 100)),
  }
}

/** Registra un movimento punti e ne tiene l'elenco entro una lunghezza sana. */
function annotaMovimento(
  archivio: Archivio,
  movimento: Omit<MovimentoPunti, 'id' | 'creatoIl'>,
): MovimentoPunti {
  const voce: MovimentoPunti = {
    ...movimento,
    id: nuovoId('mov'),
    creatoIl: new Date().toISOString(),
  }
  archivio.movimentiPunti.unshift(voce)
  if (archivio.movimentiPunti.length > 5000) archivio.movimentiPunti.length = 5000
  return voce
}

/**
 * Accredita punti a un cliente e aggiorna il suo livello.
 *
 * Restituisce il nuovo livello se è cambiato: serve a mandare la notifica
 * «sei passato a …», che è il momento in cui un programma fedeltà si fa
 * ricordare.
 */
export function accreditaPunti(
  archivio: Archivio,
  clienteId: string,
  punti: number,
  motivo: string,
  riferimento = '',
): { cliente: Cliente; livelloNuovo: LivelloLoyalty | null } | null {
  if (punti <= 0) return null

  const cliente = archivio.clienti.find((voce) => voce.id === clienteId)
  if (!cliente) return null

  const livelloPrima = cliente.livelloId

  cliente.punti += punti
  cliente.puntiStorici += punti

  const livello = livelloPerPunti(archivio.livelliLoyalty, cliente.puntiStorici)
  if (livello) cliente.livelloId = livello.id

  annotaMovimento(archivio, {
    clienteId,
    tipo: 'accredito',
    punti,
    motivo,
    riferimento,
  })

  return {
    cliente,
    livelloNuovo: livello && livello.id !== livelloPrima ? livello : null,
  }
}

/**
 * Scala i punti riscattati.
 *
 * Restituisce `false` se il cliente non ne ha abbastanza: può succedere se ha
 * riscattato altrove mentre aveva il checkout aperto, ed è il motivo per cui
 * il controllo si rifà qui e non solo al momento della scelta.
 */
export function riscattaPunti(
  archivio: Archivio,
  clienteId: string,
  punti: number,
  motivo: string,
  riferimento = '',
): boolean {
  if (punti <= 0) return true

  const cliente = archivio.clienti.find((voce) => voce.id === clienteId)
  if (!cliente || cliente.punti < punti) return false

  cliente.punti -= punti
  annotaMovimento(archivio, { clienteId, tipo: 'riscatto', punti: -punti, motivo, riferimento })
  return true
}

/** Rettifica manuale dal pannello, con la ragione sempre obbligatoria. */
export function rettificaPunti(
  archivio: Archivio,
  clienteId: string,
  punti: number,
  motivo: string,
): boolean {
  const cliente = archivio.clienti.find((voce) => voce.id === clienteId)
  if (!cliente) return false

  cliente.punti = Math.max(0, cliente.punti + punti)
  if (punti > 0) cliente.puntiStorici += punti

  const livello = livelloPerPunti(archivio.livelliLoyalty, cliente.puntiStorici)
  if (livello) cliente.livelloId = livello.id

  annotaMovimento(archivio, { clienteId, tipo: 'rettifica', punti, motivo, riferimento: 'pannello' })
  return true
}

/** Premi che il cliente può permettersi adesso. */
export function premiRaggiungibili(cliente: Cliente, premi: PremioLoyalty[]): PremioLoyalty[] {
  return premi
    .filter((premio) => premio.attivo && premio.puntiRichiesti <= cliente.punti)
    .sort((a, b) => b.puntiRichiesti - a.puntiRichiesti)
}

/**
 * Punti che una spesa genererebbe.
 *
 * Duplicato voluto della formula che sta in `calcolaConto`: là è parte del
 * conto, qui serve a mostrare «con questo acquisto guadagni N punti» in posti
 * dove il conto completo non c'è, come la scheda di un abbonamento.
 */
export function puntiPerSpesa(
  importo: number,
  puntiPerEuro: number,
  moltiplicatore = 1,
): number {
  return Math.floor(Math.max(0, importo) * puntiPerEuro * moltiplicatore)
}
