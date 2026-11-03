import type { MetodoPagamento } from '@/lib/tipi'

/**
 * Nomi dei metodi di pagamento mostrati al pubblico.
 *
 * Sono duplicati rispetto a quelli di `lib/pagamenti.ts` per una ragione
 * precisa: quel modulo è marcato `server-only` perché contiene le chiavi dei
 * fornitori, e importarlo da un componente di client farebbe fallire la
 * compilazione. Tre righe ripetute sono un prezzo ragionevole per tenere le
 * chiavi lontane dal browser.
 */
export const NOMI_METODO_PUBBLICI: Record<MetodoPagamento, string> = {
  carta: 'Carta di credito o debito',
  'apple-pay': 'Apple Pay',
  'google-pay': 'Google Pay',
  paypal: 'PayPal',
  'gift-card': 'Gift card',
  punti: 'Punti CLUB',
  cassa: 'Pago in cassa',
}
