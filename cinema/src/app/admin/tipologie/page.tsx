'use client'

import { Gestione, cellaPrezzo, type ColonnaGestione } from '@/componenti/admin/Gestione'
import { Etichetta } from '@/componenti/ui/Sezione'
import type { TipologiaBiglietto } from '@/lib/tipi'

/**
 * Tipologie di biglietto.
 *
 * La variazione è una differenza rispetto al prezzo base dello spettacolo, e
 * può essere negativa. È il motivo per cui alzare il listino di un cinema non
 * richiede di rimettere mano a otto tipologie: basta cambiare il prezzo degli
 * spettacoli.
 */

const colonne: ColonnaGestione<TipologiaBiglietto>[] = [
  {
    etichetta: 'Tipologia',
    ricerca: (voce) => `${voce.nome} ${voce.descrizione}`,
    resa: (voce) => (
      <span>
        <span className="block font-medium">{voce.nome}</span>
        <span className="block text-[0.78rem] text-tenue">{voce.descrizione}</span>
      </span>
    ),
  },
  {
    etichetta: 'Variazione',
    resa: (voce) => (
      <span
        className={
          voce.variazione === 0 ? 'text-tenue' : voce.variazione > 0 ? 'text-accento' : 'text-ok'
        }
      >
        {voce.variazione > 0 && '+'}
        {cellaPrezzo(voce.variazione)}
      </span>
    ),
  },
  {
    etichetta: 'Vincoli',
    secondaria: true,
    resa: (voce) => (
      <span className="flex flex-wrap gap-1.5">
        {voce.richiedeDocumento && <Etichetta tono="ambra">Documento</Etichetta>}
        {voce.massimoPerOrdine > 0 && (
          <Etichetta tono="neutro">max {voce.massimoPerOrdine}/ordine</Etichetta>
        )}
      </span>
    ),
  },
]

export default function PaginaTipologieAdmin() {
  return (
    <Gestione<TipologiaBiglietto>
      titolo="Tipologie di biglietto"
      descrizione="Intero, ridotto, studente, VIP. La variazione si somma al prezzo base dello spettacolo e può essere negativa."
      endpoint="/api/admin/tipologie"
      nomeVoce="tipologia"
      etichettaVoce={(voce) => voce.nome}
      colonne={colonne}
      interruttori={[{ chiave: 'attiva', etichetta: 'Attiva' }]}
      vuota={{
        nome: '',
        descrizione: '',
        variazione: 0,
        richiedeDocumento: false,
        massimoPerOrdine: 0,
        attiva: true,
        ordine: 10,
      }}
      campi={[
        { chiave: 'nome', etichetta: 'Nome', tipo: 'testo' },
        { chiave: 'variazione', etichetta: 'Variazione sul prezzo base (€)', tipo: 'decimale', minimo: -50, massimo: 50 },
        { chiave: 'descrizione', etichetta: 'Descrizione', tipo: 'area' },
        {
          chiave: 'richiedeDocumento',
          etichetta: 'Richiede un documento all’ingresso',
          tipo: 'booleano',
          aiuto: 'Compare come avviso durante l’acquisto e sul lettore della maschera.',
        },
        {
          chiave: 'massimoPerOrdine',
          etichetta: 'Massimo per ordine',
          tipo: 'numero',
          minimo: 0,
          massimo: 50,
          aiuto: '0 = nessun limite.',
        },
        { chiave: 'ordine', etichetta: 'Posizione nell’elenco', tipo: 'numero', minimo: 0, massimo: 999 },
      ]}
    />
  )
}
