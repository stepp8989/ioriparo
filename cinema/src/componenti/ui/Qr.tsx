import { generaQr, tracciaQr, type LivelloCorrezione } from '@/lib/qr'
import { classi } from '@/lib/utili'

/**
 * Codice QR come SVG in linea.
 *
 * Non è un'immagine: è un unico `path` dentro il documento. Si stampa senza
 * sgranare a qualsiasi dimensione, non richiede una richiesta di rete e resta
 * leggibile anche se il biglietto viene fotografato dallo schermo di un altro
 * telefono — cosa che succede più spesso di quanto si creda.
 *
 * Il livello di correzione predefinito è Q (25% di ridondanza): un gradino
 * sopra il minimo consigliato, perché un biglietto viene letto con luce
 * scarsa, schermi opachi e mani che tremano.
 */
export function Qr({
  contenuto,
  livello = 'Q',
  className,
  colore = 'currentColor',
  sfondo = 'transparent',
  bordo = 3,
  etichetta,
}: {
  contenuto: string
  livello?: LivelloCorrezione
  className?: string
  colore?: string
  sfondo?: string
  /** Bordo chiaro in moduli. Sotto i tre moduli molti lettori non agganciano. */
  bordo?: number
  /** Testo alternativo: chi usa uno screen reader non può leggere un QR. */
  etichetta?: string
}) {
  const codice = generaQr(contenuto, livello)
  const lato = codice.dimensione + bordo * 2

  return (
    <svg
      viewBox={`0 0 ${lato} ${lato}`}
      shapeRendering="crispEdges"
      className={classi('size-full', className)}
      role="img"
      aria-label={etichetta ?? 'Codice QR del biglietto'}
    >
      <rect width={lato} height={lato} fill={sfondo} />
      <g transform={`translate(${bordo} ${bordo})`} fill={colore}>
        <path d={tracciaQr(codice)} />
      </g>
    </svg>
  )
}
