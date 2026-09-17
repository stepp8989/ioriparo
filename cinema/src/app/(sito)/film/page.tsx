import type { Metadata } from 'next'
import { Filtri, type Filtro } from '@/componenti/film/Filtri'
import { SchedaFilm } from '@/componenti/film/SchedaFilm'
import { Nota, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { Icona } from '@/componenti/ui/Icona'
import { prezzoDaPartireDa } from '@/lib/prezzi'
import { metadatiPagina } from '@/lib/seo'
import { cinemaVisibili, datiSito, filmVisibili, spettacoliUtili } from '@/lib/sito'

/**
 * Elenco dei film, con i filtri nell'indirizzo.
 *
 * Il filtro «cinema» non guarda il film ma la programmazione: chiedere «cosa
 * danno a Nuoro» significa chiedere quali film hanno almeno uno spettacolo
 * acquistabile in quella sala, non quali film esistono in catalogo.
 */
export const revalidate = 120

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Film in sala e prossime uscite',
    descrizione:
      'Tutti i film in programmazione nelle sale della rete, con orari, formati e prezzi. Filtra per genere, anno, formato e cinema.',
    percorso: '/film',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaFilm({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const parametri = await searchParams
  const archivio = await datiSito()

  const leggiParametro = (chiave: string) => {
    const valore = parametri[chiave]
    return (Array.isArray(valore) ? valore[0] : valore) ?? ''
  }

  const genere = leggiParametro('genere')
  const anno = leggiParametro('anno')
  const formato = leggiParametro('formato')
  const cinemaId = leggiParametro('cinema')
  const stato = leggiParametro('stato')

  const tutti = filmVisibili(archivio)
  const risolti = spettacoliUtili(archivio)

  const prezziMinimi = new Map<string, number>()
  const filmProgrammati = new Map<string, Set<string>>()

  for (const { spettacolo, sala } of risolti) {
    const importo = prezzoDaPartireDa(spettacolo, sala, archivio.impostazioni)
    const attuale = prezziMinimi.get(spettacolo.filmId)
    if (attuale === undefined || importo < attuale) prezziMinimi.set(spettacolo.filmId, importo)

    const strutture = filmProgrammati.get(spettacolo.filmId) ?? new Set<string>()
    strutture.add(spettacolo.cinemaId)
    filmProgrammati.set(spettacolo.filmId, strutture)
  }

  const risultati = tutti.filter((film) => {
    if (genere && !film.generi.includes(genere)) return false
    if (anno && String(film.anno) !== anno) return false
    if (formato && !film.formati.includes(formato as (typeof film.formati)[number])) return false
    if (stato && film.stato !== stato) return false
    if (cinemaId && !filmProgrammati.get(film.id)?.has(cinemaId)) return false
    return true
  })

  /* I filtri propongono solo valori che portano a qualche risultato: un menu
     pieno di voci che danno zero è un modo elegante di far perdere tempo. */
  const generi = [...new Set(tutti.flatMap((film) => film.generi))].sort()
  const anni = [...new Set(tutti.map((film) => film.anno))].sort((a, b) => b - a)
  const formati = [...new Set(tutti.flatMap((film) => film.formati))]

  const filtri: Filtro[] = [
    {
      chiave: 'genere',
      etichetta: 'Genere',
      voci: generi.map((voce) => ({ valore: voce, etichetta: voce })),
    },
    {
      chiave: 'formato',
      etichetta: 'Formato',
      voci: formati.map((voce) => ({ valore: voce, etichetta: voce })),
    },
    {
      chiave: 'cinema',
      etichetta: 'Cinema',
      voci: cinemaVisibili(archivio).map((voce) => ({ valore: voce.id, etichetta: voce.nome })),
    },
    {
      chiave: 'anno',
      etichetta: 'Anno',
      voci: anni.map((voce) => ({ valore: String(voce), etichetta: String(voce) })),
    },
    {
      chiave: 'stato',
      etichetta: 'Disponibilità',
      voci: [
        { valore: 'in-sala', etichetta: 'In sala ora' },
        { valore: 'prossimamente', etichetta: 'Prossimamente' },
      ],
    },
  ]

  return (
    <Sezione className="pt-32">
      <TitoloSezione
        soprattitolo="Catalogo"
        titolo="Film in sala e prossime uscite"
        sottotitolo="Tutto quello che programmiamo nelle nostre sale, con formati, orari e prezzi."
        allineamento="sinistra"
      />

      <Filtri filtri={filtri} conteggio={risultati.length} className="mt-10" />

      {risultati.length === 0 ? (
        <Nota className="mt-10" icona={<Icona nome="info" className="size-4" />}>
          Nessun film corrisponde a questi filtri. Prova ad allargare la ricerca: togliendo il
          filtro sul cinema si vedono anche i titoli programmati altrove.
        </Nota>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
          {risultati.map((film) => (
            <SchedaFilm key={film.id} film={film} prezzoDa={prezziMinimi.get(film.id)} />
          ))}
        </div>
      )}
    </Sezione>
  )
}
