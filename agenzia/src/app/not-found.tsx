import Link from 'next/link'
import { AGENZIA } from '@/dati/agenzia'
import { Icona } from '@/componenti/ui/Icona'

/** Pagina non trovata: breve, con una via d'uscita e nessuna colpa da dare. */
export default function NonTrovata() {
  return (
    <div className="contenitore grid min-h-svh place-items-center py-32 text-center">
      <div className="mx-auto max-w-lg">
        <p className="font-titolo text-[clamp(4rem,16vw,9rem)] font-semibold leading-none testo-neon-vivo">
          404
        </p>
        <h1 className="mt-6 font-titolo text-2xl font-semibold sm:text-3xl">
          Questa pagina non esiste.
        </h1>
        <p className="mt-4 text-[1rem] leading-relaxed text-tenue">
          Forse l’indirizzo è cambiato, forse c’è un refuso. In ogni caso, dal principio si arriva
          ovunque.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-[3rem] items-center justify-center gap-2.5 rounded-full bg-[linear-gradient(100deg,var(--blu-cupo),var(--viola))] px-7 font-medium text-white"
          >
            Torna alla home
            <Icona nome="freccia" misura={17} />
          </Link>
          <a
            href={`mailto:${AGENZIA.email}`}
            className="vetro inline-flex min-h-[3rem] items-center justify-center gap-2.5 rounded-full px-7 text-tenue transition-colors hover:text-testo"
          >
            <Icona nome="busta" misura={17} />
            Scrivimi
          </a>
        </div>
      </div>
    </div>
  )
}
