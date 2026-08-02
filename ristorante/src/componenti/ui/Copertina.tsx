import Image from 'next/image'
import Link from 'next/link'
import { Icona } from '@/componenti/ui/Icona'

/**
 * Testata delle pagine interne: fotografia, briciole di pane e titolo.
 *
 * Ha un'altezza contenuta rispetto all'apertura della home, così il contenuto
 * vero comincia subito; l'immagine è caricata con priorità perché è comunque
 * l'elemento più grande della prima schermata.
 */
export function Copertina({
  soprattitolo,
  titolo,
  sottotitolo,
  immagine,
  briciole,
}: {
  soprattitolo?: string
  titolo: string
  sottotitolo?: string
  immagine: string
  briciole: Array<{ nome: string; percorso: string }>
}) {
  return (
    <section className="relative flex min-h-[58vh] items-end overflow-hidden bg-notte pt-28 pb-14 sm:min-h-[62vh]">
      <Image
        src={immagine}
        alt=""
        fill
        priority
        sizes="100vw"
        quality={70}
        className="object-cover opacity-65"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-notte via-notte/60 to-notte/30" aria-hidden />

      <div className="contenitore relative text-white">
        {/* Briciole di pane: rispecchiano i dati strutturati BreadcrumbList */}
        <nav aria-label="Percorso di navigazione" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-white/50">
            <li>
              <Link href="/" className="transition-colors hover:text-accento">
                Home
              </Link>
            </li>
            {briciole.map((briciola, indice) => (
              <li key={briciola.percorso} className="flex items-center gap-2">
                <Icona nome="chevronDestra" className="size-3" />
                {indice === briciole.length - 1 ? (
                  <span aria-current="page" className="text-white/80">
                    {briciola.nome}
                  </span>
                ) : (
                  <Link href={briciola.percorso} className="transition-colors hover:text-accento">
                    {briciola.nome}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {soprattitolo && (
          <p className="mb-4 flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-accento-tenue">
            {soprattitolo}
            <span className="filetto" aria-hidden />
          </p>
        )}

        <h1 className="max-w-3xl text-5xl leading-[1.05] sm:text-6xl lg:text-[4.5rem]">{titolo}</h1>

        {sottotitolo && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">{sottotitolo}</p>
        )}
      </div>
    </section>
  )
}
