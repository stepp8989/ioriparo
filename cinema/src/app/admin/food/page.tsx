'use client'

import { Gestione, cellaPrezzo, type ColonnaGestione } from '@/componenti/admin/Gestione'
import { inOpzioni, useElenco } from '@/componenti/admin/dati'
import { Illustrazione } from '@/componenti/ui/Poster'
import { Etichetta } from '@/componenti/ui/Sezione'
import { CATEGORIE_FOOD, type Cinema, type ProdottoFood } from '@/lib/tipi'

/**
 * Banco alimentari.
 *
 * Il campo «cinema» serve ai prodotti che non esistono ovunque: la birra dove
 * c'è la licenza, i dolci fatti in loco. Lasciandolo vuoto il prodotto è
 * disponibile in tutta la rete — è la convenzione usata anche dalle
 * promozioni.
 */

const colonne: ColonnaGestione<ProdottoFood>[] = [
  {
    etichetta: 'Prodotto',
    ricerca: (voce) => `${voce.nome} ${voce.descrizione} ${voce.categoria}`,
    resa: (voce) => (
      <span className="flex items-center gap-3">
        <span className="block size-10 shrink-0 overflow-hidden rounded">
          <Illustrazione
            chiave={voce.id}
            palette={voce.palette}
            immagine={voce.immagine}
            alt={voce.nome}
          />
        </span>
        <span className="min-w-0">
          <span className="block font-medium">{voce.nome}</span>
          <span className="block text-[0.78rem] text-tenue">{voce.categoria}</span>
        </span>
      </span>
    ),
  },
  { etichetta: 'Prezzo', resa: (voce) => cellaPrezzo(voce.prezzo) },
  {
    etichetta: 'Allergeni',
    secondaria: true,
    resa: (voce) =>
      voce.allergeni.length > 0 ? (
        <Etichetta tono="ambra">{voce.allergeni.join(', ')}</Etichetta>
      ) : (
        <span className="text-tenue">—</span>
      ),
  },
  {
    etichetta: 'Disponibilità',
    secondaria: true,
    resa: (voce) => (
      <span className="text-[0.78rem] text-tenue">
        {voce.cinemaIds.length === 0 ? 'Tutta la rete' : `${voce.cinemaIds.length} cinema`}
      </span>
    ),
  },
]

export default function PaginaFoodAdmin() {
  const { voci: cinema } = useElenco<Cinema>('/api/admin/cinema')

  return (
    <Gestione<ProdottoFood>
      titolo="Food & Drink"
      descrizione="Il banco che compare durante l’acquisto. Gli allergeni sono un obbligo di legge: compilali sempre, anche quando l’elenco è vuoto per davvero."
      endpoint="/api/admin/food"
      nomeVoce="prodotto"
      etichettaVoce={(voce) => voce.nome}
      colonne={colonne}
      interruttori={[
        { chiave: 'disponibile', etichetta: 'Disponibile' },
        { chiave: 'inEvidenza', etichetta: 'Consigliato' },
      ]}
      vuota={{
        nome: '',
        descrizione: '',
        categoria: 'Popcorn',
        prezzo: 0,
        immagine: '',
        palette: ['#4a3410', '#ffd166'],
        allergeni: [],
        contenuto: [],
        cinemaIds: [],
        disponibile: true,
        inEvidenza: false,
        ordine: 50,
      }}
      campi={[
        { chiave: 'nome', etichetta: 'Nome', tipo: 'testo' },
        {
          chiave: 'categoria',
          etichetta: 'Categoria',
          tipo: 'scelta',
          opzioni: CATEGORIE_FOOD.map((voce) => ({ valore: voce, etichetta: voce })),
        },
        { chiave: 'prezzo', etichetta: 'Prezzo (€)', tipo: 'decimale', minimo: 0, massimo: 200 },
        { chiave: 'ordine', etichetta: 'Posizione', tipo: 'numero', minimo: 0, massimo: 999 },
        { chiave: 'descrizione', etichetta: 'Descrizione', tipo: 'area' },
        {
          chiave: 'allergeni',
          etichetta: 'Allergeni',
          tipo: 'elenco',
          aiuto: 'Uno per riga: Glutine, Latte, Uova, Soia, Frutta a guscio…',
        },
        {
          chiave: 'contenuto',
          etichetta: 'Contenuto del combo',
          tipo: 'elenco',
          aiuto: 'Solo per combo e menu: una voce per riga.',
        },
        {
          chiave: 'cinemaIds',
          etichetta: 'Disponibile solo in',
          tipo: 'multiscelta',
          opzioni: inOpzioni(cinema, (voce) => voce.id, (voce) => voce.nome),
          aiuto: 'Nessuna selezione = disponibile in tutta la rete.',
        },
        { chiave: 'immagine', etichetta: 'Indirizzo della fotografia', tipo: 'testo', larga: true },
        { chiave: 'palette', etichetta: 'Colori dell’illustrazione disegnata', tipo: 'palette' },
      ]}
    />
  )
}
