import type { ReactNode } from 'react'

/**
 * Impaginazione delle pagine informative (privacy, cookie, termini).
 *
 * Testo stretto e interlinea generosa: sono documenti che si leggono di rado
 * ma, quando capita, vanno letti davvero. La misura della riga è quella dei
 * libri, intorno ai settanta caratteri.
 */
export function Documento({
  aggiornamento,
  children,
}: {
  aggiornamento: string
  children: ReactNode
}) {
  return (
    <article className="mx-auto max-w-2xl">
      <p className="mb-10 text-[0.82rem] text-tenue">Ultimo aggiornamento: {aggiornamento}</p>

      <div
        className={
          'space-y-5 text-[1rem] leading-relaxed text-tenue ' +
          '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-titolo [&_h2]:text-[1.35rem] [&_h2]:font-semibold [&_h2]:text-testo ' +
          '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-titolo [&_h3]:text-[1.08rem] [&_h3]:font-semibold [&_h3]:text-testo ' +
          '[&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:list-disc [&_li]:marker:text-accento ' +
          '[&_a]:text-accento [&_a:hover]:underline ' +
          '[&_strong]:font-semibold [&_strong]:text-testo'
        }
      >
        {children}
      </div>
    </article>
  )
}
