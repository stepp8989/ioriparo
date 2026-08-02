/**
 * Set di icone del progetto.
 *
 * Sono disegnate qui dentro invece di installare una libreria: il sito ne usa
 * una trentina e includerle come tracciati evita un pacchetto in più nel
 * bundle e qualsiasi richiesta a domini esterni. Tutte condividono la stessa
 * griglia 24×24 e lo stesso spessore di linea, così restano coerenti.
 */

const TRACCIATI = {
  menu: 'M4 7h16M4 12h16M4 17h16',
  chiudi: 'M6 6l12 12M18 6L6 18',
  freccia: 'M5 12h14M13 6l6 6-6 6',
  frecciaSu: 'M12 19V5M6 11l6-6 6 6',
  frecciaGiu: 'M12 5v14M6 13l6 6 6-6',
  chevron: 'M6 9l6 6 6-6',
  chevronSinistra: 'M15 6l-6 6 6 6',
  chevronDestra: 'M9 6l6 6-6 6',
  telefono:
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
  posta: 'M3 6h18v12H3zM3 7l9 6 9-6',
  posizione: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  orologio: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  calendario: 'M7 3v4M17 3v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  persone:
    'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  utente: 'M19 21v-2a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  sole: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  luna: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  spunta: 'M20 6L9 17l-5-5',
  piu: 'M12 5v14M5 12h14',
  meno: 'M5 12h14',
  cestino: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
  matita: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  cerca: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  stampa: 'M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z',
  esci: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  esterno: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
  virgolette:
    'M9.5 6C6.5 7.4 5 9.9 5 13.4V18h5.6v-5.6H8.3c0-2 .6-3.4 2.3-4.3zM19 6c-3 1.4-4.5 3.9-4.5 7.4V18h5.6v-5.6h-2.3c0-2 .6-3.4 2.3-4.3z',
  campanella: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  foglia: 'M11 20A7 7 0 0 1 4 13c0-6 8-10 16-10 0 8-4 15-9 16zM4 21c2-4 5-7 9-9',
  bicchiere: 'M8 22h8M12 15v7M5 3h14l-1.5 6a5.5 5.5 0 0 1-11 0z',
  cappello: 'M6 21h12M6 17h12v4H6zM12 3a4 4 0 0 0-3.9 3.1A3.5 3.5 0 0 0 6.5 13h11a3.5 3.5 0 0 0-1.6-6.9A4 4 0 0 0 12 3z',
  posate: 'M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 3c-2 0-3 3-3 6s1 4 3 4v8',
  griglia: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  documento: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4',
  ingranaggio:
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.4 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z',
  fotocamera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
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
  tripadvisor: (
    <>
      <circle cx="7" cy="12" r="4" />
      <circle cx="17" cy="12" r="4" />
      <circle cx="7" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="17" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <path d="M11 12h2M4.5 8.5C6 6.5 9 5.5 12 5.5s6 1 7.5 3" />
    </>
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
