'use client'

import { Gestione, type ColonnaGestione } from '@/componenti/admin/Gestione'
import { Locandina } from '@/componenti/ui/Poster'
import { Etichetta } from '@/componenti/ui/Sezione'
import { GENERI } from '@/dati/film'
import { CLASSIFICAZIONI, FORMATI, STATI_FILM, type Film } from '@/lib/tipi'
import { durata } from '@/lib/utili'

/**
 * Catalogo film.
 *
 * Il campo «locandina» accetta l'indirizzo di un'immagine caricata su un
 * archivio esterno. Lasciandolo vuoto il sito disegna una locandina
 * procedurale dai due colori della palette: è la ragione per cui la palette è
 * modificabile e non nascosta fra i campi tecnici.
 */

const colonne: ColonnaGestione<Film>[] = [
  {
    etichetta: 'Film',
    ricerca: (film) => `${film.titolo} ${film.titoloOriginale} ${film.regista}`,
    resa: (film) => (
      <span className="flex items-center gap-3">
        <span className="block w-10 shrink-0 overflow-hidden rounded">
          <span className="locandina block">
            <Locandina
              titolo={film.titolo}
              chiave={film.id}
              palette={film.palette}
              immagine={film.locandina}
              mostraTitolo={false}
            />
          </span>
        </span>
        <span className="min-w-0">
          <span className="block font-medium">{film.titolo}</span>
          <span className="block text-[0.78rem] text-tenue">
            {film.anno} · {durata(film.durataMinuti)} · {film.regista || '—'}
          </span>
        </span>
      </span>
    ),
  },
  {
    etichetta: 'Generi',
    secondaria: true,
    ricerca: (film) => film.generi.join(' '),
    resa: (film) => <span className="text-tenue">{film.generi.join(', ') || '—'}</span>,
  },
  {
    etichetta: 'Formati',
    secondaria: true,
    resa: (film) => (
      <span className="flex flex-wrap gap-1">
        {film.formati.map((formato) => (
          <Etichetta key={formato} tono="neutro" className="px-2 py-0.5 text-[0.58rem]">
            {formato}
          </Etichetta>
        ))}
      </span>
    ),
  },
  {
    etichetta: 'Stato',
    resa: (film) => (
      <span className="space-y-1">
        <Etichetta tono={film.stato === 'in-sala' ? 'verde' : film.stato === 'prossimamente' ? 'viola' : 'neutro'}>
          {film.stato === 'in-sala' ? 'In sala' : film.stato === 'prossimamente' ? 'In arrivo' : 'Archivio'}
        </Etichetta>
        <span className="block text-[0.74rem] text-tenue">{film.classificazione}</span>
      </span>
    ),
  },
]

export default function PaginaFilmAdmin() {
  return (
    <Gestione<Film>
      titolo="Film"
      descrizione="Il catalogo che alimenta il sito e la programmazione. Un film non si elimina se ha spettacoli o biglietti collegati: si rende invisibile."
      endpoint="/api/admin/film"
      nomeVoce="film"
      etichettaVoce={(film) => film.titolo}
      colonne={colonne}
      interruttori={[
        { chiave: 'visibile', etichetta: 'Visibile' },
        { chiave: 'inEvidenza', etichetta: 'In evidenza' },
      ]}
      vuota={{
        titolo: '',
        titoloOriginale: '',
        sottotitolo: '',
        sinossi: '',
        trama: '',
        generi: [],
        durataMinuti: 100,
        anno: new Date().getFullYear(),
        classificazione: 'T',
        lingua: 'Italiano',
        paese: 'Italia',
        regista: '',
        cast: [],
        formati: ['2D'],
        trailer: null,
        trailerPiattaforma: 'youtube',
        trailerRiferimento: '',
        trailerDurata: 0,
        locandina: '',
        backdrop: '',
        palette: ['#1b1140', '#a06bff'],
        valutazione: 0,
        stato: 'prossimamente',
        dataUscita: '',
        inEvidenza: false,
        visibile: true,
      }}
      campi={[
        { chiave: 'titolo', etichetta: 'Titolo', tipo: 'testo' },
        { chiave: 'titoloOriginale', etichetta: 'Titolo originale', tipo: 'testo' },
        {
          chiave: 'sottotitolo',
          etichetta: 'Frase d’effetto',
          tipo: 'testo',
          larga: true,
          aiuto: 'Compare sotto il titolo nell’apertura della home.',
        },
        { chiave: 'sinossi', etichetta: 'Sinossi breve', tipo: 'area' },
        { chiave: 'trama', etichetta: 'Trama distesa', tipo: 'area', aiuto: 'Righe vuote fra un paragrafo e l’altro.' },
        {
          chiave: 'generi',
          etichetta: 'Generi',
          tipo: 'multiscelta',
          opzioni: GENERI.map((genere) => ({ valore: genere, etichetta: genere })),
        },
        { chiave: 'durataMinuti', etichetta: 'Durata (minuti)', tipo: 'numero', minimo: 1, massimo: 600 },
        { chiave: 'anno', etichetta: 'Anno', tipo: 'numero', minimo: 1890, massimo: 2100 },
        {
          chiave: 'classificazione',
          etichetta: 'Classificazione',
          tipo: 'scelta',
          opzioni: CLASSIFICAZIONI.map((voce) => ({ valore: voce, etichetta: voce })),
        },
        {
          chiave: 'stato',
          etichetta: 'Stato',
          tipo: 'scelta',
          opzioni: STATI_FILM.map((voce) => ({
            valore: voce,
            etichetta: voce === 'in-sala' ? 'In sala' : voce === 'prossimamente' ? 'Prossimamente' : 'Archivio',
          })),
        },
        { chiave: 'dataUscita', etichetta: 'Data di uscita', tipo: 'data' },
        { chiave: 'regista', etichetta: 'Regia', tipo: 'testo' },
        { chiave: 'lingua', etichetta: 'Lingua originale', tipo: 'testo' },
        { chiave: 'paese', etichetta: 'Paese', tipo: 'testo' },
        { chiave: 'valutazione', etichetta: 'Valutazione (0–10)', tipo: 'decimale', minimo: 0, massimo: 10 },
        {
          chiave: 'formati',
          etichetta: 'Formati disponibili',
          tipo: 'multiscelta',
          opzioni: FORMATI.map((formato) => ({ valore: formato, etichetta: formato })),
        },
        {
          chiave: 'locandina',
          etichetta: 'Indirizzo della locandina',
          tipo: 'testo',
          larga: true,
          aiuto: 'Lascia vuoto per usare la locandina disegnata dal sito.',
        },
        {
          chiave: 'backdrop',
          etichetta: 'Indirizzo del fondale',
          tipo: 'testo',
          larga: true,
          aiuto: 'Immagine panoramica per l’apertura e la scheda.',
        },
        {
          chiave: 'cast',
          etichetta: 'Interpreti',
          tipo: 'elenco',
          aiuto: 'Una riga per interprete, nella forma «Nome — Ruolo».',
        },
        {
          chiave: 'trailerPiattaforma',
          etichetta: 'Trailer: piattaforma',
          tipo: 'scelta',
          opzioni: [
            { valore: 'youtube', etichetta: 'YouTube' },
            { valore: 'vimeo', etichetta: 'Vimeo' },
            { valore: 'file', etichetta: 'File sul nostro dominio' },
          ],
        },
        {
          chiave: 'trailerRiferimento',
          etichetta: 'Trailer: identificativo',
          tipo: 'testo',
          aiuto: 'L’id del video (non l’indirizzo completo), oppure il percorso del file.',
        },
        {
          chiave: 'trailerDurata',
          etichetta: 'Trailer: durata in secondi',
          tipo: 'numero',
          minimo: 0,
          massimo: 3600,
        },
        {
          chiave: 'palette',
          etichetta: 'Colori della locandina disegnata',
          tipo: 'palette',
          aiuto: 'Usati quando non c’è un’immagine caricata.',
        },
      ]}
    />
  )
}
