import { classi } from '@/lib/utili'

/**
 * Locandine e fondali disegnati dal sito.
 *
 * Il progetto non porta con sé nemmeno un'immagine di repertorio, e non è una
 * scorciatoia: un catalogo dimostrativo pieno di fotografie prese in giro per
 * la rete è un problema di licenze che prima o poi presenta il conto. Quando il
 * campo `locandina` di un film è vuoto, il sito disegna un manifesto a partire
 * dal titolo e dai due colori della sua `palette`.
 *
 * Il manifesto è **tipografico**, non astratto. È la differenza con la prima
 * versione, ed è deliberata: una composizione di cerchi e fasce, per quanto
 * curata, il visitatore la legge come «immagine mancante», perché non gli dice
 * niente del film. Un titolo composto in condensato maiuscolo che riempie il
 * riquadro da un bordo all'altro, invece, è una scelta grafica riconoscibile —
 * è il modo in cui sono fatti i manifesti veri — e intanto fa il lavoro che alla
 * locandina si chiede in una griglia: far leggere il titolo da lontano.
 *
 * Il disegno è deterministico: lo stesso film produce sempre la stessa
 * locandina, su tutte le pagine e a ogni ricarica. Serve al riconoscimento —
 * una scheda che cambia aspetto a ogni visita non si impara — e permette di
 * disegnare lato server senza differenze rispetto al browser.
 *
 * Appena l'amministratore carica la locandina vera, questa sparisce: è
 * `<Locandina>` a decidere, e nessuna pagina deve preoccuparsene.
 */

/** Numero stabile da una stringa: la base di tutte le scelte del disegno. */
function seme(testo: string): number {
  let valore = 0x811c9dc5
  for (const carattere of testo) {
    valore ^= carattere.charCodeAt(0)
    valore = Math.imul(valore, 0x01000193) >>> 0
  }
  return valore
}

/**
 * Larghezza media di una maiuscola in condensato, in frazione di corpo.
 * Serve a stimare il corpo con cui una riga riempie la colonna; l'errore
 * residuo lo assorbe `textLength`, che allarga o stringe le lettere fino alla
 * misura esatta.
 */
const LARGHEZZA_GLIFO = 0.47

/**
 * Spezza il titolo in righe, senza mai tagliare una parola.
 *
 * Il numero di righe nasce dalla lunghezza: un titolo di una parola resta su
 * una riga grande, uno lungo si distribuisce su tre o quattro. Le righe si
 * riempiono fino alla misura obiettivo e non oltre, così restano di larghezza
 * confrontabile e il blocco non fa la scaletta.
 */
function spezza(titolo: string, righeMassime: number): string[] {
  const parole = titolo.toUpperCase().split(/\s+/).filter(Boolean)
  if (parole.length === 0) return ['']

  const caratteri = parole.reduce((somma, parola) => somma + parola.length, 0) + parole.length - 1
  const righe = Math.min(righeMassime, Math.max(1, Math.round(caratteri / 9)), parole.length)
  const obiettivo = caratteri / righe

  const risultato: string[] = []
  let corrente = ''

  for (const parola of parole) {
    if (!corrente) {
      corrente = parola
      continue
    }
    // Si va a capo quando la parola sfonderebbe la misura obiettivo più di
    // quanto la riga attuale le resti sotto: è il criterio che produce il
    // blocco più compatto senza dover provare tutte le combinazioni.
    const conAggiunta = corrente.length + 1 + parola.length
    if (
      risultato.length < righe - 1 &&
      Math.abs(conAggiunta - obiettivo) > Math.abs(corrente.length - obiettivo)
    ) {
      risultato.push(corrente)
      corrente = parola
    } else {
      corrente = `${corrente} ${parola}`
    }
  }
  risultato.push(corrente)

  return risultato
}

type PropsDisegno = {
  /** Chiave stabile: l'identificativo del film o del prodotto. */
  chiave: string
  palette: readonly [string, string]
}

/**
 * Manifesto tipografico in proporzione 2:3.
 *
 * Due composizioni, scelte dal seme: titolo appoggiato in basso — la più
 * comune, perché lascia respirare il campo di colore — oppure in alto, sotto
 * una riga di dati. Non di più: la locandina deve restare riconoscibile come
 * famiglia, non sembrare un generatore.
 */
function ManifestoTipografico({
  chiave,
  palette,
  titolo,
  sopra,
  sotto,
}: PropsDisegno & { titolo: string; sopra?: string; sotto?: string }) {
  const larghezza = 400
  const altezza = 600
  const margine = 32
  const colonna = larghezza - margine * 2

  const [scuro, chiaro] = palette
  const id = seme(chiave).toString(36)
  const inAlto = seme(`${chiave}-posa`) % 3 === 0

  const righe = spezza(titolo, 4)
  // Corpo che riempie la colonna, con un tetto: una riga di due lettere non
  // deve diventare alta mezzo manifesto.
  const corpi = righe.map((riga) =>
    Math.min(altezza * 0.15, colonna / Math.max(1, riga.length * LARGHEZZA_GLIFO)),
  )

  /*
   * Impaginazione del blocco di titolo. Si ragiona sul **bordo superiore** del
   * blocco e non sulla prima linea di base: la maiuscola di un condensato sta a
   * circa 0,72 del corpo sopra la linea di base, e calcolare tutto dalla linea
   * di base faceva finire la riga dei dati dentro il titolo ogni volta che il
   * corpo cambiava.
   */
  const ALTEZZA_MAIUSCOLA = 0.72
  const INTERLINEA = 0.86
  const blocco = corpi.reduce((somma, corpo) => somma + corpo * INTERLINEA, 0)
  const bloccoAlto = inAlto
    ? margine + 56
    : altezza - margine - (sotto ? 34 : 6) - blocco

  let cursore = bloccoAlto

  return (
    <svg
      viewBox={`0 0 ${larghezza} ${altezza}`}
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden
    >
      <defs>
        <linearGradient id={`fondo-${id}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={chiaro} stopOpacity="0.32" />
          <stop offset="46%" stopColor={scuro} />
          <stop offset="100%" stopColor="#050506" />
        </linearGradient>
        <radialGradient id={`alone-${id}`} cx="76%" cy="20%" r="70%">
          <stop offset="0%" stopColor={chiaro} stopOpacity="0.5" />
          <stop offset="100%" stopColor={chiaro} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={larghezza} height={altezza} fill={scuro} />
      <rect width={larghezza} height={altezza} fill={`url(#fondo-${id})`} />
      <rect width={larghezza} height={altezza} fill={`url(#alone-${id})`} />

      {/* Filo di colore lungo il bordo alto: il segno che tiene insieme la
          famiglia di manifesti anche quando i titoli sono lunghissimi. */}
      <rect width={larghezza} height={5} fill={chiaro} />

      <g
        fontFamily="var(--font-stretto), var(--font-archivio), sans-serif"
        fontWeight="700"
        fill="#ffffff"
      >
        {righe.map((riga, indice) => {
          const corpo = corpi[indice]
          const naturale = riga.length * corpo * LARGHEZZA_GLIFO
          const base = cursore + corpo * ALTEZZA_MAIUSCOLA
          cursore += corpo * INTERLINEA
          return (
            <text
              key={indice}
              x={margine}
              y={base}
              fontSize={corpo}
              textLength={Math.min(colonna, naturale)}
              lengthAdjust="spacingAndGlyphs"
            >
              {riga}
            </text>
          )
        })}
      </g>

      {sopra && (
        <text
          x={margine}
          y={inAlto ? margine + 32 : bloccoAlto - 14}
          fontFamily="var(--font-testo), sans-serif"
          fontSize="15"
          fontWeight="600"
          letterSpacing="3"
          fill={chiaro}
        >
          {sopra.toUpperCase()}
        </text>
      )}

      {sotto && (
        <text
          x={margine}
          y={altezza - margine}
          fontFamily="var(--font-testo), sans-serif"
          fontSize="14"
          fontWeight="500"
          letterSpacing="1.4"
          fill="#ffffff"
          opacity="0.6"
        >
          {sotto.toUpperCase()}
        </text>
      )}
    </svg>
  )
}

/**
 * Fondale panoramico: campo di colore in due tagli obliqui, senza testo.
 * Qui il titolo lo mette la pagina sopra l'immagine, e un manifesto con le
 * lettere al centro glielo renderebbe illeggibile.
 */
function CampoLargo({ chiave, palette }: PropsDisegno) {
  const [scuro, chiaro] = palette
  const id = seme(chiave).toString(36)
  const taglio = 0.34 + (seme(`${chiave}-taglio`) % 100) / 400

  return (
    <svg
      viewBox="0 0 1600 900"
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden
    >
      <defs>
        <linearGradient id={`largo-${id}`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor={scuro} />
          <stop offset="100%" stopColor="#050506" />
        </linearGradient>
        <radialGradient id={`luce-${id}`} cx="62%" cy="26%" r="58%">
          <stop offset="0%" stopColor={chiaro} stopOpacity="0.4" />
          <stop offset="100%" stopColor={chiaro} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="900" fill={`url(#largo-${id})`} />
      <polygon points={`0,900 ${1600 * taglio},0 ${1600 * (taglio + 0.3)},0 0,900`} fill={chiaro} opacity="0.1" />
      <polygon points={`1600,0 1600,900 ${1600 * (taglio + 0.5)},900`} fill={chiaro} opacity="0.07" />
      <rect width="1600" height="900" fill={`url(#luce-${id})`} />
    </svg>
  )
}

/** Marchio quadrato per i prodotti del banco alimentari: iniziali su colore. */
function Monogramma({ chiave, palette, etichetta }: PropsDisegno & { etichetta: string }) {
  const [scuro, chiaro] = palette
  const id = seme(chiave).toString(36)
  const iniziali = etichetta
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parola) => parola[0])
    .join('')
    .toUpperCase()

  return (
    <svg
      viewBox="0 0 600 600"
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden
    >
      <defs>
        <linearGradient id={`mono-${id}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={chiaro} stopOpacity="0.3" />
          <stop offset="100%" stopColor={scuro} />
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill={scuro} />
      <rect width="600" height="600" fill={`url(#mono-${id})`} />
      <text
        x="300"
        y="300"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-stretto), var(--font-archivio), sans-serif"
        fontWeight="700"
        fontSize="300"
        fill="#ffffff"
        opacity="0.92"
      >
        {iniziali}
      </text>
    </svg>
  )
}

/**
 * Locandina di un film in proporzione 2:3.
 *
 * `immagine` vince sempre: quando c'è, il disegno non viene nemmeno prodotto.
 */
export function Locandina({
  titolo,
  chiave,
  palette,
  immagine = '',
  className,
  sopra,
  sotto,
}: {
  titolo: string
  chiave: string
  palette: readonly [string, string]
  immagine?: string
  className?: string
  /** Riga di dati sopra il titolo: anno, genere. */
  sopra?: string
  /** Riga in fondo al manifesto: regia, o quello che la pagina ritiene utile. */
  sotto?: string
}) {
  if (immagine) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element -- l'indirizzo arriva
         dall'archivio e può puntare a un dominio non noto in fase di build,
         dove l'ottimizzatore di Next non può intervenire. */
      <img
        src={immagine}
        alt={`Locandina di ${titolo}`}
        loading="lazy"
        className={classi('size-full object-cover', className)}
      />
    )
  }

  return (
    <div className={classi('relative size-full overflow-hidden bg-notte', className)}>
      <ManifestoTipografico
        chiave={chiave}
        palette={palette}
        titolo={titolo}
        sopra={sopra}
        sotto={sotto}
      />
      <div className="grana pointer-events-none absolute inset-0" aria-hidden />
    </div>
  )
}

/** Fondale panoramico, per l'apertura della home e le schede film. */
export function Fondale({
  chiave,
  palette,
  immagine = '',
  className,
  alt = '',
}: {
  chiave: string
  palette: readonly [string, string]
  immagine?: string
  className?: string
  alt?: string
}) {
  if (immagine) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element -- vedi `Locandina`. */
      <img src={immagine} alt={alt} className={classi('size-full object-cover', className)} />
    )
  }

  return (
    <div className={classi('relative size-full overflow-hidden bg-notte', className)}>
      <CampoLargo chiave={`${chiave}-fondale`} palette={palette} />
      <div className="grana pointer-events-none absolute inset-0" aria-hidden />
    </div>
  )
}

/** Illustrazione quadrata per i prodotti del banco alimentari. */
export function Illustrazione({
  chiave,
  palette,
  immagine = '',
  className,
  alt = '',
}: {
  chiave: string
  palette: readonly [string, string]
  immagine?: string
  className?: string
  alt?: string
}) {
  if (immagine) {
    /* eslint-disable-next-line @next/next/no-img-element -- vedi `Locandina`. */
    return <img src={immagine} alt={alt} className={classi('size-full object-cover', className)} />
  }

  return (
    <div className={classi('relative size-full overflow-hidden bg-notte', className)}>
      <Monogramma chiave={chiave} palette={palette} etichetta={alt || chiave} />
    </div>
  )
}
