import type { Metadata } from 'next'
import { BottonePlay, LettoreTrailer } from '@/componenti/film/LettoreTrailer'
import { Icona } from '@/componenti/ui/Icona'
import { Fondale } from '@/componenti/ui/Poster'
import { Etichetta, Nota, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { metadatiPagina } from '@/lib/seo'
import { datiSito, filmVisibili } from '@/lib/sito'
import { dataEstesa, durataBreve } from '@/lib/utili'

/**
 * Vetrina dei trailer.
 *
 * Nessun video viene caricato all'apertura della pagina: ogni riquadro è
 * un'immagine e un pulsante, e l'incorporamento nasce solo al clic. Su una
 * pagina con dodici trailer la differenza è fra qualche chilobyte e diversi
 * megabyte scaricati da domini terzi prima ancora che qualcuno guardi qualcosa.
 */
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Trailer',
    descrizione:
      'I trailer dei film in sala e delle prossime uscite. Guarda l’anteprima e vai direttamente agli orari.',
    percorso: '/trailer',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaTrailer() {
  const archivio = await datiSito()
  const film = filmVisibili(archivio).filter((voce) => voce.trailer)

  return (
    <Sezione className="pt-32">
      <TitoloSezione
        soprattitolo="Trailer"
        titolo="Guarda prima di scegliere"
        sottotitolo="Le anteprime dei film in sala e di quelli in arrivo."
        allineamento="sinistra"
      />

      {film.length === 0 ? (
        <Nota className="mt-10 max-w-2xl" icona={<Icona nome="info" className="size-4" />}>
          Nessun trailer disponibile al momento.
        </Nota>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {film.map((voce) => (
            <article key={voce.id}>
              <LettoreTrailer trailer={voce.trailer} titolo={voce.titolo} className="block w-full">
                <div className="relative aspect-video overflow-hidden rounded-morbido">
                  <div className="size-full transition-transform duration-700 group-hover/trailer:scale-105">
                    <Fondale chiave={voce.id} palette={voce.palette} immagine={voce.backdrop} />
                  </div>
                  <div
                    className="absolute inset-0 bg-notte/30 transition-colors duration-500 group-hover/trailer:bg-notte/10"
                    aria-hidden
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BottonePlay />
                  </div>
                  {voce.trailer && voce.trailer.durataSecondi > 0 && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-notte/85 px-2.5 py-1 text-[0.7rem] tabellare text-white">
                      {durataBreve(voce.trailer.durataSecondi)}
                    </span>
                  )}
                  {voce.stato === 'prossimamente' && (
                    <span className="absolute left-3 top-3">
                      <Etichetta tono="pieno">Dal {dataEstesa(voce.dataUscita)}</Etichetta>
                    </span>
                  )}
                </div>
              </LettoreTrailer>

              <h2 className="mt-3.5 font-titolo text-[1.05rem] font-semibold">{voce.titolo}</h2>
              <p className="mt-1 text-[0.82rem] text-tenue">
                {voce.generi.join(' · ')} · {voce.regista}
              </p>
            </article>
          ))}
        </div>
      )}
    </Sezione>
  )
}
