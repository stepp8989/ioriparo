import Link from 'next/link'
import { Bottone } from '@/componenti/ui/Bottone'
import { Simbolo } from '@/componenti/layout/Marchio'

/** Pagina mostrata quando un indirizzo non esiste. */
export default function NonTrovata() {
  return (
    <div className="contenitore flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <Simbolo className="size-16 text-accento" />

      <p className="mt-8 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-accento">
        Errore 404
      </p>

      <h1 className="mt-4 text-4xl sm:text-5xl">Questa pagina non è nel menù</h1>

      <p className="mt-5 max-w-md leading-relaxed text-tenue">
        L’indirizzo che cercate non esiste o è stato spostato. Dalla home si riparte, oppure
        andate dritti alla carta.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Bottone href="/">Torna alla home</Bottone>
        <Bottone href="/menu" variante="contorno">
          Guarda il menù
        </Bottone>
      </div>

      <p className="mt-10 text-sm text-tenue">
        Cercavate un tavolo?{' '}
        <Link href="/prenota" className="text-accento underline underline-offset-4">
          Prenotate qui
        </Link>
        .
      </p>
    </div>
  )
}
