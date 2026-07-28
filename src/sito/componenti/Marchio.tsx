import { Link } from 'react-router-dom'
import { AZIENDA } from '../dati/azienda'

/**
 * Marchio ufficiale Io Riparo.
 * Viene usato il file originale fornito dall'azienda: la versione con lettering
 * scuro sui fondi chiari e quella con lettering chiaro sui fondi scuri.
 * Il cambio avviene via CSS, così non c'è alcun salto durante il caricamento.
 */
export function Marchio({
  altezza = 86,
  className,
  senzaLink,
}: {
  /** Altezza del logo in pixel */
  altezza?: number
  className?: string
  /** Nel piè di pagina il logo non deve essere un secondo collegamento alla home */
  senzaLink?: boolean
}) {
  const immagini = (
    <>
      <img
        className="marchio marchio--scuro"
        src="/marchio/logo.png"
        alt={`${AZIENDA.nome} — ${AZIENDA.claim}`}
        height={altezza}
        width={Math.round((altezza * 2285) / 1498)}
        style={{ '--altezza-marchio': `${altezza}px` } as React.CSSProperties}
        loading="eager"
        decoding="async"
      />
      <img
        className="marchio marchio--chiaro"
        src="/marchio/logo-chiaro.png"
        alt=""
        aria-hidden="true"
        height={altezza}
        width={Math.round((altezza * 2285) / 1498)}
        style={{ '--altezza-marchio': `${altezza}px` } as React.CSSProperties}
        loading="eager"
        decoding="async"
      />
    </>
  )

  if (senzaLink) return <span className={`brand ${className ?? ''}`}>{immagini}</span>

  return (
    <Link to="/" className={`brand ${className ?? ''}`} aria-label={`${AZIENDA.nome} — home`}>
      {immagini}
    </Link>
  )
}
