import { PELLICOLA } from '@/lib/omaggi'
import { Icona } from './Icona'

/** Riquadro dell'omaggio pellicola, per chi sta valutando la riparazione dello schermo. */
export function PromoPellicola({ compatto }: { compatto?: boolean }) {
  if (!PELLICOLA.attiva) return null
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        padding: compatto ? 14 : 20,
        borderColor: 'color-mix(in srgb,var(--ok) 40%,var(--line))',
        background: 'color-mix(in srgb,var(--ok) 8%,var(--panel))',
      }}
    >
      <span className="ico" style={{ color: 'var(--ok)', flex: 'none' }}>
        <Icona nome="shield" dimensione={22} />
      </span>
      <div>
        <b style={{ fontSize: compatto ? '.92rem' : '1rem' }}>In omaggio: {PELLICOLA.prodotto}</b>
        <p className="muted" style={{ fontSize: compatto ? '.8rem' : '.86rem', marginTop: 3, lineHeight: 1.45 }}>
          Applicata gratis {PELLICOLA.condizione}: {PELLICOLA.descrizione}.
        </p>
      </div>
    </div>
  )
}
