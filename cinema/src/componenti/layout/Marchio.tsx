import Link from 'next/link'
import { classi } from '@/lib/utili'

/**
 * Marchio.
 *
 * Il simbolo è una **piastrella di pellicola**: un quadrato pieno del rosso
 * d'insegna, con le perforazioni bianche sui due lati corti e un fotogramma
 * vuoto al centro. Sostituisce il diaframma a sei lamelle della prima versione,
 * che a sedici pixel diventava una macchia illeggibile e somigliava a un logo
 * di applicazione più che all'insegna di un circuito di sale. Questo invece
 * regge il rimpicciolimento — due file di quadratini si riconoscono sempre — e
 * funziona anche in negativo su un biglietto stampato in bianco e nero.
 *
 * È l'unico elemento grafico proprietario del progetto, disegnato per questo
 * marchio e non ripreso da nessuno: nessun logo esistente, nessuna catena reale.
 *
 * Il nome non è disegnato: è testo, e arriva dalle impostazioni. Cambiare
 * «CINEMAX» in qualcos'altro dal pannello cambia l'intestazione, il piè di
 * pagina, i biglietti e le email senza toccare un file grafico — che è tutto
 * il motivo per cui il nome non sta dentro l'SVG.
 */
export function Simbolo({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden focusable="false">
      <rect width="32" height="32" rx="4" fill="var(--accento)" />

      {/* Quattro perforazioni per lato, generate invece che disegnate otto
          volte a mano: restano allineate al pixel a qualsiasi dimensione. */}
      <g fill="#ffffff">
        {Array.from({ length: 4 }, (_, indice) => (
          <g key={indice}>
            <rect x="4" y={4.5 + indice * 6.5} width="4" height="4" rx="1" />
            <rect x="24" y={4.5 + indice * 6.5} width="4" height="4" rx="1" />
          </g>
        ))}
      </g>

      {/* Fotogramma centrale: vuoto, perché è lì che finisce il nome. */}
      <rect x="11" y="9" width="10" height="14" rx="1.5" fill="#ffffff" opacity="0.92" />
    </svg>
  )
}

export function Marchio({
  nome,
  claim,
  className,
  href = '/',
  compatto = false,
}: {
  nome: string
  claim?: string
  className?: string
  href?: string
  compatto?: boolean
}) {
  return (
    <Link
      href={href}
      className={classi('inline-flex items-center gap-2.5', className)}
      aria-label={`${nome}, torna alla pagina iniziale`}
    >
      <Simbolo className={compatto ? 'size-7' : 'size-8'} />
      <span className="leading-none">
        <span
          className={classi(
            'block font-titolo font-extrabold uppercase tracking-[-0.01em]',
            compatto ? 'text-[1.05rem]' : 'text-[1.2rem]',
          )}
        >
          {nome}
        </span>
        {claim && !compatto && (
          <span className="mt-1 block text-[0.58rem] uppercase tracking-[0.2em] text-tenue">
            {claim}
          </span>
        )}
      </span>
    </Link>
  )
}
