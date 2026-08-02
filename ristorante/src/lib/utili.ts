/** Funzioni di supporto usate sia dal sito sia dal pannello. */

/** Unisce classi CSS ignorando i valori vuoti o condizionali. */
export function classi(...valori: Array<string | false | null | undefined>): string {
  return valori.filter(Boolean).join(' ')
}

/** Prezzo in euro, con i decimali solo quando servono. */
export function prezzo(valore: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(valore) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(valore)
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
 * Codice di prenotazione comunicato al cliente: sei caratteri senza vocali,
 * così non può formare parole per caso.
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

/** Media aritmetica arrotondata a un decimale. */
export function media(valori: number[]): number {
  if (valori.length === 0) return 0
  return Math.round((valori.reduce((somma, valore) => somma + valore, 0) / valori.length) * 10) / 10
}
