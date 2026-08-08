/**
 * Il sito com'era.
 *
 * L'anteprima del «prima»: impaginazione a tabella, menu a linguette, colonna
 * di collegamenti sottolineati, testo minuscolo e fitto, pulsanti smussati, il
 * contatore delle visite in fondo. Non è una caricatura gratuita — sono
 * davvero le cose che si trovano ancora oggi aprendo il sito di tante attività,
 * ed è proprio il confronto a spiegare, senza dire una parola, perché rifarlo.
 *
 * Le proporzioni sono quelle di una pagina intera, non del riquadro: nel
 * confronto si vede la parte alta di entrambi i siti, esattamente come li
 * vedrebbe un visitatore appena arrivato. È l'unico paragone onesto — mostrare
 * tutto il sito vecchio e solo l'apertura di quello nuovo sarebbe un trucco.
 */
export function MockupVecchio() {
  const grigio = '#d9d9d2'
  const bordo = '#a9a99f'
  const testo = 'rgb(30 30 30 / .62)'
  const tenue = 'rgb(30 30 30 / .3)'

  return (
    <svg
      viewBox="0 0 400 460"
      width="100%"
      className="block"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMin slice"
    >
      <defs>
        <linearGradient id="vecchio-testata" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b5aa6" />
          <stop offset="100%" stopColor="#1c2e5c" />
        </linearGradient>
        <linearGradient id="vecchio-pulsante" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2f2ec" />
          <stop offset="100%" stopColor="#c3c3b8" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="400" height="460" fill={grigio} />

      {/* Testata con sfumatura e titolo in rilievo. */}
      <rect x="0" y="0" width="400" height="42" fill="url(#vecchio-testata)" />
      <rect x="10" y="9" width="24" height="24" rx="2" fill="#e8c341" stroke="#8a6f14" />
      <rect x="42" y="13" width="120" height="9" rx="1" fill="rgb(255 255 255 / .85)" />
      <rect x="42" y="26" width="86" height="5" rx="1" fill="rgb(255 255 255 / .45)" />
      <rect
        x="286"
        y="14"
        width="104"
        height="16"
        rx="2"
        fill="rgb(255 255 255 / .18)"
        stroke="rgb(255 255 255 / .3)"
      />
      <rect x="292" y="20" width="60" height="4" rx="1" fill="rgb(255 255 255 / .5)" />

      {/* Menu di navigazione a linguette. */}
      <rect x="0" y="42" width="400" height="18" fill="#c7c7bd" stroke={bordo} />
      {[0, 1, 2, 3, 4, 5].map((voce) => (
        <g key={voce}>
          <rect
            x={6 + voce * 65}
            y="45"
            width="61"
            height="13"
            rx="1"
            fill="url(#vecchio-pulsante)"
            stroke={bordo}
          />
          <rect x={14 + voce * 65} y="50" width={36 - (voce % 3) * 6} height="3" rx="1" fill={testo} />
        </g>
      ))}

      {/* Colonna sinistra: elenco di collegamenti sottolineati. */}
      <rect x="8" y="68" width="96" height="300" fill="#ecece3" stroke={bordo} />
      <rect x="8" y="68" width="96" height="14" fill="#8fa4d0" />
      <rect x="14" y="72" width="52" height="6" rx="1" fill="rgb(255 255 255 / .8)" />
      {Array.from({ length: 13 }, (_, riga) => (
        <g key={riga}>
          <rect
            x="14"
            y={92 + riga * 20}
            width={72 - (riga % 4) * 11}
            height="4"
            rx="1"
            fill="#1c3fa0"
          />
          <rect x="14" y={97 + riga * 20} width={72 - (riga % 4) * 11} height="0.8" fill="#1c3fa0" />
        </g>
      ))}

      {/* Contenuto: titolo di benvenuto e paragrafi fitti. */}
      <rect x="112" y="68" width="280" height="300" fill="#f4f4ee" stroke={bordo} />
      <rect x="122" y="80" width="196" height="11" rx="1" fill="#1c3fa0" />
      {Array.from({ length: 9 }, (_, riga) => (
        <rect
          key={riga}
          x="122"
          y={104 + riga * 9}
          width={riga === 8 ? 148 : 260}
          height="3.5"
          rx="1"
          fill={testo}
        />
      ))}

      {/* Immagine con cornice e didascalia. */}
      <rect x="122" y="198" width="80" height="56" fill="#b9c8e4" stroke={bordo} />
      <path d="M122 254 l24 -22 16 12 18 -16 22 26 z" fill="#7f93b8" />
      <circle cx="150" cy="216" r="6" fill="#e8e2c4" />
      {Array.from({ length: 6 }, (_, riga) => (
        <rect
          key={riga}
          x="212"
          y={200 + riga * 9}
          width={riga === 5 ? 60 : 168}
          height="3.5"
          rx="1"
          fill={testo}
        />
      ))}

      {/* Altre due righe di paragrafo e il pulsante smussato. */}
      {Array.from({ length: 5 }, (_, riga) => (
        <rect
          key={riga}
          x="122"
          y={272 + riga * 9}
          width={riga === 4 ? 120 : 260}
          height="3.5"
          rx="1"
          fill={testo}
        />
      ))}
      <rect
        x="122"
        y="328"
        width="76"
        height="22"
        rx="3"
        fill="url(#vecchio-pulsante)"
        stroke={bordo}
      />
      <rect x="138" y="337" width="44" height="4" rx="1" fill={testo} />
      <rect x="212" y="334" width="120" height="4" rx="1" fill={tenue} />
      <rect x="212" y="343" width="86" height="4" rx="1" fill={tenue} />

      {/* Riquadro delle novità, con la stellina «nuovo». */}
      <rect x="8" y="378" width="384" height="34" fill="#fdf6d8" stroke="#c9b96b" />
      <path d="M22 386 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z" fill="#e0a52a" />
      <rect x="42" y="390" width="150" height="4.5" rx="1" fill={testo} />
      <rect x="42" y="399" width="220" height="4" rx="1" fill={tenue} />

      {/* Piè di pagina: contatore visite e note tecniche. */}
      <rect x="0" y="420" width="400" height="40" fill="#c7c7bd" stroke={bordo} />
      {[0, 1, 2, 3].map((cifra) => (
        <g key={cifra}>
          <rect x={12 + cifra * 15} y="430" width="14" height="12" fill="#111" />
          <rect x={16 + cifra * 15} y="434" width="6" height="4" rx="0.5" fill="#5be25b" />
        </g>
      ))}
      <rect x="82" y="433" width="96" height="4" rx="1" fill={tenue} />
      <rect x="238" y="429" width="150" height="4" rx="1" fill={tenue} />
      <rect x="278" y="438" width="110" height="4" rx="1" fill={tenue} />
    </svg>
  )
}
