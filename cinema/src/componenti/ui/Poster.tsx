import { classi } from '@/lib/utili'

/**
 * Locandine e fondali disegnati dal sito.
 *
 * Il progetto non porta con sé nemmeno un'immagine di repertorio, e non è una
 * scorciatoia: un catalogo dimostrativo pieno di fotografie prese in giro per
 * la rete è un problema di licenze che prima o poi presenta il conto. Quando
 * il campo `locandina` di un film è vuoto, il sito disegna un manifesto
 * astratto a partire dai due colori della sua `palette`.
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

/** Sequenza deterministica di numeri fra 0 e 1. */
function sequenza(valoreIniziale: number) {
  let stato = valoreIniziale >>> 0
  return () => {
    stato = (stato * 1_664_525 + 1_013_904_223) >>> 0
    return stato / 0x1_0000_0000
  }
}

type PropsDisegno = {
  /** Chiave stabile: l'identificativo del film o del prodotto. */
  chiave: string
  palette: readonly [string, string]
  /** Proporzione del riquadro disegnato. */
  larghezza: number
  altezza: number
}

/**
 * Motivo grafico del manifesto.
 *
 * Quattro composizioni, scelte dal seme: un disco basso all'orizzonte, una
 * serie di archi concentrici, fasce orizzontali sfalsate e un fascio obliquo.
 * Sono astratte per necessità e per scelta: un finto fotogramma sarebbe
 * peggiore di un manifesto dichiaratamente grafico.
 */
function Motivo({ chiave, palette, larghezza, altezza }: PropsDisegno) {
  const prossimo = sequenza(seme(chiave))
  const motivo = Math.floor(prossimo() * 4)
  const [, chiaro] = palette

  const centroX = larghezza * (0.3 + prossimo() * 0.4)

  if (motivo === 0) {
    const raggio = altezza * (0.2 + prossimo() * 0.12)
    const centroY = altezza * (0.52 + prossimo() * 0.14)
    return (
      <g>
        <circle cx={centroX} cy={centroY} r={raggio} fill={chiaro} opacity="0.85" />
        <circle cx={centroX} cy={centroY} r={raggio * 1.5} fill="none" stroke={chiaro} strokeWidth={altezza * 0.004} opacity="0.35" />
        <rect x="0" y={centroY} width={larghezza} height={altezza - centroY} fill="url(#velo)" />
      </g>
    )
  }

  if (motivo === 1) {
    const centroY = altezza * 0.62
    return (
      <g fill="none" stroke={chiaro} strokeLinecap="round">
        {Array.from({ length: 7 }, (_, indice) => (
          <circle
            key={indice}
            cx={centroX}
            cy={centroY}
            r={altezza * (0.08 + indice * 0.075)}
            strokeWidth={altezza * 0.006}
            opacity={0.55 - indice * 0.06}
          />
        ))}
      </g>
    )
  }

  if (motivo === 2) {
    return (
      <g fill={chiaro}>
        {Array.from({ length: 6 }, (_, indice) => {
          const y = altezza * (0.3 + indice * 0.1)
          const larga = larghezza * (0.25 + prossimo() * 0.6)
          const x = prossimo() * (larghezza - larga)
          return (
            <rect
              key={indice}
              x={x}
              y={y}
              width={larga}
              height={altezza * 0.016}
              rx={altezza * 0.008}
              opacity={0.28 + indice * 0.08}
            />
          )
        })}
      </g>
    )
  }

  // Fascio obliquo: richiama il cono di luce del proiettore.
  return (
    <g>
      <polygon
        points={`${larghezza * 0.42},0 ${larghezza * 0.58},0 ${larghezza * 1.05},${altezza} ${-larghezza * 0.05},${altezza}`}
        fill={chiaro}
        opacity="0.14"
      />
      <polygon
        points={`${larghezza * 0.47},0 ${larghezza * 0.53},0 ${larghezza * 0.78},${altezza} ${larghezza * 0.22},${altezza}`}
        fill={chiaro}
        opacity="0.2"
      />
    </g>
  )
}

/** Fondale comune a locandine e backdrop. */
function Disegno({ chiave, palette, larghezza, altezza }: PropsDisegno) {
  const [scuro, chiaro] = palette
  const id = seme(chiave).toString(36)

  return (
    <svg
      viewBox={`0 0 ${larghezza} ${altezza}`}
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden
    >
      <defs>
        <linearGradient id={`fondo-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={scuro} />
          <stop offset="55%" stopColor={scuro} stopOpacity="0.92" />
          <stop offset="100%" stopColor="#05040a" />
        </linearGradient>
        <radialGradient id={`alone-${id}`} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor={chiaro} stopOpacity="0.4" />
          <stop offset="100%" stopColor={chiaro} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="velo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05040a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#05040a" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <rect width={larghezza} height={altezza} fill={`url(#fondo-${id})`} />
      <rect width={larghezza} height={altezza} fill={`url(#alone-${id})`} />
      <Motivo chiave={chiave} palette={palette} larghezza={larghezza} altezza={altezza} />
      {/* Velo scuro in basso: serve a far leggere il titolo che ci sta sopra. */}
      <rect y={altezza * 0.5} width={larghezza} height={altezza * 0.5} fill="url(#velo)" />
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
  mostraTitolo = true,
}: {
  titolo: string
  chiave: string
  palette: readonly [string, string]
  immagine?: string
  className?: string
  mostraTitolo?: boolean
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
      <Disegno chiave={chiave} palette={palette} larghezza={400} altezza={600} />

      {mostraTitolo && (
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-titolo text-[0.95rem] font-semibold leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
            {titolo}
          </p>
        </div>
      )}

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
      <Disegno chiave={`${chiave}-fondale`} palette={palette} larghezza={1600} altezza={900} />
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
      <Disegno chiave={chiave} palette={palette} larghezza={600} altezza={600} />
    </div>
  )
}
