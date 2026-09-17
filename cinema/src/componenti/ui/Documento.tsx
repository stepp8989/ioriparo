import type { ReactNode } from 'react'
import { Sezione } from '@/componenti/ui/Sezione'

/**
 * Impianto delle pagine di testo lungo: privacy, termini, cookie,
 * accessibilità.
 *
 * La larghezza è limitata a circa settanta caratteri per riga, che è la misura
 * oltre la quale l'occhio fatica a ritrovare l'inizio della riga successiva.
 * Le classi tipografiche sono dichiarate qui una volta invece che ripetute in
 * ogni documento.
 */
export function Documento({
  titolo,
  aggiornamento,
  children,
}: {
  titolo: string
  /** Data dell'ultima revisione, in forma leggibile. */
  aggiornamento: string
  children: ReactNode
}) {
  return (
    <Sezione ampiezza="stretta" className="pt-32">
      <h1 className="font-titolo text-[2.2rem] leading-tight sm:text-[2.8rem]">{titolo}</h1>
      <p className="mt-3 text-[0.85rem] text-tenue">Ultimo aggiornamento: {aggiornamento}</p>

      <div
        className={[
          'mt-10 space-y-5 text-[0.98rem] leading-relaxed text-tenue',
          '[&_h2]:mt-12 [&_h2]:font-titolo [&_h2]:text-[1.4rem] [&_h2]:font-semibold [&_h2]:text-testo',
          '[&_h3]:mt-8 [&_h3]:font-titolo [&_h3]:text-[1.1rem] [&_h3]:font-semibold [&_h3]:text-testo',
          '[&_ul]:space-y-2 [&_ul]:pl-5 [&_ul>li]:list-disc',
          '[&_ol]:space-y-2 [&_ol]:pl-5 [&_ol>li]:list-decimal',
          '[&_strong]:text-testo [&_strong]:font-semibold',
          '[&_a]:text-accento [&_a]:underline [&_a]:underline-offset-2',
          '[&_table]:w-full [&_table]:border-collapse [&_table]:text-[0.88rem]',
          '[&_th]:border-b [&_th]:border-bordo [&_th]:p-3 [&_th]:text-left [&_th]:text-testo',
          '[&_td]:border-b [&_td]:border-bordo [&_td]:p-3 [&_td]:align-top',
        ].join(' ')}
      >
        {children}
      </div>
    </Sezione>
  )
}
