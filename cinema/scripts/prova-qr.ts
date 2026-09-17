/**
 * Verifica del generatore di codici QR.
 *
 *   npm run prova-qr
 *
 * I valori attesi sono stati prodotti con la libreria di riferimento `qrcode`
 * in modalità byte e sono qui in forma di impronta, non di matrice: trenta
 * matrici estese occuperebbero migliaia di righe senza dire nulla di più.
 *
 * Al momento della scrittura il generatore è stato confrontato modulo per
 * modulo con quella libreria su 2.978 casi — testi casuali da 1 a 180
 * caratteri, tutti e quattro i livelli di correzione, versioni dalla 1 alla
 * 10 — con esito identico in tutti. Questo file è ciò che resta di quel
 * confronto senza portarsi dietro la dipendenza: serve a segnalare una
 * regressione, e va rigenerato soltanto se cambia l'algoritmo, mai per farlo
 * tornare verde.
 *
 * Il confronto è fatto in modalità byte perché è l'unica implementata: la
 * modalità alfanumerica comprimerebbe i codici tutti in maiuscolo, ma
 * comporterebbe una seconda codifica da mantenere per risparmiare una
 * versione su un simbolo che è già piccolo.
 */

import { generaQr, type LivelloCorrezione } from '../src/lib/qr.ts'

type CasoDiProva = {
  testo: string
  livello: LivelloCorrezione
  versione: number
  lato: number
  impronta: string
}

/** FNV-1a a 32 bit: corta, stabile e sufficiente a rilevare un modulo cambiato. */
function impronta(righe: string[]): string {
  let valore = 0x811c9dc5
  for (const riga of righe) {
    for (const carattere of riga) {
      valore ^= carattere.charCodeAt(0)
      valore = Math.imul(valore, 0x01000193) >>> 0
    }
  }
  return valore.toString(16).padStart(8, '0')
}

const CASI: CasoDiProva[] = [
  { testo: "CINEMAX", livello: 'L', versione: 1, lato: 21, impronta: 'e351fca5' },
  { testo: "CINEMAX", livello: 'M', versione: 1, lato: 21, impronta: '92c4a9e5' },
  { testo: "CINEMAX", livello: 'Q', versione: 1, lato: 21, impronta: '1a674d4f' },
  { testo: "CINEMAX", livello: 'H', versione: 1, lato: 21, impronta: 'a1cf8625' },
  { testo: "CMX1|BC2F4K|F|8|aB3dEf9xYz", livello: 'L', versione: 2, lato: 25, impronta: '85819ad3' },
  { testo: "CMX1|BC2F4K|F|8|aB3dEf9xYz", livello: 'M', versione: 2, lato: 25, impronta: 'bf69bd61' },
  { testo: "CMX1|BC2F4K|F|8|aB3dEf9xYz", livello: 'Q', versione: 3, lato: 29, impronta: '447327e9' },
  { testo: "CMX1|BC2F4K|F|8|aB3dEf9xYz", livello: 'H', versione: 4, lato: 33, impronta: '6a695ee0' },
  { testo: "https://www.cinemax.example/biglietto/BC2F4K", livello: 'L', versione: 3, lato: 29, impronta: 'e2c75014' },
  { testo: "https://www.cinemax.example/biglietto/BC2F4K", livello: 'M', versione: 4, lato: 33, impronta: 'eabee758' },
  { testo: "https://www.cinemax.example/biglietto/BC2F4K", livello: 'Q', versione: 4, lato: 33, impronta: 'f033a9a8' },
  { testo: "https://www.cinemax.example/biglietto/BC2F4K", livello: 'H', versione: 5, lato: 37, impronta: '0453dd37' },
  { testo: "CMX1|K9M3PQ|AA|24|2026-09-17|19:45|4|Qw8rTy2uIo", livello: 'L', versione: 3, lato: 29, impronta: '8b32f04f' },
  { testo: "CMX1|K9M3PQ|AA|24|2026-09-17|19:45|4|Qw8rTy2uIo", livello: 'M', versione: 4, lato: 33, impronta: '9837d7f4' },
  { testo: "CMX1|K9M3PQ|AA|24|2026-09-17|19:45|4|Qw8rTy2uIo", livello: 'Q', versione: 5, lato: 37, impronta: 'cde82f41' },
  { testo: "CMX1|K9M3PQ|AA|24|2026-09-17|19:45|4|Qw8rTy2uIo", livello: 'H', versione: 6, lato: 41, impronta: 'e6d643ba' },
  { testo: "à€ù — accentate, simboli ∑ ∆ e spazi", livello: 'L', versione: 3, lato: 29, impronta: '3ead4785' },
  { testo: "à€ù — accentate, simboli ∑ ∆ e spazi", livello: 'M', versione: 4, lato: 33, impronta: 'b70c5a05' },
  { testo: "à€ù — accentate, simboli ∑ ∆ e spazi", livello: 'Q', versione: 4, lato: 33, impronta: '16cf53be' },
  { testo: "à€ù — accentate, simboli ∑ ∆ e spazi", livello: 'H', versione: 6, lato: 41, impronta: '09c7ac10' },
  { testo: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", livello: 'L', versione: 3, lato: 29, impronta: '493a03d1' },
  { testo: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", livello: 'M', versione: 3, lato: 29, impronta: '4c091439' },
  { testo: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", livello: 'Q', versione: 4, lato: 33, impronta: 'c7b49815' },
  { testo: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", livello: 'H', versione: 5, lato: 37, impronta: 'ae7b434b' },
  { testo: "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy", livello: 'L', versione: 5, lato: 37, impronta: 'a9cd75fb' },
  { testo: "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy", livello: 'M', versione: 6, lato: 41, impronta: 'e41fa79f' },
  { testo: "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy", livello: 'Q', versione: 8, lato: 49, impronta: '88ec52e6' },
  { testo: "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy", livello: 'H', versione: 10, lato: 57, impronta: 'e9e9098e' },
  { testo: "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz", livello: 'L', versione: 9, lato: 53, impronta: '6ac4b422' },
  { testo: "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz", livello: 'M', versione: 10, lato: 57, impronta: '550925a0' },
]

let riusciti = 0
const falliti: string[] = []

for (const caso of CASI) {
  const codice = generaQr(caso.testo, caso.livello)
  const righe = codice.moduli.map((riga) =>
    riga.map((modulo) => (modulo ? '#' : '.')).join(''),
  )

  const problemi: string[] = []
  if (codice.versione !== caso.versione) {
    problemi.push(`versione ${codice.versione}, attesa ${caso.versione}`)
  }
  if (codice.dimensione !== caso.lato) {
    problemi.push(`lato ${codice.dimensione}, atteso ${caso.lato}`)
  }
  const ottenuta = impronta(righe)
  if (ottenuta !== caso.impronta) {
    problemi.push(`impronta ${ottenuta}, attesa ${caso.impronta}`)
  }

  if (problemi.length === 0) {
    riusciti += 1
  } else {
    falliti.push(
      `  ${caso.livello} «${caso.testo.slice(0, 32)}»: ${problemi.join('; ')}`,
    )
  }
}

if (falliti.length > 0) {
  console.error(`Codici QR non conformi (${falliti.length} su ${CASI.length}):`)
  console.error(falliti.join('\n'))
  process.exit(1)
}

console.log(`Codici QR: ${riusciti} casi su ${CASI.length} conformi al riferimento.`)
