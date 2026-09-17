import Link from 'next/link'
import { Marchio } from '@/componenti/layout/Marchio'
import { Icona } from '@/componenti/ui/Icona'
import { PIEDE } from '@/dati/navigazione'
import type { Cinema, Impostazioni } from '@/lib/tipi'

/**
 * Piè di pagina.
 *
 * Oltre ai collegamenti porta l'elenco completo delle sale con il
 * collegamento diretto a ciascuna: è il modo più semplice per dare a ogni
 * cinema un collegamento interno da ogni pagina del sito, che è quello che
 * serve perché le schede delle singole sale vengano indicizzate.
 */
export function PiePagina({
  impostazioni,
  cinema,
}: {
  impostazioni: Impostazioni
  cinema: Cinema[]
}) {
  const anno = new Date().getFullYear()
  const { marchio, social } = impostazioni

  const reti = [
    { nome: 'Instagram', href: social.instagram },
    { nome: 'Facebook', href: social.facebook },
    { nome: 'TikTok', href: social.tiktok },
    { nome: 'YouTube', href: social.youtube },
  ].filter((rete) => rete.href)

  return (
    <footer className="mt-auto border-t border-bordo bg-sfondo-alt">
      <div className="contenitore py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Marchio nome={marchio.nome} claim={marchio.claim} />

            <p className="mt-4 max-w-sm text-[0.88rem] leading-relaxed text-tenue">
              {marchio.descrizione}
            </p>

            <div className="mt-4 space-y-1.5 text-[0.86rem]">
              <a
                href={`tel:${marchio.telefono.replace(/\s/g, '')}`}
                className="sottolinea inline-flex items-center gap-2 text-tenue transition-colors hover:text-accento"
              >
                <Icona nome="telefono" className="size-4" />
                {marchio.telefono}
              </a>
              <br />
              <a
                href={`mailto:${marchio.email}`}
                className="sottolinea inline-flex items-center gap-2 text-tenue transition-colors hover:text-accento"
              >
                <Icona nome="posta" className="size-4" />
                {marchio.email}
              </a>
            </div>

            {reti.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {reti.map((rete) => (
                  <li key={rete.nome}>
                    <a
                      href={rete.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-tenue border border-bordo px-3 py-1.5 text-[0.76rem] text-tenue transition-colors hover:border-accento hover:text-accento"
                    >
                      {rete.nome}
                      <Icona nome="esterno" className="size-3" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PIEDE.map((colonna) => (
              <div key={colonna.titolo}>
                <h2 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accento">
                  {colonna.titolo}
                </h2>
                <ul className="space-y-1.5">
                  {colonna.voci.map((voce) => (
                    <li key={voce.href}>
                      <Link
                        href={voce.href}
                        className="text-[0.88rem] text-tenue transition-colors hover:text-accento"
                      >
                        {voce.etichetta}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {cinema.length > 0 && (
          <div className="mt-8 border-t border-bordo pt-6">
            <h2 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-tenue">
              Le nostre sale
            </h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {cinema.map((struttura) => (
                <li key={struttura.id}>
                  <Link
                    href={`/cinema/${struttura.slug}`}
                    className="text-[0.86rem] text-tenue transition-colors hover:text-accento"
                  >
                    {marchio.nome} {struttura.nome}
                    <span className="ml-1.5 text-tenue/60">{struttura.citta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-bordo pt-6 text-[0.8rem] text-tenue sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {anno} {marchio.nome}. Tutti i diritti riservati.
          </p>
          <p className="text-tenue/70">
            Titoli, locandine e contenuti di questa versione dimostrativa sono inventati e non
            rappresentano opere reali.
          </p>
        </div>
      </div>
    </footer>
  )
}
