/** Formattazione e validazioni condivise dalle pagine del sito. */

export const euro = (n: number) =>
  n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })

/** Importo senza decimali quando sono zero: «10 €», «7,50 €». */
export const euroBreve = (n: number) =>
  n.toLocaleString('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  })

export const numero = (n: number) => n.toLocaleString('it-IT')

export const emailValida = (v: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim())

export const telefonoValido = (v: string) => v.replace(/\D/g, '').length >= 8

export const cn = (...parti: (string | false | null | undefined)[]) => parti.filter(Boolean).join(' ')

export const iniziali = (nome: string) =>
  nome
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']
const MESI = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
]

export const dataEstesa = (d: Date) => `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}`

/** Quanti giorni di calendario separano due date, ignorando l'ora. */
const giorniDiStacco = (da: Date, a: Date) => {
  const mezzanotte = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((mezzanotte(a) - mezzanotte(da)) / 86_400_000)
}

/**
 * Quando si riapre, detto come lo direbbe una persona: «oggi alle 16:00»,
 * «domani alle 09:00», «lunedì alle 09:00».
 *
 * Oltre la settimana il nome del giorno non basta più — «lunedì» quale? — e
 * allora si scrive la data per esteso.
 */
export const quandoRiapriamo = (giorno: Date, ora: string, adesso = new Date()) => {
  const stacco = giorniDiStacco(adesso, giorno)
  if (stacco <= 0) return `oggi alle ${ora}`
  if (stacco === 1) return `domani alle ${ora}`
  if (stacco < 7) return `${GIORNI[giorno.getDay()]} alle ${ora}`
  return `${dataEstesa(giorno)} alle ${ora}`
}

/** Periodo di chiusura in forma breve: «13 – 15 agosto», «23 dic – 27 dic». */
export const periodo = (dal: string, al: string) => {
  const a = new Date(dal)
  const b = new Date(al)
  const stessoMese = a.getMonth() === b.getMonth()
  return stessoMese
    ? `${a.getDate()} – ${b.getDate()} ${MESI[b.getMonth()]}`
    : `${a.getDate()} ${MESI[a.getMonth()]} – ${b.getDate()} ${MESI[b.getMonth()]}`
}

export const dataBreve = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('it-IT')
}

export const oraBreve = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}
