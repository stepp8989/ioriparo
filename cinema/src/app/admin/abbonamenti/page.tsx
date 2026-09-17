'use client'

import { Gestione, cellaPrezzo, type ColonnaGestione } from '@/componenti/admin/Gestione'
import { Etichetta } from '@/componenti/ui/Sezione'
import { FORMATI, PERIODI_ABBONAMENTO, type PianoAbbonamento } from '@/lib/tipi'
import { percentuale } from '@/lib/utili'

/**
 * Piani di abbonamento.
 *
 * Le limitazioni si compilano con la stessa cura dei vantaggi: sono l'unica
 * parte che il cliente scopre dopo aver pagato, se non le si scrive prima.
 */

const colonne: ColonnaGestione<PianoAbbonamento>[] = [
  {
    etichetta: 'Piano',
    ricerca: (voce) => `${voce.nome} ${voce.descrizione}`,
    resa: (voce) => (
      <span className="flex items-center gap-3">
        <span
          className="inline-block size-3 shrink-0 rounded-full"
          style={{ backgroundColor: voce.colore }}
          aria-hidden
        />
        <span className="min-w-0">
          <span className="block font-medium">{voce.nome}</span>
          <span className="block text-[0.78rem] text-tenue">
            {voce.periodo === 'mensile' ? 'Mensile' : 'Annuale'}
          </span>
        </span>
      </span>
    ),
  },
  { etichetta: 'Prezzo', resa: (voce) => cellaPrezzo(voce.prezzo) },
  {
    etichetta: 'Ingressi',
    resa: (voce) => (
      <span className="tabellare text-[0.84rem]">
        {voce.ingressiInclusi === 0 ? 'Illimitati' : voce.ingressiInclusi}
      </span>
    ),
  },
  {
    etichetta: 'Compreso',
    secondaria: true,
    resa: (voce) => (
      <span className="flex flex-wrap gap-1">
        {voce.formatiInclusi.map((formato) => (
          <Etichetta key={formato} tono="ambra" className="px-2 py-0.5 text-[0.56rem]">
            {formato}
          </Etichetta>
        ))}
        {voce.scontoFood > 0 && (
          <Etichetta tono="verde" className="px-2 py-0.5 text-[0.56rem]">
            banco {percentuale(voce.scontoFood)}
          </Etichetta>
        )}
      </span>
    ),
  },
]

export default function PaginaAbbonamentiAdmin() {
  return (
    <Gestione<PianoAbbonamento>
      titolo="Abbonamenti"
      descrizione="I piani mostrati sul sito. Un piano con abbonati attivi non si elimina: si disattiva, così chi lo ha sottoscritto conserva i propri diritti fino alla scadenza."
      endpoint="/api/admin/piani"
      nomeVoce="piano"
      etichettaVoce={(voce) => voce.nome}
      colonne={colonne}
      interruttori={[
        { chiave: 'attivo', etichetta: 'Attivo' },
        { chiave: 'inEvidenza', etichetta: 'In evidenza' },
      ]}
      vuota={{
        nome: '',
        descrizione: '',
        prezzo: 0,
        periodo: 'mensile',
        ingressiInclusi: 4,
        vantaggi: [],
        limitazioni: [],
        scontoFood: 0,
        formatiInclusi: ['2D'],
        colore: '#9d6bff',
        attivo: true,
        inEvidenza: false,
        ordine: 10,
      }}
      campi={[
        { chiave: 'nome', etichetta: 'Nome', tipo: 'testo' },
        {
          chiave: 'periodo',
          etichetta: 'Periodicità',
          tipo: 'scelta',
          opzioni: PERIODI_ABBONAMENTO.map((voce) => ({
            valore: voce,
            etichetta: voce === 'mensile' ? 'Mensile' : 'Annuale',
          })),
        },
        { chiave: 'prezzo', etichetta: 'Prezzo (€)', tipo: 'decimale', minimo: 0 },
        {
          chiave: 'ingressiInclusi',
          etichetta: 'Ingressi compresi',
          tipo: 'numero',
          minimo: 0,
          aiuto: '0 = illimitati.',
        },
        { chiave: 'descrizione', etichetta: 'Descrizione', tipo: 'area' },
        { chiave: 'vantaggi', etichetta: 'Vantaggi', tipo: 'elenco' },
        {
          chiave: 'limitazioni',
          etichetta: 'Limitazioni',
          tipo: 'elenco',
          aiuto: 'Scrivile tutte: compaiono sul sito con lo stesso risalto dei vantaggi.',
        },
        { chiave: 'scontoFood', etichetta: 'Sconto sul banco (%)', tipo: 'decimale', minimo: 0, massimo: 100 },
        {
          chiave: 'formatiInclusi',
          etichetta: 'Formati senza supplemento',
          tipo: 'multiscelta',
          opzioni: FORMATI.map((voce) => ({ valore: voce, etichetta: voce })),
        },
        { chiave: 'colore', etichetta: 'Colore', tipo: 'colore' },
        { chiave: 'ordine', etichetta: 'Posizione', tipo: 'numero', minimo: 0, massimo: 999 },
      ]}
    />
  )
}
