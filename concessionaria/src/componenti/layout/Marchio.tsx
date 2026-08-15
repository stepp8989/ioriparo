import Link from 'next/link'
import { AZIENDA } from '@/dati/azienda'
import { classi } from '@/lib/utili'

/**
 * Marchio del sito.
 *
 * Il simbolo è disegnato qui come SVG in linea invece di essere caricato come
 * file: è piccolo, compare su ogni pagina e in questo modo non costa una
 * richiesta di rete né provoca uno sfarfallio prima del caricamento. La stessa
 * forma, esportata in `public/marchio/`, serve per favicon e icone PWA.
 */
export function Simbolo({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id="marchio-sfumatura" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accento-2)" />
          <stop offset="100%" stopColor="var(--accento-1)" />
        </linearGradient>
      </defs>
      {/* Scudo stondato: il contenitore del marchio. */}
      <path
        d="M20 2.5 34.5 8v12.6c0 8.2-5.9 14.4-14.5 16.9C11.4 35 5.5 28.8 5.5 20.6V8z"
        fill="url(#marchio-sfumatura)"
      />
      {/* La «A» stilizzata, con la traversa che diventa una scia di velocità. */}
      <path d="M20 11.5 27.5 28h-4.2L20 20l-3.3 8h-4.2z" fill="#fff" />
      <path d="M13.5 23.5h13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}

export function Marchio({
  className,
  chiaro = false,
  compatto = false,
}: {
  className?: string
  /** Da attivare sopra fondi scuri o fotografie. */
  chiaro?: boolean
  /** Nasconde la riga descrittiva sotto il nome. */
  compatto?: boolean
}) {
  return (
    <Link
      href="/"
      className={classi('group inline-flex items-center gap-3', className)}
      aria-label={`${AZIENDA.nomeCompleto} — vai alla home`}
    >
      <Simbolo className="size-9 shrink-0 transition-transform duration-500 group-hover:scale-105" />

      <span className="flex flex-col leading-none">
        <span
          className={classi(
            'font-titolo text-[1.15rem] font-semibold tracking-[0.16em] uppercase',
            chiaro ? 'text-white' : 'text-testo',
          )}
        >
          {AZIENDA.nome}
        </span>
        {!compatto && (
          <span
            className={classi(
              'mt-1 text-[0.58rem] font-medium tracking-[0.34em] uppercase',
              chiaro ? 'text-white/55' : 'text-tenue',
            )}
          >
            Motori
          </span>
        )}
      </span>
    </Link>
  )
}
