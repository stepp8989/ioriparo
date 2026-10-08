/** Funzioni di supporto usate sia dal sito sia dal pannello. */

import type { Film, Posto } from '@/lib/tipi'

/** Unisce classi CSS ignorando i valori vuoti o condizionali. */
export function classi(...valori: Array<string | false | null | undefined>): string {
  return valori.filter(Boolean).join(' ')
}

/**
 * Prezzo in euro, con i decimali solo quando servono.
 *
 * `useGrouping: true` è indispensabile: lasciato al valore predefinito, il
 * separatore comparirebbe da cinquemila in su ma non sotto, e nella stessa
 * pagina si leggerebbe «12.400 €» accanto a «9700 €».
 */
export function prezzo(valore: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    useGrouping: true,
    minimumFractionDigits: Number.isInteger(valore) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(valore)
}

/** Prezzo con i centesimi sempre visibili: nel carrello «9 €» stona. */
export function prezzoPieno(valore: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valore)
}

/** Numero con separatore delle migliaia: «12.450». */
export function numero(valore: number): string {
  return new Intl.NumberFormat('it-IT', { useGrouping: true }).format(valore)
}

/** Percentuale con la virgola decimale italiana: «12,5%». */
export function percentuale(valore: number): string {
  return `${valore.toLocaleString('it-IT', { maximumFractionDigits: 2 })}%`
}

/** Durata di un film: «2h 18min», oppure «96min» sotto l'ora. */
export function durata(minuti: number): string {
  if (minuti <= 0) return '—'
  const ore = Math.floor(minuti / 60)
  const resto = minuti % 60
  if (ore === 0) return `${resto}min`
  return resto === 0 ? `${ore}h` : `${ore}h ${resto}min`
}

/** Durata di un trailer in `m:ss`. */
export function durataBreve(secondi: number): string {
  const minuti = Math.floor(secondi / 60)
  return `${minuti}:${String(secondi % 60).padStart(2, '0')}`
}

/** Data estesa in italiano: «12 novembre 2026». */
export function dataEstesa(iso: string): string {
  const data = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
  if (Number.isNaN(data.getTime())) return iso
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(data)
}

/** Data breve con giorno della settimana: «sab 12 nov». */
export function dataBreve(iso: string): string {
  const data = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
  if (Number.isNaN(data.getTime())) return iso
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(data)
}

/** Data e ora: «12 nov, 19:45». */
export function dataOra(iso: string): string {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data)
}

/**
 * Etichetta del giorno nel calendario degli orari.
 *
 * Oggi e domani hanno un nome proprio perché è così che il pubblico li cerca;
 * dal terzo giorno in poi si torna al giorno della settimana, che è
 * l'informazione utile per decidere quando andare al cinema.
 */
export function etichettaGiorno(iso: string, riferimento = oggiIso()): string {
  if (iso === riferimento) return 'Oggi'
  if (iso === giornoDopo(riferimento)) return 'Domani'
  const data = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(data.getTime())) return iso
  const giorno = new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(data)
  return giorno.charAt(0).toUpperCase() + giorno.slice(1)
}

/** Nome del giorno della settimana da 0 (domenica) a 6. */
export const GIORNI_SETTIMANA = [
  'Domenica',
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato',
] as const

/** Data di oggi in formato `AAAA-MM-GG`, secondo il fuso locale. */
export function oggiIso(): string {
  const ora = new Date()
  const scostamento = ora.getTimezoneOffset() * 60000
  return new Date(ora.getTime() - scostamento).toISOString().slice(0, 10)
}

/** Giorno successivo a una data `AAAA-MM-GG`. */
export function giornoDopo(iso: string): string {
  return sommaGiorni(iso, 1)
}

/** Somma (o sottrae) giorni a una data `AAAA-MM-GG`. */
export function sommaGiorni(iso: string, giorni: number): string {
  const data = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(data.getTime())) return iso
  data.setDate(data.getDate() + giorni)
  const scostamento = data.getTimezoneOffset() * 60000
  return new Date(data.getTime() - scostamento).toISOString().slice(0, 10)
}

/** Elenco di `quanti` giorni consecutivi a partire da oggi. */
export function prossimiGiorni(quanti: number, da = oggiIso()): string[] {
  return Array.from({ length: quanti }, (_, indice) => sommaGiorni(da, indice))
}

/** Momento esatto di uno spettacolo, come `Date`. */
export function istanteSpettacolo(data: string, ora: string): Date {
  return new Date(`${data}T${ora}:00`)
}

/**
 * Minuti che mancano all'inizio di uno spettacolo. Negativo se è già iniziato.
 * Serve sia alla chiusura delle vendite sia al promemoria «il tuo film inizia
 * fra mezz'ora».
 */
export function minutiAllInizio(data: string, ora: string, adesso = new Date()): number {
  const inizio = istanteSpettacolo(data, ora)
  if (Number.isNaN(inizio.getTime())) return Number.POSITIVE_INFINITY
  return Math.round((inizio.getTime() - adesso.getTime()) / 60_000)
}

/** Ora di fine proiezione, con venti minuti di pubblicità e titoli di coda. */
export function oraFine(ora: string, durataMinuti: number, intervallo = 20): string {
  const [ore, minuti] = ora.split(':').map(Number)
  if (!Number.isFinite(ore) || !Number.isFinite(minuti)) return ora
  const totale = (ore * 60 + minuti + durataMinuti + intervallo) % (24 * 60)
  return `${String(Math.floor(totale / 60)).padStart(2, '0')}:${String(totale % 60).padStart(2, '0')}`
}

/** Identificativo casuale abbastanza corto da restare leggibile negli elenchi. */
export function nuovoId(prefisso: string): string {
  return `${prefisso}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Alfabeto dei codici comunicati al pubblico.
 *
 * Niente vocali, così nessun codice può formare per caso una parola; niente
 * `0`, `O`, `1`, `I` e `L`, che al telefono e su un biglietto stampato si
 * confondono fra loro.
 */
const ALFABETO_CODICI = 'BCDFGHJKMNPQRSTVWXYZ23456789'

/** Codice leggibile della lunghezza richiesta. */
export function nuovoCodice(lunghezza = 6): string {
  let codice = ''
  for (let indice = 0; indice < lunghezza; indice += 1) {
    codice += ALFABETO_CODICI[Math.floor(Math.random() * ALFABETO_CODICI.length)]
  }
  return codice
}

/** Trasforma un titolo in una porzione di indirizzo leggibile. */
export function inSlug(testo: string): string {
  return testo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Controllo di formato dell'indirizzo email, volutamente permissivo. */
export function emailValida(valore: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(valore.trim())
}

/** Numero di telefono: prefissi internazionali ammessi, almeno otto cifre. */
export function telefonoValido(valore: string): boolean {
  const cifre = valore.replace(/[^\d]/g, '')
  return /^[+()\d\s.-]+$/.test(valore.trim()) && cifre.length >= 8 && cifre.length <= 15
}

/** Media aritmetica arrotondata a un decimale. */
export function media(valori: number[]): number {
  if (valori.length === 0) return 0
  return Math.round((valori.reduce((somma, valore) => somma + valore, 0) / valori.length) * 10) / 10
}

/** Arrotonda a due decimali: gli euro non hanno millesimi. */
export function centesimi(valore: number): number {
  return Math.round(valore * 100) / 100
}

/**
 * Distanza in chilometri fra due coordinate (formula dell'emisenoverso).
 *
 * Serve a ordinare i cinema per vicinanza in «Trova cinema». È la distanza in
 * linea d'aria, non quella stradale: per una lista di sale in una provincia è
 * più che sufficiente, e non richiede di interrogare un servizio esterno — e
 * quindi di mandare a qualcun altro la posizione di chi sta navigando.
 */
export function distanzaKm(
  da: { lat: number; lng: number },
  a: { lat: number; lng: number },
): number {
  const RAGGIO_TERRESTRE = 6371
  const inRadianti = (gradi: number) => (gradi * Math.PI) / 180
  const dLat = inRadianti(a.lat - da.lat)
  const dLng = inRadianti(a.lng - da.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(inRadianti(da.lat)) * Math.cos(inRadianti(a.lat)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * RAGGIO_TERRESTRE * Math.asin(Math.sqrt(h)) * 10) / 10
}

/** Chiave univoca di un posto dentro una sala: «F-8». */
export function chiavePosto(fila: string, numero: number): string {
  return `${fila}-${numero}`
}

/** Etichetta di un posto come la legge il pubblico: «F8». */
export function etichettaPosto(fila: string, numero: number): string {
  return `${fila}${numero}`
}

/** Elenco di posti leggibile: «F8, F9 e F10». */
export function elencoPosti(posti: { fila: string; numero: number }[]): string {
  const etichette = posti.map((posto) => etichettaPosto(posto.fila, posto.numero))
  if (etichette.length <= 1) return etichette.join('')
  return `${etichette.slice(0, -1).join(', ')} e ${etichette[etichette.length - 1]}`
}

/** Vero se la poltrona è acquistabile: i corridoi non lo sono. */
export function postoAcquistabile(posto: Posto): boolean {
  return posto.tipo !== 'vuoto'
}

/** Titolo del film con l'anno, per gli elenchi del pannello. */
export function titoloConAnno(film: Pick<Film, 'titolo' | 'anno'>): string {
  return `${film.titolo} (${film.anno})`
}

/**
 * Lettera di fila a partire dall'indice: A, B, … Z, AA, AB.
 * Le sale grandi superano le ventisei file più spesso di quanto si creda.
 */
export function etichettaFila(indice: number): string {
  let etichetta = ''
  let resto = indice
  do {
    etichetta = String.fromCharCode(65 + (resto % 26)) + etichetta
    resto = Math.floor(resto / 26) - 1
  } while (resto >= 0)
  return etichetta
}

/** Divide un testo in paragrafi, saltando le righe vuote. */
export function paragrafi(testo: string): string[] {
  return testo
    .trim()
    .split(/\n\s*\n/)
    .map((pezzo) => pezzo.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
}

/** Raggruppa un elenco per chiave, conservando l'ordine di apparizione. */
export function raggruppa<T, C extends string>(
  voci: readonly T[],
  chiave: (voce: T) => C,
): Map<C, T[]> {
  const gruppi = new Map<C, T[]>()
  for (const voce of voci) {
    const k = chiave(voce)
    const gruppo = gruppi.get(k)
    if (gruppo) gruppo.push(voce)
    else gruppi.set(k, [voce])
  }
  return gruppi
}
