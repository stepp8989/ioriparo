import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Intestazione delle pagine interne.
 *
 * Sostituisce l'apertura a schermo intero della home con una fascia più bassa,
 * scura, che lascia respirare il contenuto sotto e regge l'intestazione fissa
 * trasparente. Le briciole di pane sono anche dati strutturati: la stessa
 * gerarchia viene dichiarata a Google dalle pagine che la usano.
 */
export function Intestazione({
  soprattitolo,
  titolo,
  sottotitolo,
  immagine,
  briciole = [],
  children,
}: {
  soprattitolo?: string
  titolo: ReactNode
  sottotitolo?: ReactNode
  immagine?: string
  briciole?: Array<{ nome: string; percorso: string }>
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden bg-notte pt-32 pb-16 text-white sm:pt-36 sm:pb-20">
      {immagine ? (
        <>
          <Image
            src={immagine}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-notte via-notte/80 to-notte/50" />
        </>
      ) : (
        <div className="griglia-tecnica absolute inset-0" aria-hidden />
      )}

      <div className="alone absolute -top-32 right-1/4 h-80 w-80 rounded-full" aria-hidden />

      <div className="contenitore relative">
        {briciole.length > 0 && (
          <nav aria-label="Percorso" className="mb-7">
            <ol className="flex flex-wrap items-center gap-2 text-[0.8rem] text-white/45">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              {briciole.map((briciola, indice) => (
                <li key={briciola.percorso} className="flex items-center gap-2">
                  <Icona nome="chevronDestra" className="size-3" />
                  {indice === briciole.length - 1 ? (
                    <span className="text-white/75" aria-current="page">
                      {briciola.nome}
                    </span>
                  ) : (
                    <Link href={briciola.percorso} className="transition-colors hover:text-white">
                      {briciola.nome}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {soprattitolo && (
          <p className="mb-4 flex items-center gap-3 text-[0.7rem] font-semibold tracking-[0.3em] text-accento-forte uppercase">
            <span className="filetto" aria-hidden />
            {soprattitolo}
          </p>
        )}

        <h1
          className={classi(
            'font-titolo text-[2.2rem] leading-[1.08] font-semibold sm:text-5xl lg:text-[3.6rem]',
            'max-w-4xl text-balance',
          )}
        >
          {titolo}
        </h1>

        {sottotitolo && (
          <div className="mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-white/65">
            {sottotitolo}
          </div>
        )}

        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  )
}
