/** Unisce nomi di classi saltando i valori vuoti, `false` e `undefined`. */
export function cn(...classi: (string | false | null | undefined)[]): string {
  return classi.filter(Boolean).join(' ')
}

/**
 * Controllo dell'indirizzo email.
 *
 * Volutamente permissivo: l'unica verifica che conta davvero è che l'email
 * arrivi a destinazione, e nessuna espressione regolare può dirlo. Qui si
 * fermano solo gli errori evidenti, senza rifiutare indirizzi legittimi ma
 * insoliti.
 */
export function emailValida(valore: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(valore)
}

/** Identificativo breve e ordinabile nel tempo. */
export function nuovoId(prefisso: string): string {
  return `${prefisso}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

/** Data leggibile in italiano: «8 agosto 2026, 14:32». */
export function dataEstesa(iso: string): string {
  return new Date(iso).toLocaleString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Numero intero con il punto delle migliaia: 1690 → «1.690».
 *
 * Scritto a mano invece di usare `toLocaleString('it-IT')` per una ragione
 * precisa: le librerie internazionali di Node e del browser non hanno sempre
 * la stessa versione, e dalla revisione ICU 72 il raggruppamento predefinito
 * cambia proprio sui numeri di quattro cifre. Il risultato era «1.690 €» dal
 * server e «1690 €» nel browser — cioè un disallineamento di idratazione su
 * ogni prezzo del listino. Qui il risultato è lo stesso ovunque, sempre.
 */
export function numeroIt(valore: number): string {
  const intero = Math.round(Math.abs(valore)).toString()
  const raggruppato = intero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return valore < 0 ? `-${raggruppato}` : raggruppato
}

/** Prezzo in euro senza decimali: «1.690 €». */
export function euro(valore: number): string {
  return `${numeroIt(valore)} €`
}
