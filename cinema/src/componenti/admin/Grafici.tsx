'use client'

import { useId } from 'react'
import { classi, prezzo } from '@/lib/utili'

/**
 * Grafici del cruscotto.
 *
 * Sono SVG disegnati qui invece che con una libreria. La ragione non è
 * l'ideologia: servono due forme — una spezzata e un istogramma — su serie di
 * al massimo trecentosessantacinque punti, e una libreria di grafici pesa
 * quanto tutto il resto del pannello messo insieme.
 *
 * Ogni grafico porta con sé la propria tabella, nascosta visivamente ma
 * presente nel documento: uno screen reader legge i numeri, non la forma, e un
 * grafico senza tabella per chi non lo vede è un dato che non c'è.
 */

export type Punto = { etichetta: string; valore: number }

/** Formattatore dei valori sugli assi e nella tabella. */
type Formato = 'euro' | 'numero'

function formatta(valore: number, formato: Formato): string {
  return formato === 'euro' ? prezzo(valore) : valore.toLocaleString('it-IT')
}

/* ── Spezzata ───────────────────────────────────────────────────────────── */

export function Andamento({
  punti,
  titolo,
  formato = 'euro',
  className,
}: {
  punti: Punto[]
  titolo: string
  formato?: Formato
  className?: string
}) {
  const id = useId()

  if (punti.length === 0) {
    return <p className="text-[0.88rem] text-tenue">Nessun dato per questo periodo.</p>
  }

  const larghezza = 600
  const altezza = 180
  const margine = 8

  const massimo = Math.max(...punti.map((punto) => punto.valore), 1)

  const coordinate = punti.map((punto, indice) => {
    const x =
      punti.length === 1
        ? larghezza / 2
        : margine + (indice / (punti.length - 1)) * (larghezza - margine * 2)
    const y = altezza - margine - (punto.valore / massimo) * (altezza - margine * 2)
    return { x, y, punto }
  })

  const linea = coordinate.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${margine},${altezza - margine} ${linea} ${larghezza - margine},${altezza - margine}`

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${larghezza} ${altezza}`}
        className="w-full"
        role="img"
        aria-labelledby={`${id}-titolo`}
      >
        <title id={`${id}-titolo`}>{titolo}</title>

        <defs>
          <linearGradient id={`${id}-riempimento`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accento)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accento)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Tre linee di riferimento: zero, metà e massimo. */}
        {[0, 0.5, 1].map((frazione) => {
          const y = altezza - margine - frazione * (altezza - margine * 2)
          return (
            <line
              key={frazione}
              x1={margine}
              y1={y}
              x2={larghezza - margine}
              y2={y}
              stroke="var(--bordo)"
              strokeWidth="1"
              strokeDasharray={frazione === 0 ? undefined : '3 4'}
            />
          )
        })}

        <polygon points={area} fill={`url(#${id}-riempimento)`} />
        <polyline
          points={linea}
          fill="none"
          stroke="var(--accento)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coordinate.map(({ x, y, punto }) => (
          <circle key={punto.etichetta} cx={x} cy={y} r="3" fill="var(--accento)">
            <title>{`${punto.etichetta}: ${formatta(punto.valore, formato)}`}</title>
          </circle>
        ))}
      </svg>

      <figcaption className="sr-only">
        <table>
          <caption>{titolo}</caption>
          <thead>
            <tr>
              <th scope="col">Periodo</th>
              <th scope="col">Valore</th>
            </tr>
          </thead>
          <tbody>
            {punti.map((punto) => (
              <tr key={punto.etichetta}>
                <th scope="row">{punto.etichetta}</th>
                <td>{formatta(punto.valore, formato)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  )
}

/* ── Istogramma orizzontale ─────────────────────────────────────────────── */

export function Classifica({
  punti,
  titolo,
  formato = 'numero',
  className,
}: {
  punti: Punto[]
  titolo: string
  formato?: Formato
  className?: string
}) {
  if (punti.length === 0) {
    return <p className="text-[0.88rem] text-tenue">Nessun dato per questo periodo.</p>
  }

  const massimo = Math.max(...punti.map((punto) => punto.valore), 1)

  return (
    <div className={className}>
      <ul className="space-y-2.5">
        {punti.map((punto) => (
          <li key={punto.etichetta}>
            <div className="flex items-baseline justify-between gap-3 text-[0.84rem]">
              <span className="min-w-0 truncate">{punto.etichetta}</span>
              <span className="tabellare shrink-0 font-medium">
                {formatta(punto.valore, formato)}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-superficie-alt">
              <div
                className="h-full rounded-full bg-accento"
                style={{ width: `${(punto.valore / massimo) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="sr-only">{titolo}</p>
    </div>
  )
}

/* ── Riquadro con un numero ─────────────────────────────────────────────── */

export function Riquadro({
  etichetta,
  valore,
  dettaglio,
  tono = 'neutro',
  className,
}: {
  etichetta: string
  valore: string
  dettaglio?: string
  tono?: 'neutro' | 'accento' | 'ok' | 'attesa'
  className?: string
}) {
  const TONI = {
    neutro: 'text-testo',
    accento: 'text-accento',
    ok: 'text-ok',
    attesa: 'text-attesa',
  } as const

  return (
    <div className={classi('rounded-morbido border border-bordo bg-superficie p-5', className)}>
      <p className="text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-tenue">
        {etichetta}
      </p>
      <p className={classi('tabellare mt-2 font-titolo text-[1.9rem] font-bold leading-none', TONI[tono])}>
        {valore}
      </p>
      {dettaglio && <p className="mt-2 text-[0.8rem] text-tenue">{dettaglio}</p>}
    </div>
  )
}
