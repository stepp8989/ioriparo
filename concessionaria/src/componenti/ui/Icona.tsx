/**
 * Set di icone del progetto.
 *
 * Sono disegnate qui dentro invece di installare una libreria: il sito ne usa
 * una sessantina e includerle come tracciati evita un pacchetto in più nel
 * bundle e qualsiasi richiesta a domini esterni. Tutte condividono la stessa
 * griglia 24×24 e lo stesso spessore di linea, così restano coerenti.
 */

const TRACCIATI = {
  /* Navigazione e comandi */
  menu: 'M4 7h16M4 12h16M4 17h16',
  chiudi: 'M6 6l12 12M18 6L6 18',
  freccia: 'M5 12h14M13 6l6 6-6 6',
  frecciaSu: 'M12 19V5M6 11l6-6 6 6',
  frecciaGiu: 'M12 5v14M6 13l6 6 6-6',
  chevron: 'M6 9l6 6 6-6',
  chevronSinistra: 'M15 6l-6 6 6 6',
  chevronDestra: 'M9 6l6 6-6 6',
  cerca: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  filtro: 'M3 5h18M6 12h12M10 19h4',
  ordina: 'M3 6h12M3 12h9M3 18h6M17 8v11M17 19l3-3M17 19l-3-3',
  spunta: 'M20 6L9 17l-5-5',
  piu: 'M12 5v14M5 12h14',
  meno: 'M5 12h14',
  cestino: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
  matita: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  copia: 'M9 9h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  esci: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  esterno: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
  scarica: 'M12 3v12M7 11l5 5 5-5M4 20h16',
  griglia: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  elenco: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  sole: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  luna: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',

  /* Contatti */
  telefono:
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
  posta: 'M3 6h18v12H3zM3 7l9 6 9-6',
  posizione: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  orologio: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  calendario: 'M7 3v4M17 3v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  chat: 'M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.5-4.4A8.4 8.4 0 0 1 3.6 12a8.4 8.4 0 0 1 8.4-8.4h.5a8.4 8.4 0 0 1 8.5 7.9z',
  campanella: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',

  /* Veicoli e caratteristiche tecniche */
  auto: 'M5 17H3.5a1 1 0 0 1-1-1v-3.2a2 2 0 0 1 .5-1.3l1.6-1.9 1.5-3.9A2 2 0 0 1 8 4.4h8a2 2 0 0 1 1.9 1.3l1.5 3.9 1.6 1.9a2 2 0 0 1 .5 1.3V16a1 1 0 0 1-1 1H19M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM9 17h6M4.5 11h15',
  moto: 'M5.5 19a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM18.5 19a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5.5 15.5h5l4-6.5M9 6h3l2.5 3H19M14.5 9l4 6.5M12 15.5h2.5',
  casco: 'M3.5 14a8.5 8.5 0 0 1 17 0v1.5a2 2 0 0 1-2 2H11l-1.5 2-1.5-2H5.5a2 2 0 0 1-2-2zM8.5 8.5h9.2M4 13.5h9',
  chiave: 'M15.5 3a5.5 5.5 0 1 0-4.4 8.8L4 19v2h3v-2h2v-2h2l2.1-2.1A5.5 5.5 0 0 0 15.5 3zm1 4.5a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z',
  chiaveInglese: 'M14.7 6.3a4.5 4.5 0 0 0 5.8 5.8L21 12a5.5 5.5 0 0 1-7.7 5L6 21.5 2.5 18l4.6-7.3a5.5 5.5 0 0 1 5-7.7z',
  benzina: 'M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h13M6.5 8h5M14 9h3.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 0 3 0V11l-2.5-3',
  fulmine: 'M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12z',
  cambio: 'M6 4v16M12 4v9M18 4v16M6 4a1.5 1.5 0 1 0 0-.1M12 4a1.5 1.5 0 1 0 0-.1M18 4a1.5 1.5 0 1 0 0-.1M6 12h12',
  tachimetro: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 13.5l4-4.5M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  motore: 'M7 8h2V6h6v2h2l3 3v5h-2v3H6v-3H3v-5l2-1.5V8zM9 11h6',
  porta: 'M4 20V8l7-4h6a2 2 0 0 1 2 2v14zM13 12h2M4 20h15',
  sedile: 'M7 4h5a3 3 0 0 1 3 3v6H9a2 2 0 0 1-2-2zM15 13h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H9M6 20v-4',
  volante: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 9V3.2M9.4 13.5L4.3 16.4M14.6 13.5l5.1 2.9',
  strada: 'M8 3L4 21M16 3l4 18M12 4v3M12 11v3M12 18v3',
  faro: 'M4 8a4 4 0 0 1 4-4h2a8 8 0 0 1 0 16H8a4 4 0 0 1-4-4zM16 8h5M16 12h6M16 16h5',
  co2: 'M8 15a4 4 0 1 1 0-6M12 12h.01M14 9h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3v-6zM20 15h2',

  /* Servizi */
  goccia: 'M12 3s6 6.4 6 10.5a6 6 0 0 1-12 0C6 9.4 12 3 12 3z',
  brillante: 'M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4zM18 15l.8 2 2.2.7-2.2.7-.8 2-.8-2-2.2-.7 2.2-.7zM6 16l.6 1.5 1.6.5-1.6.5L6 20l-.6-1.5-1.6-.5 1.6-.5z',
  lucido: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.5 10.5a4 4 0 0 1 3.5-2.5M4 4l2 2M20 4l-2 2',
  diamante: 'M6 3h12l3 6-9 12L3 9zM3 9h18M9 3l3 6 3-6M12 9v12',
  scudo: 'M12 3l8 3v5.5c0 5-3.4 8.6-8 9.5-4.6-.9-8-4.5-8-9.5V6zM9 12l2 2 4-4',
  pellicola: 'M4 5h16v14H4zM4 9h16M4 15h16M9 5v14M15 5v14',
  spruzzo: 'M8 8h6v13H8zM8 12h6M14 4h3M14 7h4M18 3.5v.01M20 6v.01M18 9v.01',
  calcolatrice: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01',
  scambio: 'M4 8h13l-3-3M20 16H7l3 3',
  carta: 'M2 7h20v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zM2 11h20M5.5 15.5h4',
  euro: 'M17 5.5A6.5 6.5 0 0 0 7 11v2a6.5 6.5 0 0 0 10 5.5M4 11h8M4 14h7',
  consegna: 'M2 7h11v9H2zM13 10h4l4 3v3h-8zM6.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM17.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z',

  /* Contenuti e stato */
  utente: 'M19 21v-2a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  persone: 'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  documento: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4',
  cartella: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  grafico: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  fotocamera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  riproduci: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM10 8.5l6 3.5-6 3.5z',
  cuore: 'M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z',
  verifica: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 12.3l2.4 2.4 4.6-5',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  avviso: 'M12 3l9.5 17H2.5zM12 10v4M12 17h.01',
  occhio: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  occhioBarrato: 'M4 4l16 16M10 5.2A9.6 9.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.3 4M6.3 7.5A17 17 0 0 0 2 12s3.6 7 10 7c1.6 0 3-.4 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2',
  lucchetto: 'M6 10h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zM8 10V7a4 4 0 0 1 8 0v3M12 15v2',
  targa: 'M3 7h18a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM7 11v2M11 11v2M15 11v2M19 11v2',
} as const

/** Icone con più tracciati o con riempimenti: gestite a parte. */
const SPECIALI = {
  stella: (
    <path
      d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.3l6.5-.9z"
      fill="currentColor"
      stroke="none"
    />
  ),
  stellaVuota: (
    <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.3l6.5-.9z" />
  ),
  whatsapp: (
    <path
      d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 0 1 12 3.8zm-3.4 4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.7 2.1.8 2.5.7 2.9.6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.4-3c-.1-.2 0-.4.1-.5l.5-.6c.1-.2.2-.3.3-.5v-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5z"
      fill="currentColor"
      stroke="none"
    />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path
      d="M14 9V7.3c0-.8.2-1.3 1.4-1.3H17V3.1C16.6 3 15.7 3 14.7 3 12.3 3 10.7 4.4 10.7 7v2H8v3h2.7v9H14v-9h2.7l.4-3z"
      fill="currentColor"
      stroke="none"
    />
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.2 9.4l5 2.6-5 2.6z" fill="currentColor" stroke="none" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 10.5V17M7 7.4v.01M11 17v-3.8a2 2 0 0 1 4 0V17" />
    </>
  ),
  paypal: (
    <path
      d="M7.6 20.5H5.1a.6.6 0 0 1-.6-.7L6.9 4.2a.9.9 0 0 1 .9-.7h5.6c3 0 5 1.5 4.6 4.6-.4 3.1-2.6 4.7-5.7 4.7H10l-.9 6.2a.9.9 0 0 1-.9.8zm3.1-9.9h1.5c1.6 0 2.8-.7 3-2.4.2-1.5-.7-2.1-2.2-2.1h-1.5zM18.4 9.4c.9.7 1.2 1.8 1 3.3-.4 3.1-2.6 4.7-5.7 4.7h-.8l-.5 3.4a.6.6 0 0 1-.6.5"
      fill="none"
    />
  ),
} as const

export type NomeIcona = keyof typeof TRACCIATI | keyof typeof SPECIALI

type Props = {
  nome: NomeIcona
  className?: string
  spessore?: number
  /**
   * Testo alternativo. Se assente l'icona è considerata decorativa e viene
   * nascosta alle tecnologie assistive: è il caso più frequente, perché
   * accanto c'è quasi sempre un'etichetta leggibile.
   */
  etichetta?: string
}

export function Icona({ nome, className = 'size-5', spessore = 1.5, etichetta }: Props) {
  const speciale = nome in SPECIALI ? SPECIALI[nome as keyof typeof SPECIALI] : null

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={spessore}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={etichetta ? 'img' : undefined}
      aria-label={etichetta}
      aria-hidden={etichetta ? undefined : true}
      focusable="false"
    >
      {speciale ?? <path d={TRACCIATI[nome as keyof typeof TRACCIATI]} />}
    </svg>
  )
}
