import type { ReactNode } from 'react'

/**
 * Impaginato dei documenti di testo lungo (privacy, cookie policy).
 *
 * Misura della riga contenuta e gerarchia dei titoli chiara: sono pagine che
 * si leggono di rado ma devono restare comprensibili quando servono davvero.
 */
export function Documento({
  titolo,
  aggiornamento,
  children,
}: {
  titolo: string
  aggiornamento: string
  children: ReactNode
}) {
  return (
    <article className="contenitore max-w-3xl pt-36 pb-24 sm:pt-44">
      <header className="border-b border-bordo pb-8">
        <h1 className="text-4xl leading-tight sm:text-5xl">{titolo}</h1>
        <p className="mt-4 text-sm text-tenue">Ultimo aggiornamento: {aggiornamento}</p>
      </header>

      <div
        className="
          mt-10 space-y-5 leading-relaxed text-tenue
          [&_a]:text-accento [&_a]:underline [&_a]:underline-offset-4
          [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:font-titolo [&_h2]:text-2xl [&_h2]:text-testo
          [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:font-titolo [&_h3]:text-xl [&_h3]:text-testo
          [&_li]:mb-2 [&_strong]:text-testo
          [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
          [&_td]:border [&_td]:border-bordo [&_td]:p-3 [&_td]:align-top
          [&_th]:border [&_th]:border-bordo [&_th]:bg-superficie-alt [&_th]:p-3 [&_th]:text-left [&_th]:text-testo
          [&_ul]:list-disc [&_ul]:pl-6
        "
      >
        {children}
      </div>
    </article>
  )
}
