/**
 * Generatore di codici QR.
 *
 * È scritto qui invece di installare una libreria per una ragione precisa: il
 * QR è ciò che apre la porta della sala, e il codice che lo produce deve poter
 * essere letto e verificato da chi mantiene la piattaforma senza passare per le
 * dipendenze di terzi. Sono circa trecento righe, l'algoritmo è pubblico
 * (ISO/IEC 18004) e non cambia mai.
 *
 * Copertura: modalità byte (UTF-8), versioni da 1 a 10, tutti e quattro i
 * livelli di correzione. Un biglietto porta una sessantina di caratteri, che
 * stanno in una versione 3-4 con correzione Q: bastano e avanzano. Le versioni
 * oltre la decima servirebbero per payload di centinaia di byte, che qui non
 * esistono, e ognuna aggiungerebbe una riga di tabelle da mantenere senza che
 * nessuno la usi.
 *
 * La resa è in SVG: si stampa senza sgranare, si incolla nell'email di
 * conferma e non richiede canvas né immagini binarie.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * Tabelle dello standard
 * ────────────────────────────────────────────────────────────────────── */

export const LIVELLI_CORREZIONE = ['L', 'M', 'Q', 'H'] as const
export type LivelloCorrezione = (typeof LIVELLI_CORREZIONE)[number]

/**
 * Per ogni versione e livello: byte di correzione per blocco, numero di
 * blocchi del primo gruppo e loro byte di dati, poi lo stesso per il secondo
 * gruppo (a zero quando i blocchi sono tutti uguali).
 */
const BLOCCHI: Record<LivelloCorrezione, readonly (readonly number[])[]> = {
  L: [
    [7, 1, 19, 0, 0],
    [10, 1, 34, 0, 0],
    [15, 1, 55, 0, 0],
    [20, 1, 80, 0, 0],
    [26, 1, 108, 0, 0],
    [18, 2, 68, 0, 0],
    [20, 2, 78, 0, 0],
    [24, 2, 97, 0, 0],
    [30, 2, 116, 0, 0],
    [18, 2, 68, 2, 69],
  ],
  M: [
    [10, 1, 16, 0, 0],
    [16, 1, 28, 0, 0],
    [26, 1, 44, 0, 0],
    [18, 2, 32, 0, 0],
    [24, 2, 43, 0, 0],
    [16, 4, 27, 0, 0],
    [18, 4, 31, 0, 0],
    [22, 2, 38, 2, 39],
    [22, 3, 36, 2, 37],
    [26, 4, 43, 1, 44],
  ],
  Q: [
    [13, 1, 13, 0, 0],
    [22, 1, 22, 0, 0],
    [18, 2, 17, 0, 0],
    [26, 2, 24, 0, 0],
    [18, 2, 15, 2, 16],
    [24, 4, 19, 0, 0],
    [18, 2, 14, 4, 15],
    [22, 4, 18, 2, 19],
    [20, 4, 16, 4, 17],
    [24, 6, 19, 2, 20],
  ],
  H: [
    [17, 1, 9, 0, 0],
    [28, 1, 16, 0, 0],
    [22, 2, 13, 0, 0],
    [16, 4, 9, 0, 0],
    [22, 2, 11, 2, 12],
    [28, 4, 15, 0, 0],
    [26, 4, 13, 1, 14],
    [26, 4, 14, 2, 15],
    [24, 4, 12, 4, 13],
    [28, 6, 15, 2, 16],
  ],
}

/** Centri dei riquadri di allineamento, per versione (la 1 non ne ha). */
const ALLINEAMENTI: readonly (readonly number[])[] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
]

/** Informazione di versione già codificata in BCH, dalla 7 in poi. */
const INFO_VERSIONE: Record<number, number> = {
  7: 0x07c94,
  8: 0x085bc,
  9: 0x09a99,
  10: 0x0a4d3,
}

/** Bit di livello di correzione nell'informazione di formato. */
const BIT_LIVELLO: Record<LivelloCorrezione, number> = { L: 1, M: 0, Q: 3, H: 2 }

const VERSIONE_MASSIMA = 10

/* ─────────────────────────────────────────────────────────────────────────
 * Aritmetica nel campo di Galois GF(256)
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Reed-Solomon lavora in GF(256) con polinomio primitivo 0x11d. Le due tabelle
 * trasformano moltiplicazioni e divisioni in somme di logaritmi, che è l'unico
 * modo pratico di farle.
 */
const ESPONENTI = new Uint8Array(512)
const LOGARITMI = new Uint8Array(256)

{
  let valore = 1
  for (let indice = 0; indice < 255; indice += 1) {
    ESPONENTI[indice] = valore
    LOGARITMI[valore] = indice
    valore <<= 1
    if (valore & 0x100) valore ^= 0x11d
  }
  for (let indice = 255; indice < 512; indice += 1) {
    ESPONENTI[indice] = ESPONENTI[indice - 255]
  }
}

function moltiplica(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return ESPONENTI[LOGARITMI[a] + LOGARITMI[b]]
}

/** Polinomio generatore per `grado` byte di correzione. */
function polinomioGeneratore(grado: number): Uint8Array {
  let polinomio = new Uint8Array([1])

  for (let indice = 0; indice < grado; indice += 1) {
    const successivo = new Uint8Array(polinomio.length + 1)
    for (let posizione = 0; posizione < polinomio.length; posizione += 1) {
      successivo[posizione] ^= polinomio[posizione]
      successivo[posizione + 1] ^= moltiplica(polinomio[posizione], ESPONENTI[indice])
    }
    polinomio = successivo
  }

  return polinomio
}

/** Byte di correzione di un blocco di dati (divisione polinomiale). */
function correzione(dati: Uint8Array, quanti: number): Uint8Array {
  const generatore = polinomioGeneratore(quanti)
  const resto = new Uint8Array(dati.length + quanti)
  resto.set(dati)

  for (let indice = 0; indice < dati.length; indice += 1) {
    const guida = resto[indice]
    if (guida === 0) continue
    for (let posizione = 0; posizione < generatore.length; posizione += 1) {
      resto[indice + posizione] ^= moltiplica(generatore[posizione], guida)
    }
  }

  return resto.slice(dati.length)
}

/* ─────────────────────────────────────────────────────────────────────────
 * Codifica dei dati
 * ────────────────────────────────────────────────────────────────────── */

/** Byte di dati totali disponibili per versione e livello. */
function byteDisponibili(versione: number, livello: LivelloCorrezione): number {
  const [, blocchi1, dati1, blocchi2, dati2] = BLOCCHI[livello][versione - 1]
  return blocchi1 * dati1 + blocchi2 * dati2
}

/**
 * Sceglie la versione più piccola che contiene il messaggio.
 *
 * Il contatore di caratteri occupa 8 bit fino alla versione 9 e 16 dalla 10:
 * è la ragione per cui la scelta non si può fare con una semplice divisione.
 */
function scegliVersione(byteMessaggio: number, livello: LivelloCorrezione): number {
  for (let versione = 1; versione <= VERSIONE_MASSIMA; versione += 1) {
    const bitContatore = versione < 10 ? 8 : 16
    const bitNecessari = 4 + bitContatore + byteMessaggio * 8
    if (bitNecessari <= byteDisponibili(versione, livello) * 8) return versione
  }
  throw new Error(
    `Messaggio troppo lungo per un QR fino alla versione ${VERSIONE_MASSIMA} ` +
      `(${byteMessaggio} byte, livello ${livello}).`,
  )
}

/** Costruisce la sequenza di byte di dati, terminatore e riempimento inclusi. */
function codificaDati(
  messaggio: Uint8Array,
  versione: number,
  livello: LivelloCorrezione,
): Uint8Array {
  const capienza = byteDisponibili(versione, livello)
  const bit: number[] = []

  const aggiungi = (valore: number, quanti: number) => {
    for (let indice = quanti - 1; indice >= 0; indice -= 1) bit.push((valore >> indice) & 1)
  }

  // Indicatore di modalità byte, poi la lunghezza, poi i dati.
  aggiungi(0b0100, 4)
  aggiungi(messaggio.length, versione < 10 ? 8 : 16)
  for (const byte of messaggio) aggiungi(byte, 8)

  // Terminatore: fino a quattro zeri, ma non oltre la capienza.
  const bitTotali = capienza * 8
  for (let indice = 0; indice < 4 && bit.length < bitTotali; indice += 1) bit.push(0)

  // Allineamento al byte.
  while (bit.length % 8 !== 0) bit.push(0)

  const dati = new Uint8Array(capienza)
  for (let indice = 0; indice < bit.length / 8; indice += 1) {
    let byte = 0
    for (let posizione = 0; posizione < 8; posizione += 1) {
      byte = (byte << 1) | bit[indice * 8 + posizione]
    }
    dati[indice] = byte
  }

  // Riempimento con i due byte previsti dallo standard, alternati.
  const riempimento = [0xec, 0x11]
  for (let indice = bit.length / 8, turno = 0; indice < capienza; indice += 1, turno += 1) {
    dati[indice] = riempimento[turno % 2]
  }

  return dati
}

/**
 * Divide i dati in blocchi, calcola la correzione di ciascuno e li intercala.
 *
 * L'intercalazione è ciò che rende il codice resistente a una macchia: un
 * graffio che cancella venti byte contigui del simbolo tocca pochi byte di
 * ciascun blocco, e ogni blocco se li ripara da solo.
 */
function sequenzaFinale(
  dati: Uint8Array,
  versione: number,
  livello: LivelloCorrezione,
): Uint8Array {
  const [perBlocco, blocchi1, lunghezza1, blocchi2, lunghezza2] = BLOCCHI[livello][versione - 1]

  const blocchiDati: Uint8Array[] = []
  const blocchiCorrezione: Uint8Array[] = []
  let posizione = 0

  for (let indice = 0; indice < blocchi1; indice += 1) {
    const blocco = dati.slice(posizione, posizione + lunghezza1)
    posizione += lunghezza1
    blocchiDati.push(blocco)
    blocchiCorrezione.push(correzione(blocco, perBlocco))
  }

  for (let indice = 0; indice < blocchi2; indice += 1) {
    const blocco = dati.slice(posizione, posizione + lunghezza2)
    posizione += lunghezza2
    blocchiDati.push(blocco)
    blocchiCorrezione.push(correzione(blocco, perBlocco))
  }

  const sequenza: number[] = []

  const lunghezzaMassima = Math.max(lunghezza1, lunghezza2)
  for (let colonna = 0; colonna < lunghezzaMassima; colonna += 1) {
    for (const blocco of blocchiDati) {
      if (colonna < blocco.length) sequenza.push(blocco[colonna])
    }
  }

  for (let colonna = 0; colonna < perBlocco; colonna += 1) {
    for (const blocco of blocchiCorrezione) sequenza.push(blocco[colonna])
  }

  return Uint8Array.from(sequenza)
}

/* ─────────────────────────────────────────────────────────────────────────
 * Disegno della matrice
 * ────────────────────────────────────────────────────────────────────── */

type Matrice = {
  dimensione: number
  moduli: Int8Array
  /** Moduli di servizio: non vengono mascherati né sovrascritti dai dati. */
  riservati: Uint8Array
}

function creaMatrice(dimensione: number): Matrice {
  return {
    dimensione,
    moduli: new Int8Array(dimensione * dimensione),
    riservati: new Uint8Array(dimensione * dimensione),
  }
}

function scrivi(matrice: Matrice, riga: number, colonna: number, scuro: boolean, riservato = true) {
  const indice = riga * matrice.dimensione + colonna
  matrice.moduli[indice] = scuro ? 1 : 0
  if (riservato) matrice.riservati[indice] = 1
}

function leggi(matrice: Matrice, riga: number, colonna: number): boolean {
  return matrice.moduli[riga * matrice.dimensione + colonna] === 1
}

/** Riquadro di ricerca 7×7 con il proprio separatore bianco. */
function disegnaRicerca(matrice: Matrice, rigaBase: number, colonnaBase: number) {
  for (let riga = -1; riga <= 7; riga += 1) {
    for (let colonna = -1; colonna <= 7; colonna += 1) {
      const r = rigaBase + riga
      const c = colonnaBase + colonna
      if (r < 0 || c < 0 || r >= matrice.dimensione || c >= matrice.dimensione) continue

      const bordo = riga === 0 || riga === 6 || colonna === 0 || colonna === 6
      const nucleo = riga >= 2 && riga <= 4 && colonna >= 2 && colonna <= 4
      const dentro = riga >= 0 && riga <= 6 && colonna >= 0 && colonna <= 6

      scrivi(matrice, r, c, dentro && (bordo || nucleo))
    }
  }
}

/** Riquadri di allineamento 5×5, saltando quelli che coprirebbero i ricerca. */
function disegnaAllineamenti(matrice: Matrice, versione: number) {
  const centri = ALLINEAMENTI[versione - 1]

  for (const riga of centri) {
    for (const colonna of centri) {
      const suRicerca =
        (riga === 6 && colonna === 6) ||
        (riga === 6 && colonna === matrice.dimensione - 7) ||
        (riga === matrice.dimensione - 7 && colonna === 6)
      if (suRicerca) continue

      for (let dr = -2; dr <= 2; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) {
          const bordo = Math.abs(dr) === 2 || Math.abs(dc) === 2
          const centro = dr === 0 && dc === 0
          scrivi(matrice, riga + dr, colonna + dc, bordo || centro)
        }
      }
    }
  }
}

/** Linee di sincronismo e modulo scuro fisso. */
function disegnaServizio(matrice: Matrice, versione: number) {
  for (let indice = 8; indice < matrice.dimensione - 8; indice += 1) {
    const scuro = indice % 2 === 0
    scrivi(matrice, 6, indice, scuro)
    scrivi(matrice, indice, 6, scuro)
  }

  // Il modulo sempre scuro previsto dallo standard.
  scrivi(matrice, matrice.dimensione - 8, 8, true)

  // Aree dell'informazione di formato: si riservano ora, si riempiono dopo la
  // scelta della maschera.
  for (let indice = 0; indice < 9; indice += 1) {
    if (indice !== 6) {
      scrivi(matrice, 8, indice, false)
      scrivi(matrice, indice, 8, false)
    }
  }
  for (let indice = 0; indice < 8; indice += 1) {
    scrivi(matrice, 8, matrice.dimensione - 1 - indice, false)
    if (indice < 7) scrivi(matrice, matrice.dimensione - 1 - indice, 8, false)
  }

  if (versione >= 7) {
    const info = INFO_VERSIONE[versione]
    for (let indice = 0; indice < 18; indice += 1) {
      const bit = ((info >> indice) & 1) === 1
      const riga = Math.floor(indice / 3)
      const colonna = matrice.dimensione - 11 + (indice % 3)
      scrivi(matrice, riga, colonna, bit)
      scrivi(matrice, colonna, riga, bit)
    }
  }
}

/**
 * Deposita i byte nella matrice seguendo il percorso a zigzag previsto dallo
 * standard: colonne a coppie, dal basso a destra verso l'alto, saltando la
 * colonna 6 che è occupata dalla linea di sincronismo verticale.
 */
function disponiDati(matrice: Matrice, sequenza: Uint8Array) {
  let bit = 0
  let versoAlto = true

  for (let colonnaDestra = matrice.dimensione - 1; colonnaDestra >= 1; colonnaDestra -= 2) {
    // La colonna 6 è occupata dalla linea di sincronismo verticale: quando la
    // coppia la incontrerebbe, si sposta di uno a sinistra. Lo spostamento
    // cambia anche il punto di partenza delle coppie successive, ed è per
    // questo che si riassegna la variabile del ciclo invece di usarne una di
    // appoggio: con una copia locale le colonne a sinistra del sincronismo
    // verrebbero percorse due volte e la colonna 0 mai.
    if (colonnaDestra === 6) colonnaDestra = 5

    for (let passo = 0; passo < matrice.dimensione; passo += 1) {
      const riga = versoAlto ? matrice.dimensione - 1 - passo : passo

      for (let scostamento = 0; scostamento < 2; scostamento += 1) {
        const colonna = colonnaDestra - scostamento
        const indice = riga * matrice.dimensione + colonna
        if (matrice.riservati[indice]) continue

        const byte = sequenza[bit >> 3]
        // Oltre la fine della sequenza restano i moduli di riempimento chiari:
        // lo standard li prevede quando la capienza non è un multiplo esatto.
        const valore = byte === undefined ? 0 : (byte >> (7 - (bit & 7))) & 1
        matrice.moduli[indice] = valore
        bit += 1
      }
    }

    versoAlto = !versoAlto
  }
}

/** Le otto maschere previste dallo standard. */
function maschera(indice: number, riga: number, colonna: number): boolean {
  switch (indice) {
    case 0:
      return (riga + colonna) % 2 === 0
    case 1:
      return riga % 2 === 0
    case 2:
      return colonna % 3 === 0
    case 3:
      return (riga + colonna) % 3 === 0
    case 4:
      return (Math.floor(riga / 2) + Math.floor(colonna / 3)) % 2 === 0
    case 5:
      return ((riga * colonna) % 2) + ((riga * colonna) % 3) === 0
    case 6:
      return (((riga * colonna) % 2) + ((riga * colonna) % 3)) % 2 === 0
    default:
      return (((riga + colonna) % 2) + ((riga * colonna) % 3)) % 2 === 0
  }
}

/** Informazione di formato: 5 bit di dati, BCH(15,5), poi maschera 0x5412. */
function infoFormato(livello: LivelloCorrezione, indiceMaschera: number): number {
  const dati = (BIT_LIVELLO[livello] << 3) | indiceMaschera
  let resto = dati << 10

  for (let indice = 14; indice >= 10; indice -= 1) {
    if ((resto >> indice) & 1) resto ^= 0b10100110111 << (indice - 10)
  }

  return ((dati << 10) | resto) ^ 0b101010000010010
}

function scriviFormato(matrice: Matrice, livello: LivelloCorrezione, indiceMaschera: number) {
  const info = infoFormato(livello, indiceMaschera)
  const dimensione = matrice.dimensione

  for (let indice = 0; indice < 15; indice += 1) {
    const bit = ((info >> indice) & 1) === 1

    /*
     * Prima copia, attorno al riquadro di ricerca in alto a sinistra: i primi
     * sette bit scendono lungo la colonna 8, gli altri proseguono lungo la
     * riga 8 verso sinistra. Le due tratte saltano la riga e la colonna 6,
     * occupate dalle linee di sincronismo.
     */
    if (indice < 6) scrivi(matrice, indice, 8, bit)
    else if (indice === 6) scrivi(matrice, 7, 8, bit)
    else if (indice === 7) scrivi(matrice, 8, 8, bit)
    else if (indice === 8) scrivi(matrice, 8, 7, bit)
    else scrivi(matrice, 8, 14 - indice, bit)

    /*
     * Seconda copia, divisa fra gli altri due riquadri: gli otto bit bassi
     * lungo la riga 8 a sinistra del riquadro in alto a destra, i sette alti
     * lungo la colonna 8 sopra quello in basso a sinistra. Il modulo
     * (dimensione − 8, 8) resta fuori: è quello sempre scuro previsto dallo
     * standard, non un bit di formato.
     */
    if (indice < 8) scrivi(matrice, 8, dimensione - 1 - indice, bit)
    else scrivi(matrice, dimensione - 15 + indice, 8, bit)
  }
}

/**
 * Penalità di una matrice mascherata, secondo le quattro regole dello standard.
 *
 * Servono a scegliere la maschera che rende il simbolo più facile da leggere:
 * penalizzano le sequenze lunghe dello stesso colore, i blocchi pieni, le
 * figure che assomigliano a un riquadro di ricerca e lo sbilanciamento fra
 * moduli chiari e scuri.
 */
function penalita(matrice: Matrice): number {
  const n = matrice.dimensione
  let totale = 0

  // Regola 1: cinque o più moduli uguali consecutivi, in riga e in colonna.
  for (let riga = 0; riga < n; riga += 1) {
    let precedenteRiga = leggi(matrice, riga, 0)
    let contoRiga = 1
    let precedenteColonna = leggi(matrice, 0, riga)
    let contoColonna = 1

    for (let indice = 1; indice < n; indice += 1) {
      const valoreRiga = leggi(matrice, riga, indice)
      if (valoreRiga === precedenteRiga) contoRiga += 1
      else {
        if (contoRiga >= 5) totale += contoRiga - 2
        precedenteRiga = valoreRiga
        contoRiga = 1
      }

      const valoreColonna = leggi(matrice, indice, riga)
      if (valoreColonna === precedenteColonna) contoColonna += 1
      else {
        if (contoColonna >= 5) totale += contoColonna - 2
        precedenteColonna = valoreColonna
        contoColonna = 1
      }
    }

    if (contoRiga >= 5) totale += contoRiga - 2
    if (contoColonna >= 5) totale += contoColonna - 2
  }

  // Regola 2: ogni blocco 2×2 dello stesso colore.
  for (let riga = 0; riga < n - 1; riga += 1) {
    for (let colonna = 0; colonna < n - 1; colonna += 1) {
      const valore = leggi(matrice, riga, colonna)
      if (
        valore === leggi(matrice, riga, colonna + 1) &&
        valore === leggi(matrice, riga + 1, colonna) &&
        valore === leggi(matrice, riga + 1, colonna + 1)
      ) {
        totale += 3
      }
    }
  }

  /*
   * Regola 3: la figura 1:1:3:1:1 con quattro moduli chiari da un lato, che un
   * lettore potrebbe scambiare per un riquadro di ricerca.
   *
   * Si scorre una finestra di undici moduli confrontandola con le due forme
   * previste — `10111010000` e `00001011101` — invece di cercare la figura e
   * poi guardarsi attorno: il conteggio così è quello dello standard anche
   * quando le due forme si sovrappongono, e sono proprio le sovrapposizioni a
   * spostare la scelta della maschera da una all'altra.
   */
  const FORMA_A = 0b10111010000
  const FORMA_B = 0b00001011101

  for (let riga = 0; riga < n; riga += 1) {
    let finestraRiga = 0
    let finestraColonna = 0

    for (let indice = 0; indice < n; indice += 1) {
      finestraRiga = ((finestraRiga << 1) & 0x7ff) | (leggi(matrice, riga, indice) ? 1 : 0)
      finestraColonna = ((finestraColonna << 1) & 0x7ff) | (leggi(matrice, indice, riga) ? 1 : 0)

      if (indice < 10) continue
      if (finestraRiga === FORMA_A || finestraRiga === FORMA_B) totale += 40
      if (finestraColonna === FORMA_A || finestraColonna === FORMA_B) totale += 40
    }
  }

  /*
   * Regola 4: scostamento dal cinquanta per cento di moduli scuri, a scatti di
   * cinque punti percentuali.
   */
  let scuri = 0
  for (let indice = 0; indice < matrice.moduli.length; indice += 1) {
    if (matrice.moduli[indice] === 1) scuri += 1
  }
  const scatti = Math.abs(
    Math.ceil((scuri * 100) / matrice.moduli.length / 5) - 10,
  )
  totale += scatti * 10

  return totale
}

/* ─────────────────────────────────────────────────────────────────────────
 * Interfaccia pubblica
 * ────────────────────────────────────────────────────────────────────── */

export type CodiceQr = {
  /** Lato della matrice in moduli, bordo escluso. */
  dimensione: number
  versione: number
  livello: LivelloCorrezione
  /** `true` = modulo scuro. Indicizzata come `[riga][colonna]`. */
  moduli: boolean[][]
}

/** Costruisce la matrice di un codice QR a partire dal testo. */
export function generaQr(testo: string, livello: LivelloCorrezione = 'Q'): CodiceQr {
  const messaggio = new TextEncoder().encode(testo)
  const versione = scegliVersione(messaggio.length, livello)
  const dimensione = versione * 4 + 17

  const dati = codificaDati(messaggio, versione, livello)
  const sequenza = sequenzaFinale(dati, versione, livello)

  // Si disegna una volta la parte fissa, poi si prova ogni maschera su una
  // copia e si tiene quella con la penalità minore.
  const base = creaMatrice(dimensione)
  disegnaRicerca(base, 0, 0)
  disegnaRicerca(base, 0, dimensione - 7)
  disegnaRicerca(base, dimensione - 7, 0)
  disegnaAllineamenti(base, versione)
  disegnaServizio(base, versione)
  disponiDati(base, sequenza)

  let migliore: Matrice | null = null
  let minima = Number.POSITIVE_INFINITY

  for (let indiceMaschera = 0; indiceMaschera < 8; indiceMaschera += 1) {
    const prova: Matrice = {
      dimensione,
      moduli: base.moduli.slice(),
      riservati: base.riservati,
    }

    for (let riga = 0; riga < dimensione; riga += 1) {
      for (let colonna = 0; colonna < dimensione; colonna += 1) {
        const indice = riga * dimensione + colonna
        if (prova.riservati[indice]) continue
        if (maschera(indiceMaschera, riga, colonna)) prova.moduli[indice] ^= 1
      }
    }

    scriviFormato(prova, livello, indiceMaschera)

    const punteggio = penalita(prova)
    if (punteggio < minima) {
      minima = punteggio
      migliore = prova
    }
  }

  const scelta = migliore as Matrice
  const moduli: boolean[][] = []
  for (let riga = 0; riga < dimensione; riga += 1) {
    const valori: boolean[] = []
    for (let colonna = 0; colonna < dimensione; colonna += 1) {
      valori.push(scelta.moduli[riga * dimensione + colonna] === 1)
    }
    moduli.push(valori)
  }

  return { dimensione, versione, livello, moduli }
}

/**
 * Traccia SVG del codice: un solo `path` invece di centinaia di rettangoli.
 *
 * Un `<rect>` per modulo su una versione 4 significa più di mille elementi nel
 * DOM per ogni biglietto in elenco; un percorso unico è un nodo solo e si
 * comprime meglio.
 */
export function tracciaQr(codice: CodiceQr): string {
  const pezzi: string[] = []
  for (let riga = 0; riga < codice.dimensione; riga += 1) {
    for (let colonna = 0; colonna < codice.dimensione; colonna += 1) {
      if (codice.moduli[riga][colonna]) pezzi.push(`M${colonna} ${riga}h1v1h-1z`)
    }
  }
  return pezzi.join('')
}

/**
 * Codice QR completo come documento SVG.
 *
 * Il bordo chiaro di quattro moduli è obbligatorio: senza, molti lettori non
 * agganciano il simbolo. Il colore è un parametro perché sul biglietto il QR è
 * scuro su chiaro, ma nell'area personale sta su fondo nero.
 */
export function qrSvg(
  testo: string,
  {
    livello = 'Q',
    bordo = 4,
    colore = '#000000',
    sfondo = '#ffffff',
  }: { livello?: LivelloCorrezione; bordo?: number; colore?: string; sfondo?: string } = {},
): string {
  const codice = generaQr(testo, livello)
  const lato = codice.dimensione + bordo * 2

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lato} ${lato}" shape-rendering="crispEdges">`,
    sfondo === 'trasparente' ? '' : `<rect width="${lato}" height="${lato}" fill="${sfondo}"/>`,
    `<g transform="translate(${bordo} ${bordo})" fill="${colore}">`,
    `<path d="${tracciaQr(codice)}"/>`,
    '</g></svg>',
  ].join('')
}
