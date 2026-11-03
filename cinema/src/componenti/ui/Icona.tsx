/**
 * Set di icone del progetto.
 *
 * Sono disegnate qui dentro invece di installare una libreria: la piattaforma
 * ne usa una cinquantina e includerle come tracciati evita un pacchetto in più
 * nel bundle e qualsiasi richiesta a domini esterni. Tutte condividono la
 * stessa griglia 24×24 e lo stesso spessore di linea, così restano coerenti
 * anche affiancate.
 */

const TRACCIATI = {
  /* Navigazione e comandi */
  menu: 'M4 7h16M4 12h16M4 17h16',
  chiudi: 'M6 6l12 12M18 6L6 18',
  freccia: 'M5 12h14M13 6l6 6-6 6',
  frecciaIndietro: 'M19 12H5M11 18l-6-6 6-6',
  chevron: 'M6 9l6 6 6-6',
  chevronSu: 'M6 15l6-6 6 6',
  chevronSinistra: 'M15 6l-6 6 6 6',
  chevronDestra: 'M9 6l6 6-6 6',
  cerca: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  filtro: 'M3 5h18M6 12h12M10 19h4',
  spunta: 'M20 6L9 17l-5-5',
  piu: 'M12 5v14M5 12h14',
  meno: 'M5 12h14',
  cestino: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
  matita: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  copia: 'M9 9h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  esci: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  esterno: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
  scarica: 'M12 3v12M7 11l5 5 5-5M4 20h16',
  aggiorna: 'M20 11A8 8 0 1 0 18 16M20 5v6h-6',
  griglia: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  elenco: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  sole: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  luna: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  impostazioni:
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z',

  /* Cinema */
  pellicola:
    'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM3 8h18M3 16h18M7 3v5M7 16v5M17 3v5M17 16v5',
  ciak: 'M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3.6 9L2.4 5.3l16.2-3 1.2 3.7M8.6 8.2L7.4 4.5M13.6 7.2l-1.2-3.7',
  proiettore:
    'M7 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM16 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 13h17v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM6 18v2M17 18v2M20.5 9.5l2-1.5M20.5 12h2.5',
  schermo: 'M3 5h18l-1.5 9.5a1 1 0 0 1-1 .8H5.5a1 1 0 0 1-1-.8zM8 19h8M12 15.3V19',
  poltrona:
    'M6 11V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M4 11h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zM6 17v3M18 17v3M12 11v6',
  biglietto:
    'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4zM14 6v2M14 11v2M14 16v2',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2zM6.5 6.5h1v1h-1zM16.5 6.5h1v1h-1zM6.5 16.5h1v1h-1z',
  play: 'M7 4.8v14.4a.6.6 0 0 0 .92.5l11.3-7.2a.6.6 0 0 0 0-1l-11.3-7.2A.6.6 0 0 0 7 4.8z',
  pausa: 'M8 5h3v14H8zM13 5h3v14h-3z',
  popcorn:
    'M7 9l1.4 11.2a1 1 0 0 0 1 .8h5.2a1 1 0 0 0 1-.8L17 9zM7 9h10M8.4 6.2a2 2 0 1 1 3-2.2 2 2 0 0 1 3.5 1.2 2 2 0 0 1 1.3 3.8H7.8a2 2 0 0 1 .6-2.8zM10.6 9l.5 11M13.4 9l-.5 11',
  bibita: 'M6 5h12l-1.3 15.1a1 1 0 0 1-1 .9H8.3a1 1 0 0 1-1-.9zM6.4 10h11.2M10 3.5l1 1.5M14.5 3l-1 2',
  stella: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9-5.3-2.9-5.3 2.9 1.1-5.9L3.5 9.7l5.9-.8z',
  cuore: 'M12 20.3l-1.4-1.3C5.6 14.5 2.5 11.7 2.5 8.3A4.8 4.8 0 0 1 7.3 3.5c1.7 0 3.3.8 4.7 2.4 1.4-1.6 3-2.4 4.7-2.4a4.8 4.8 0 0 1 4.8 4.8c0 3.4-3.1 6.2-8.1 10.7z',
  regalo: 'M3 11h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM2.5 7h19v4h-19zM12 7v14M12 7S10.5 3 8 3a2 2 0 0 0 0 4zM12 7s1.5-4 4-4a2 2 0 0 1 0 4z',
  tessera: 'M2.5 6h19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-19a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM1.5 10h21M5 14h4M16 14h3',
  trofeo: 'M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M10 14h4l.6 3h-5.2zM7.5 20h9M9.4 17l-.4 3M14.6 17l.4 3',
  percento: 'M19 5L5 19M7.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM16.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  carta: 'M2.5 6h19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-19a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM1.5 10h21M5 14.5h4',
  moneta: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM14.5 9a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.7-2.5 2s1.1 1.7 2.5 2 2.7.7 2.7 2.2-1.2 2.3-2.7 2.3A2.7 2.7 0 0 1 9.2 15M12 6v1.5M12 16.5V18',
  portafoglio: 'M3 7a2 2 0 0 1 2-2h12v4M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3M3 7h17a1 1 0 0 1 1 1v3h-5a2 2 0 0 0 0 4h5',

  /* Contatti e luoghi */
  telefono:
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
  posta: 'M3 6h18v12H3zM3 7l9 6 9-6',
  posizione:
    'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  bussola: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  orologio: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  calendario:
    'M7 3v4M17 3v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  campanella: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  parcheggio: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM10 17V7h3a3 3 0 0 1 0 6h-3',
  accessibile:
    'M12 5.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5zM9 9l3 1h4M12 10v4h4l2 5M12 14a4.5 4.5 0 1 0 4 6.5',
  wifi: 'M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M1.5 9a15 15 0 0 1 21 0',

  /* Persone e stato */
  utente: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  utenti:
    'M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  lucchetto: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4M12 15v3',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  avviso: 'M12 3l9.5 17H2.5zM12 10v4M12 17h.01',
  grafico: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  fulmine: 'M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12z',
  fuoco: 'M12 22a6 6 0 0 0 6-6c0-4-3-5-3-9 0 0-3 1.5-3 5 0-2-1.5-3-1.5-3S9 11 9 13c0-1.5-1-2.5-1-2.5S6 13 6 16a6 6 0 0 0 6 6z',
} as const

export type NomeIcona = keyof typeof TRACCIATI

export function Icona({
  nome,
  className = 'size-5',
  spessore = 1.7,
  pieno = false,
  ...resto
}: {
  nome: NomeIcona
  className?: string
  spessore?: number
  /** Riempie invece di tracciare: usato da stelle, cuori e pulsante play. */
  pieno?: boolean
} & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={pieno ? 'currentColor' : 'none'}
      stroke={pieno ? 'none' : 'currentColor'}
      strokeWidth={spessore}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable="false"
      {...resto}
    >
      <path d={TRACCIATI[nome]} />
    </svg>
  )
}
