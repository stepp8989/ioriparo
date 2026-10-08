'use client'

import { Gestione, type ColonnaGestione } from '@/componenti/admin/Gestione'
import { inOpzioni, useElenco } from '@/componenti/admin/dati'
import { Etichetta } from '@/componenti/ui/Sezione'
import {
  FORMATI,
  TIPI_PROMOZIONE,
  type Cinema,
  type Film,
  type LivelloLoyalty,
  type Promozione,
} from '@/lib/tipi'
import { dataBreve, GIORNI_SETTIMANA, percentuale, prezzo } from '@/lib/utili'

/**
 * Promozioni.
 *
 * Il campo più importante è quello che non si vede: lasciando vuoto il codice,
 * la promozione si applica da sola quando le condizioni sono soddisfatte.
 * Serve a non far dipendere lo sconto dal fatto che il cliente si ricordi una
 * parola letta su un volantino.
 *
 * Quando più promozioni automatiche valgono per lo stesso ordine, il motore
 * dei prezzi applica quella che conviene di più al cliente. Non è configurabile,
 * ed è giusto così: l'alternativa è far scegliere al cinema quale sconto dare,
 * e nessuno sceglierebbe il più generoso.
 */

const NOMI_TIPO: Record<Promozione['tipo'], string> = {
  '2x1': 'Paghi uno',
  percentuale: 'Sconto percentuale',
  fisso: 'Sconto fisso',
  'punti-extra': 'Punti moltiplicati',
  'food-omaggio': 'Food in omaggio',
}

const colonne: ColonnaGestione<Promozione>[] = [
  {
    etichetta: 'Promozione',
    ricerca: (voce) => `${voce.titolo} ${voce.sottotitolo} ${voce.codice}`,
    resa: (voce) => (
      <span>
        <span className="block font-medium">{voce.titolo}</span>
        <span className="block text-[0.78rem] text-tenue">{voce.sottotitolo}</span>
      </span>
    ),
  },
  {
    etichetta: 'Vantaggio',
    resa: (voce) => (
      <span className="text-[0.84rem]">
        {voce.tipo === 'percentuale' && `−${percentuale(voce.valore)}`}
        {voce.tipo === 'fisso' && `−${prezzo(voce.valore)}`}
        {voce.tipo === '2x1' && 'Paghi uno'}
        {voce.tipo === 'punti-extra' && `Punti ×${voce.valore}`}
        {voce.tipo === 'food-omaggio' && `Food fino a ${prezzo(voce.valore)}`}
      </span>
    ),
  },
  {
    etichetta: 'Attivazione',
    resa: (voce) =>
      voce.codice ? (
        <span className="tabellare text-[0.82rem] font-semibold">{voce.codice}</span>
      ) : (
        <Etichetta tono="verde">Automatica</Etichetta>
      ),
  },
  {
    etichetta: 'Validità',
    secondaria: true,
    resa: (voce) => (
      <span className="text-[0.78rem] text-tenue">
        <span className="block">
          {dataBreve(voce.dal)} → {dataBreve(voce.al)}
        </span>
        {voce.giorniValidi.length > 0 && (
          <span className="block">
            {voce.giorniValidi.map((giorno) => GIORNI_SETTIMANA[giorno].slice(0, 3)).join(', ')}
          </span>
        )}
      </span>
    ),
  },
  {
    etichetta: 'Utilizzi',
    secondaria: true,
    resa: (voce) => (
      <span className="tabellare text-[0.82rem]">
        {voce.utilizzi}
        {voce.limiteUtilizzi > 0 && ` / ${voce.limiteUtilizzi}`}
      </span>
    ),
  },
]

export default function PaginaPromozioniAdmin() {
  const { voci: cinema } = useElenco<Cinema>('/api/admin/cinema')
  const { voci: film } = useElenco<Film>('/api/admin/film')
  const { voci: livelli } = useElenco<LivelloLoyalty>('/api/admin/loyalty/livelli')

  return (
    <Gestione<Promozione>
      titolo="Promozioni"
      descrizione="Senza codice la promozione si applica da sola quando le condizioni sono soddisfatte. Fra più promozioni valide, il sistema applica quella più conveniente per il cliente."
      endpoint="/api/admin/promozioni"
      nomeVoce="promozione"
      etichettaVoce={(voce) => voce.titolo}
      colonne={colonne}
      interruttori={[
        { chiave: 'attiva', etichetta: 'Attiva' },
        { chiave: 'inEvidenza', etichetta: 'In evidenza' },
      ]}
      vuota={{
        titolo: '',
        sottotitolo: '',
        descrizione: '',
        tipo: 'percentuale',
        valore: 10,
        codice: '',
        immagine: '',
        palette: ['#2a1040', '#ff4d7d'],
        dal: '',
        al: '',
        giorniValidi: [],
        oraDa: '',
        oraA: '',
        cinemaIds: [],
        filmIds: [],
        formati: [],
        limiteUtilizzi: 0,
        limitePerCliente: 0,
        soloAbbonati: false,
        livelliRichiesti: [],
        attiva: true,
        inEvidenza: false,
      }}
      campi={[
        { chiave: 'titolo', etichetta: 'Titolo', tipo: 'testo' },
        { chiave: 'sottotitolo', etichetta: 'Sottotitolo', tipo: 'testo' },
        { chiave: 'descrizione', etichetta: 'Descrizione', tipo: 'area' },
        {
          chiave: 'tipo',
          etichetta: 'Meccanica',
          tipo: 'scelta',
          opzioni: TIPI_PROMOZIONE.map((voce) => ({ valore: voce, etichetta: NOMI_TIPO[voce] })),
        },
        {
          chiave: 'valore',
          etichetta: 'Valore',
          tipo: 'decimale',
          aiuto: 'Percentuale per lo sconto %, euro per lo sconto fisso, moltiplicatore per i punti.',
        },
        {
          chiave: 'codice',
          etichetta: 'Codice',
          tipo: 'testo',
          aiuto: 'Lascia vuoto per una promozione che si applica da sola.',
        },
        { chiave: 'dal', etichetta: 'Valida dal', tipo: 'data' },
        { chiave: 'al', etichetta: 'Valida fino al', tipo: 'data' },
        {
          chiave: 'giorniValidi',
          etichetta: 'Giorni della settimana',
          tipo: 'multiscelta',
          opzioni: GIORNI_SETTIMANA.map((nome, indice) => ({
            valore: String(indice),
            etichetta: nome,
          })),
          aiuto: 'Nessuna selezione = tutti i giorni.',
        },
        { chiave: 'oraDa', etichetta: 'Spettacoli dalle', tipo: 'ora' },
        { chiave: 'oraA', etichetta: 'Spettacoli fino alle', tipo: 'ora' },
        {
          chiave: 'cinemaIds',
          etichetta: 'Solo nei cinema',
          tipo: 'multiscelta',
          opzioni: inOpzioni(cinema, (voce) => voce.id, (voce) => voce.nome),
        },
        {
          chiave: 'filmIds',
          etichetta: 'Solo sui film',
          tipo: 'multiscelta',
          opzioni: inOpzioni(film, (voce) => voce.id, (voce) => voce.titolo),
        },
        {
          chiave: 'formati',
          etichetta: 'Solo nei formati',
          tipo: 'multiscelta',
          opzioni: FORMATI.map((voce) => ({ valore: voce, etichetta: voce })),
        },
        { chiave: 'limiteUtilizzi', etichetta: 'Utilizzi totali (0 = illimitati)', tipo: 'numero', minimo: 0 },
        { chiave: 'limitePerCliente', etichetta: 'Utilizzi per cliente (0 = illimitati)', tipo: 'numero', minimo: 0 },
        { chiave: 'soloAbbonati', etichetta: 'Riservata agli abbonati', tipo: 'booleano' },
        {
          chiave: 'livelliRichiesti',
          etichetta: 'Riservata ai livelli CLUB',
          tipo: 'multiscelta',
          opzioni: inOpzioni(livelli, (voce) => voce.id, (voce) => voce.nome),
        },
        { chiave: 'palette', etichetta: 'Colori della scheda', tipo: 'palette' },
      ]}
    />
  )
}
