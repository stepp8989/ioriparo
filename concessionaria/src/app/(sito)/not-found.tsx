import Link from 'next/link'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { NAVIGAZIONE } from '@/dati/navigazione'

/**
 * Pagina 404.
 *
 * Invece del solito vicolo cieco, offre le strade più probabili: chi arriva
 * qui quasi sempre cercava un veicolo che è stato venduto, e il catalogo è la
 * risposta giusta nella maggior parte dei casi.
 */
export default function NonTrovata() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-notte text-white">
      <div className="griglia-tecnica absolute inset-0" aria-hidden />
      <div className="alone absolute top-1/4 left-1/3 h-96 w-96 rounded-full" aria-hidden />

      <div className="contenitore relative py-28 text-center">
        <p className="font-titolo text-[5rem] leading-none font-semibold text-accento tabellare sm:text-[7rem]">
          404
        </p>

        <h1 className="mt-4 font-titolo text-[1.8rem] font-semibold sm:text-4xl">
          Questa pagina non c’è più
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-[1rem] leading-relaxed text-white/60">
          Può darsi che il veicolo che cercavate sia stato venduto, o che l’indirizzo sia cambiato.
          Dal catalogo si riparte sempre.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Bottone href="/catalogo" misura="grande">
            Vai al catalogo
            <Icona nome="freccia" className="size-4" />
          </Bottone>
          <Bottone href="/" variante="vetro" misura="grande">
            Torna alla home
          </Bottone>
        </div>

        <nav aria-label="Altre pagine" className="mt-14">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-[0.88rem] text-white/50">
            {NAVIGAZIONE.map((voce) => (
              <li key={voce.percorso}>
                <Link href={voce.percorso} className="transition-colors hover:text-white">
                  {voce.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
