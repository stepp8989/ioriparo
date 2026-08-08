/**
 * Icone del sito.
 *
 * Disegnate a mano in SVG e servite dal codice: nessun pacchetto di icone da
 * scaricare, nessuna richiesta in più, e il colore è sempre quello del testo
 * che le circonda. Tutte stanno nella stessa griglia da 24 e hanno lo stesso
 * spessore di tratto, che è ciò che le fa sembrare una famiglia.
 *
 * Le icone sono decorative: il significato sta sempre nel testo accanto, e
 * quindi restano nascoste ai lettori di schermo.
 */

const TRATTI = {
  globo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
    </>
  ),
  carrello: (
    <>
      <path d="M2.5 3.5h2.2l2.3 11.2a1.7 1.7 0 0 0 1.7 1.3h8.4a1.7 1.7 0 0 0 1.7-1.3l1.6-7H6" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
    </>
  ),
  dispositivi: (
    <>
      <rect x="1.5" y="4.5" width="14" height="10" rx="1.6" />
      <path d="M4.5 18.5h9" />
      <rect x="16.5" y="9.5" width="6" height="11" rx="1.6" />
      <path d="M19 18.2h1" />
    </>
  ),
  razzo: (
    <>
      <path d="M12 2.5c3 2 4.8 5.4 4.8 9.2l-.1 3.5-4.7 3.3-4.7-3.3-.1-3.5C7.2 7.9 9 4.5 12 2.5Z" />
      <circle cx="12" cy="10.4" r="2" />
      <path d="M7.2 12.6 4 15.4l.9 3.9 3.4-1.7M16.8 12.6 20 15.4l-.9 3.9-3.4-1.7" />
    </>
  ),
  tavolozza: (
    <>
      <path d="M12 3.2c-4.9 0-8.8 3.6-8.8 8.4S7.1 20 12 20c1.4 0 2.2-.9 2.2-1.9 0-.6-.3-1-.7-1.4-.4-.4-.6-.8-.6-1.3 0-1 .9-1.8 2-1.8h1.5c2.4 0 4.4-1.9 4.4-4.3 0-3.4-3.5-6.1-6.8-6.1Z" />
      <circle cx="7.6" cy="11.4" r="1.1" />
      <circle cx="10.6" cy="7.6" r="1.1" />
      <circle cx="15.4" cy="8.4" r="1.1" />
    </>
  ),
  lente: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  circuito: (
    <>
      <rect x="7.5" y="7.5" width="9" height="9" rx="1.6" />
      <path d="M10.5 3.5v4M13.5 3.5v4M10.5 16.5v4M13.5 16.5v4M3.5 10.5h4M3.5 13.5h4M16.5 10.5h4M16.5 13.5h4" />
    </>
  ),
  chiave: (
    <>
      <path d="M15.6 3.6a5.2 5.2 0 0 0-4.8 7.2L3.6 18l2.4 2.4 7.2-7.2a5.2 5.2 0 0 0 6.6-6.6l-2.9 2.9-2.6-.7-.7-2.6 2.9-2.9a5.4 5.4 0 0 0-1-.7Z" />
    </>
  ),
  lampadina: (
    <>
      <path d="M9 17.2a6 6 0 1 1 6 0v1.3a1.4 1.4 0 0 1-1.4 1.4h-3.2A1.4 1.4 0 0 1 9 18.5Z" />
      <path d="M10 21.8h4" />
    </>
  ),
  codice: (
    <>
      <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.6 4.5l-3.2 15" />
    </>
  ),
  freccia: <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" />,
  frecciaGiu: <path d="M12 4.5v15m0 0 5.5-5.5M12 19.5 6.5 14" />,
  chiudi: <path d="m6 6 12 12M18 6 6 18" />,
  spunta: <path d="m4.5 12.5 5 5 10-11" />,
  telefono: (
    <path d="M6.4 3.5h3l1.5 4-2 1.4a12 12 0 0 0 6.2 6.2l1.4-2 4 1.5v3c0 1-.8 1.9-1.9 1.9A16.6 16.6 0 0 1 4.5 5.4c0-1 .9-1.9 1.9-1.9Z" />
  ),
  busta: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  posizione: (
    <>
      <path d="M12 21.5s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10.3" r="2.6" />
    </>
  ),
  orologio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.8V12l3.4 2.2" />
    </>
  ),
  scudo: (
    <>
      <path d="M12 2.8 4.5 6v6c0 4.4 3 8.1 7.5 9.2 4.5-1.1 7.5-4.8 7.5-9.2V6Z" />
      <path d="m8.8 12 2.3 2.3 4.1-4.6" />
    </>
  ),
  fulmine: <path d="M13.5 2.5 5 13.5h5.5L9.5 21.5 19 10.5h-5.6Z" />,
  instagram: (
    <>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.1" cy="6.9" r="1.05" fill="currentColor" stroke="none" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="3.4" />
      <path d="M7.6 10.4v6.4M7.6 7.6v.1M11.4 16.8v-6.4M11.4 13.1c0-1.5.9-2.4 2.3-2.4s2.3.9 2.3 2.6v3.5" />
    </>
  ),
  behance: (
    <>
      <path d="M2.6 6.8h4.6c1.6 0 2.6.8 2.6 2.1s-1 2.1-2.6 2.1H2.6Zm0 4.2h5c1.8 0 2.9.9 2.9 2.3s-1.1 2.4-2.9 2.4h-5Z" />
      <path d="M13.8 8.6h5.6M13.4 14c0-2 1.4-3.4 3.3-3.4S20 12 20 13.9v.5h-6.6c.1 1.6 1.2 2.6 2.8 2.6 1.1 0 1.9-.4 2.5-1.2" />
    </>
  ),
  github: (
    <path d="M9.3 20.6c-4 1.2-4-2.1-5.6-2.5m11.2 5v-3.4c0-1 .1-1.4-.5-2 2.6-.3 5-1.3 5-5.5a4.2 4.2 0 0 0-1.2-3 3.9 3.9 0 0 0-.1-3s-1-.3-3.2 1.2a11 11 0 0 0-5.7 0C6.9 5 5.9 5.3 5.9 5.3a3.9 3.9 0 0 0-.1 3 4.3 4.3 0 0 0-1.2 3c0 4.2 2.4 5.2 5 5.5-.6.6-.6 1.2-.5 2v3.4" />
  ),
  whatsapp: (
    <path d="M3.5 20.5 5 16.4a7.8 7.8 0 1 1 3 3ZM9 9.2c-.3.6-.2 1.4.3 2.2a7 7 0 0 0 3.2 3c.9.4 1.7.4 2.2 0l.6-.6-1.9-1.2-.7.7a5.4 5.4 0 0 1-2-2l.7-.7-1.2-1.9Z" />
  ),
} as const

export type NomeIcona = keyof typeof TRATTI

type Props = {
  nome: NomeIcona
  /** Lato in pixel. Le icone sono quadrate. */
  misura?: number
  className?: string
  /** Spessore del tratto. */
  spessore?: number
}

export function Icona({ nome, misura = 24, className, spessore = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={misura}
      height={misura}
      fill="none"
      stroke="currentColor"
      strokeWidth={spessore}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {TRATTI[nome]}
    </svg>
  )
}
