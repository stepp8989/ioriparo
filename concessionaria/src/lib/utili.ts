/** Funzioni di supporto usate sia dal sito sia dal pannello. */

import type { Veicolo } from '@/lib/tipi'

/** Unisce classi CSS ignorando i valori vuoti o condizionali. */
export function classi(...valori: Array<string | false | null | undefined>): string {
  return valori.filter(Boolean).join(' ')
}

/**
 * Prezzo in euro, con i decimali solo quando servono.
 *
 * `useGrouping: true` è indispensabile: lasciato al valore predefinito, il
 * separatore comparirebbe da cinquemila in su ma non sotto — «94.500 €»
 * accanto a «1449 €» nella stessa pagina. Qui i prezzi vanno sempre puntati.
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

/** Numero con separatore delle migliaia: «128.500». */
export function numero(valore: number): string {
  return new Intl.NumberFormat('it-IT', { useGrouping: true }).format(valore)
}

/**
 * Percentuale con la virgola decimale italiana: «5,45%».
 * I tassi vengono da costanti numeriche, e interpolarli direttamente in JSX
 * produrrebbe il punto anglosassone.
 */
export function percentuale(valore: number): string {
  return `${valore.toLocaleString('it-IT', { maximumFractionDigits: 2 })}%`
}

/** Chilometraggio pronto da mostrare: «0 km» diventa «Nuovo». */
export function chilometri(valore: number): string {
  return valore === 0 ? 'Nuovo' : `${numero(valore)} km`
}

/** Data estesa in italiano: «12 novembre 2026». */
export function dataEstesa(iso: string): string {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(data)
}

/** Data breve con giorno della settimana: «sab 12 nov». */
export function dataBreve(iso: string): string {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).format(data)
}

/** Identificativo casuale abbastanza corto da restare leggibile negli elenchi. */
export function nuovoId(prefisso: string): string {
  return `${prefisso}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Codice comunicato al cliente: sei caratteri senza vocali, così non può
 * formare parole per caso.
 */
export function nuovoCodice(): string {
  const alfabeto = 'BCDFGHJKLMNPQRSTVWXZ23456789'
  let codice = ''
  for (let indice = 0; indice < 6; indice += 1) {
    codice += alfabeto[Math.floor(Math.random() * alfabeto.length)]
  }
  return codice
}

/** Trasforma un titolo in una porzione di indirizzo leggibile. */
export function inSlug(testo: string): string {
  return testo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Controllo di formato dell'indirizzo email, volutamente permissivo. */
export function emailValida(valore: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(valore.trim())
}

/**
 * Controllo del numero di telefono: accetta prefissi internazionali, spazi,
 * punti e trattini, e richiede almeno otto cifre.
 */
export function telefonoValido(valore: string): boolean {
  const cifre = valore.replace(/[^\d]/g, '')
  return /^[+()\d\s.\-]+$/.test(valore.trim()) && cifre.length >= 8 && cifre.length <= 15
}

/** Data di oggi in formato `AAAA-MM-GG`, secondo il fuso locale. */
export function oggiIso(): string {
  const ora = new Date()
  const scostamento = ora.getTimezoneOffset() * 60000
  return new Date(ora.getTime() - scostamento).toISOString().slice(0, 10)
}

/** Data di oggi più un numero di giorni, in formato `AAAA-MM-GG`. */
export function fraGiorni(giorni: number): string {
  const data = new Date()
  data.setDate(data.getDate() + giorni)
  const scostamento = data.getTimezoneOffset() * 60000
  return new Date(data.getTime() - scostamento).toISOString().slice(0, 10)
}

/**
 * Giorni compresi fra due date `AAAA-MM-GG`, estremi inclusi.
 * Un noleggio dal 3 al 5 dura tre giorni, non due: chi ritira la mattina del 3
 * e riconsegna la sera del 5 ha usato il veicolo per tre giornate.
 */
export function giorniFra(dal: string, al: string): number {
  const inizio = Date.parse(`${dal}T12:00:00`)
  const fine = Date.parse(`${al}T12:00:00`)
  if (!Number.isFinite(inizio) || !Number.isFinite(fine) || fine < inizio) return 0
  return Math.round((fine - inizio) / 86_400_000) + 1
}

/** Media aritmetica arrotondata a un decimale. */
export function media(valori: number[]): number {
  if (valori.length === 0) return 0
  return Math.round((valori.reduce((somma, valore) => somma + valore, 0) / valori.length) * 10) / 10
}

/** Titolo del veicolo su una riga: «Audi A4 Avant 40 TDI quattro». */
export function titoloVeicolo(veicolo: Pick<Veicolo, 'marca' | 'modello' | 'allestimento'>): string {
  return [veicolo.marca, veicolo.modello, veicolo.allestimento].filter(Boolean).join(' ')
}

/**
 * Rata mensile di un finanziamento a tasso fisso (ammortamento alla francese).
 *
 * `tan` è il tasso annuo nominale in percentuale. A tasso zero la formula
 * generale dividerebbe per zero, quindi quel caso si tratta a parte.
 */
export function rataMensile(capitale: number, tan: number, mesi: number): number {
  if (capitale <= 0 || mesi <= 0) return 0
  const tassoMensile = tan / 100 / 12
  if (tassoMensile === 0) return capitale / mesi
  const fattore = (1 + tassoMensile) ** mesi
  return (capitale * tassoMensile * fattore) / (fattore - 1)
}

/** Consumo dichiarato con l'unità di misura giusta per l'alimentazione. */
export function consumo(veicolo: Pick<Veicolo, 'alimentazione' | 'consumoMisto'>): string {
  const unita = veicolo.alimentazione === 'elettrica' ? 'kWh/100 km' : 'l/100 km'
  return `${veicolo.consumoMisto.toLocaleString('it-IT')} ${unita}`
}

/** Divide il testo di un articolo in paragrafi, sottotitoli ed elenchi. */
export type BloccoTesto =
  | { tipo: 'titolo'; testo: string }
  | { tipo: 'paragrafo'; testo: string }
  | { tipo: 'elenco'; voci: string[] }

export function blocchiDiTesto(contenuto: string): BloccoTesto[] {
  const blocchi: BloccoTesto[] = []

  for (const grezzo of contenuto.trim().split(/\n\s*\n/)) {
    const pezzo = grezzo.trim()
    if (!pezzo) continue

    if (pezzo.startsWith('## ')) {
      blocchi.push({ tipo: 'titolo', testo: pezzo.slice(3).trim() })
      continue
    }

    if (pezzo.startsWith('- ')) {
      blocchi.push({
        tipo: 'elenco',
        voci: pezzo
          .split('\n')
          .map((riga) => riga.replace(/^-\s*/, '').trim())
          .filter(Boolean),
      })
      continue
    }

    blocchi.push({ tipo: 'paragrafo', testo: pezzo.replace(/\s*\n\s*/g, ' ') })
  }

  return blocchi
}
