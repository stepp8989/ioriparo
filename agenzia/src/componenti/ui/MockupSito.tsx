import type { Blocco, Progetto } from '@/dati/portfolio'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Anteprima di un sito, disegnata dal vivo
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Invece di dieci schermate in PNG — dieci file da scaricare, sfocati sui
 * monitor ad alta densità e da rifare a ogni ritocco — ogni anteprima è un SVG
 * composto qui, blocco per blocco, a partire dalla struttura dichiarata in
 * `portfolio.ts` e dai due colori del cliente.
 *
 * Il vantaggio non è solo il peso: cambiare l'ordine dei blocchi di un
 * progetto è una riga di dati, e l'anteprima resta nitida a qualsiasi
 * ingrandimento, che è esattamente quello che serve quando la si mostra dentro
 * uno schermo che ruota in tre dimensioni.
 *
 * Tutto è disegnato senza JavaScript: il componente è reso sul server e nel
 * pacchetto del browser non finisce nulla.
 */

/** Altezza di ciascun blocco nel sistema di coordinate dell'anteprima. */
const ALTEZZE: Record<Blocco, number> = {
  'eroe-grande': 200,
  'eroe-diviso': 168,
  ricerca: 56,
  'griglia-3': 126,
  'griglia-4': 112,
  elenco: 136,
  galleria: 128,
  prezzi: 150,
  modulo: 146,
  mappa: 124,
  fascia: 64,
}

const LARGHEZZA = 400
const INTESTAZIONE = 38
const PIEDE = 72

/**
 * Altezza complessiva dell'anteprima, nelle stesse coordinate.
 *
 * Serve a chi la incornicia: sapendo quanto è alta la pagina si calcola
 * esattamente di quanto può scorrere dentro la finestra, senza mostrare una
 * striscia vuota in fondo né fermarsi a metà.
 */
export function altezzaMockup(progetto: Progetto): number {
  return (
    INTESTAZIONE + progetto.blocchi.reduce((somma, blocco) => somma + ALTEZZE[blocco], 0) + PIEDE
  )
}

export function MockupSito({ progetto }: { progetto: Progetto }) {
  const { palette, blocchi, id } = progetto
  const primario = palette.primario
  const secondario = palette.secondario

  /* Inchiostri derivati dal fondo: su carta chiara si scrive scuro. */
  const forte = palette.chiaro ? 'rgb(15 23 42 / .82)' : 'rgb(248 250 252 / .88)'
  const medio = palette.chiaro ? 'rgb(15 23 42 / .28)' : 'rgb(248 250 252 / .34)'
  const tenue = palette.chiaro ? 'rgb(15 23 42 / .11)' : 'rgb(248 250 252 / .14)'
  const linea = palette.chiaro ? 'rgb(15 23 42 / .07)' : 'rgb(248 250 252 / .09)'
  const superficie = palette.chiaro ? 'rgb(15 23 42 / .04)' : 'rgb(248 250 252 / .05)'

  const sfumatura = `mockup-${id}-eroe`

  /** Barra di testo segnaposto. */
  const barra = (
    chiave: string,
    x: number,
    y: number,
    larghezza: number,
    altezza: number,
    colore: string,
    raggio = 2,
  ) => (
    <rect key={chiave} x={x} y={y} width={larghezza} height={altezza} rx={raggio} fill={colore} />
  )

  function disegna(blocco: Blocco, y: number, indice: number) {
    const chiave = `${blocco}-${indice}`

    switch (blocco) {
      /* Apertura a tutta larghezza: fondo pieno, titolo al centro, un pulsante. */
      case 'eroe-grande':
        return (
          <g key={chiave}>
            <rect x="0" y={y} width={LARGHEZZA} height={200} fill={`url(#${sfumatura})`} />
            <circle cx="330" cy={y + 46} r="58" fill={primario} opacity="0.16" />
            {barra('t1', 92, y + 62, 216, 16, 'rgb(255 255 255 / .92)', 3)}
            {barra('t2', 132, y + 86, 136, 16, 'rgb(255 255 255 / .92)', 3)}
            {barra('t3', 116, y + 118, 168, 7, 'rgb(255 255 255 / .5)')}
            <rect x="152" y={y + 142} width="96" height="26" rx="13" fill={primario} />
          </g>
        )

      /* Apertura divisa: testo a sinistra, immagine a destra. */
      case 'eroe-diviso':
        return (
          <g key={chiave}>
            <rect x="0" y={y} width={LARGHEZZA} height={168} fill={superficie} />
            {barra('t1', 28, y + 40, 150, 14, forte, 3)}
            {barra('t2', 28, y + 62, 110, 14, forte, 3)}
            {barra('t3', 28, y + 90, 160, 6, medio)}
            {barra('t4', 28, y + 102, 132, 6, medio)}
            <rect x="28" y={y + 122} width="88" height="24" rx="12" fill={primario} />
            <rect x="216" y={y + 26} width="156" height="116" rx="10" fill={primario} opacity="0.22" />
            <circle cx="258" cy={y + 62} r="16" fill={primario} opacity="0.5" />
            <path
              d={`M216 ${y + 122} l40 -34 30 24 34 -30 52 42 z`}
              fill={secondario}
              opacity="0.45"
            />
          </g>
        )

      /* Barra di ricerca con i filtri. */
      case 'ricerca':
        return (
          <g key={chiave}>
            <rect x="0" y={y} width={LARGHEZZA} height={56} fill={superficie} />
            <rect x="28" y={y + 14} width="228" height="28" rx="14" fill={palette.fondo} stroke={linea} />
            {barra('lente', 42, y + 25, 40, 6, medio)}
            <rect x="266" y={y + 14} width="50" height="28" rx="14" fill={tenue} />
            <rect x="322" y={y + 14} width="50" height="28" rx="14" fill={primario} />
          </g>
        )

      /* Tre schede affiancate. */
      case 'griglia-3':
        return (
          <g key={chiave}>
            {[0, 1, 2].map((colonna) => {
              const x = 28 + colonna * 118
              return (
                <g key={colonna}>
                  <rect x={x} y={y + 20} width="106" height="90" rx="8" fill={superficie} stroke={linea} />
                  <rect x={x} y={y + 20} width="106" height="44" rx="8" fill={primario} opacity={0.2 + colonna * 0.08} />
                  {barra(`a${colonna}`, x + 12, y + 74, 62, 7, forte)}
                  {barra(`b${colonna}`, x + 12, y + 88, 82, 5, medio)}
                </g>
              )
            })}
          </g>
        )

      /* Quattro riquadri di prodotto. */
      case 'griglia-4':
        return (
          <g key={chiave}>
            {[0, 1, 2, 3].map((colonna) => {
              const x = 28 + colonna * 88
              return (
                <g key={colonna}>
                  <rect x={x} y={y + 14} width="76" height="60" rx="7" fill={primario} opacity={0.16 + colonna * 0.06} />
                  <circle cx={x + 38} cy={y + 44} r="14" fill={secondario} opacity="0.35" />
                  {barra(`a${colonna}`, x, y + 82, 54, 6, forte)}
                  {barra(`b${colonna}`, x, y + 93, 32, 6, primario)}
                </g>
              )
            })}
          </g>
        )

      /* Elenco: menu, listino, immobili, veicoli. */
      case 'elenco':
        return (
          <g key={chiave}>
            {barra('titolo', 28, y + 14, 96, 9, forte, 3)}
            {[0, 1, 2, 3].map((riga) => {
              const ry = y + 34 + riga * 26
              return (
                <g key={riga}>
                  <rect x="28" y={ry} width="344" height="22" rx="6" fill={superficie} />
                  <rect x="34" y={ry + 4} width="14" height="14" rx="4" fill={primario} opacity="0.6" />
                  {barra(`a${riga}`, 56, ry + 6, 108 - riga * 8, 5, forte)}
                  {barra(`b${riga}`, 56, ry + 14, 148, 4, medio)}
                  {barra(`p${riga}`, 336, ry + 8, 30, 6, primario)}
                </g>
              )
            })}
          </g>
        )

      /* Galleria: una grande e quattro piccole. */
      case 'galleria':
        return (
          <g key={chiave}>
            <rect x="28" y={y + 14} width="180" height="100" rx="8" fill={primario} opacity="0.28" />
            <circle cx="82" cy={y + 52} r="15" fill={secondario} opacity="0.5" />
            <path d={`M28 ${y + 114} l52 -40 38 28 40 -32 50 44 z`} fill={secondario} opacity="0.35" />
            {[0, 1, 2, 3].map((riquadro) => (
              <rect
                key={riquadro}
                x={218 + (riquadro % 2) * 80}
                y={y + 14 + Math.floor(riquadro / 2) * 52}
                width="72"
                height="44"
                rx="6"
                fill={primario}
                opacity={0.16 + riquadro * 0.07}
              />
            ))}
          </g>
        )

      /* Tre piani di prezzo, quello centrale in evidenza. */
      case 'prezzi':
        return (
          <g key={chiave}>
            {[0, 1, 2].map((colonna) => {
              const x = 28 + colonna * 118
              const centrale = colonna === 1
              return (
                <g key={colonna}>
                  <rect
                    x={x}
                    y={y + (centrale ? 10 : 22)}
                    width="106"
                    height={centrale ? 122 : 100}
                    rx="10"
                    fill={centrale ? primario : superficie}
                    opacity={centrale ? 0.92 : 1}
                    stroke={centrale ? 'none' : linea}
                  />
                  {barra(`n${colonna}`, x + 14, y + (centrale ? 26 : 36), 46, 6, centrale ? 'rgb(255 255 255 / .8)' : medio)}
                  {barra(`p${colonna}`, x + 14, y + (centrale ? 42 : 50), 60, 14, centrale ? '#ffffff' : forte, 3)}
                  {[0, 1, 2].map((riga) =>
                    barra(
                      `r${colonna}${riga}`,
                      x + 14,
                      y + (centrale ? 68 : 74) + riga * 12,
                      78 - riga * 12,
                      4,
                      centrale ? 'rgb(255 255 255 / .55)' : medio,
                    ),
                  )}
                  <rect
                    x={x + 14}
                    y={y + (centrale ? 106 : 106)}
                    width="78"
                    height="18"
                    rx="9"
                    fill={centrale ? '#ffffff' : primario}
                    opacity={centrale ? 0.95 : 0.8}
                  />
                </g>
              )
            })}
          </g>
        )

      /* Modulo di contatto o prenotazione. */
      case 'modulo':
        return (
          <g key={chiave}>
            <rect x="0" y={y} width={LARGHEZZA} height={146} fill={superficie} />
            {barra('titolo', 132, y + 20, 136, 10, forte, 3)}
            {[0, 1].map((colonna) => (
              <rect
                key={colonna}
                x={92 + colonna * 112}
                y={y + 44}
                width="104"
                height="22"
                rx="6"
                fill={palette.fondo}
                stroke={linea}
              />
            ))}
            <rect x="92" y={y + 72} width="216" height="22" rx="6" fill={palette.fondo} stroke={linea} />
            <rect x="92" y={y + 100} width="216" height="14" rx="6" fill={palette.fondo} stroke={linea} />
            <rect x="152" y={y + 120} width="96" height="20" rx="10" fill={primario} />
          </g>
        )

      /* Mappa con il segnaposto. */
      case 'mappa':
        return (
          <g key={chiave}>
            <rect x="0" y={y} width={LARGHEZZA} height={124} fill={secondario} opacity="0.18" />
            {[0, 1, 2, 3].map((strada) => (
              <path
                key={strada}
                d={`M${-20 + strada * 110} ${y + 124} L${60 + strada * 110} ${y}`}
                stroke={linea}
                strokeWidth="10"
                fill="none"
              />
            ))}
            <path d={`M0 ${y + 74} H400`} stroke={linea} strokeWidth="12" fill="none" />
            <circle cx="200" cy={y + 58} r="16" fill={primario} opacity="0.25" />
            <path
              d={`M200 ${y + 68} c-9 -10 -13 -16 -13 -22 a13 13 0 1 1 26 0 c0 6 -4 12 -13 22 z`}
              fill={primario}
            />
            <circle cx="200" cy={y + 46} r="4.5" fill={palette.fondo} />
          </g>
        )

      /* Fascia d'invito a tutta larghezza. */
      case 'fascia':
        return (
          <g key={chiave}>
            <rect x="0" y={y} width={LARGHEZZA} height={64} fill={primario} opacity="0.9" />
            {barra('t', 90, y + 22, 140, 9, 'rgb(255 255 255 / .85)', 3)}
            <rect x="246" y={y + 18} width="72" height="22" rx="11" fill="#ffffff" opacity="0.92" />
          </g>
        )
    }
  }

  /* Altezza totale: intestazione, blocchi in fila, piè di pagina. */
  const corpo = blocchi.reduce((somma, blocco) => somma + ALTEZZE[blocco], 0)
  const altezza = INTESTAZIONE + corpo + PIEDE

  let scorrimento = INTESTAZIONE

  return (
    <svg
      viewBox={`0 0 ${LARGHEZZA} ${altezza}`}
      width="100%"
      className="block"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMin slice"
    >
      <defs>
        <linearGradient id={sfumatura} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={secondario} />
          <stop offset="100%" stopColor={primario} stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* Carta. */}
      <rect x="0" y="0" width={LARGHEZZA} height={altezza} fill={palette.fondo} />

      {/* Intestazione del sito: marchio, voci di menu, pulsante. */}
      <g>
        <rect x="0" y="0" width={LARGHEZZA} height={INTESTAZIONE} fill={palette.fondo} />
        <circle cx="38" cy="19" r="8" fill={primario} />
        {barra('nome', 52, 15, 44, 8, forte)}
        {[0, 1, 2].map((voce) => barra(`v${voce}`, 178 + voce * 40, 16, 30, 6, medio))}
        <rect x="308" y="9" width="64" height="20" rx="10" fill={primario} />
        <path d={`M0 ${INTESTAZIONE} H400`} stroke={linea} strokeWidth="1" />
      </g>

      {blocchi.map((blocco, indice) => {
        const y = scorrimento
        scorrimento += ALTEZZE[blocco]
        return disegna(blocco, y, indice)
      })}

      {/* Piè di pagina. */}
      <g>
        <rect x="0" y={altezza - PIEDE} width={LARGHEZZA} height={PIEDE} fill={secondario} opacity="0.9" />
        <circle cx="38" cy={altezza - PIEDE + 24} r="7" fill={primario} />
        {barra('fn', 52, altezza - PIEDE + 20, 40, 7, 'rgb(255 255 255 / .55)')}
        {[0, 1, 2].map((colonna) =>
          [0, 1, 2].map((riga) =>
            barra(
              `f${colonna}${riga}`,
              216 + colonna * 60,
              altezza - PIEDE + 18 + riga * 12,
              40 - riga * 6,
              4,
              'rgb(255 255 255 / .3)',
            ),
          ),
        )}
      </g>
    </svg>
  )
}
