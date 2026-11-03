'use client'

import { useState } from 'react'
import { Gestione, cellaPrezzo, type ColonnaGestione } from '@/componenti/admin/Gestione'
import { Schede } from '@/componenti/ui/Schede'
import { Icona } from '@/componenti/ui/Icona'
import { Nota } from '@/componenti/ui/Sezione'
import type { LivelloLoyalty, PremioLoyalty } from '@/lib/tipi'
import { numero } from '@/lib/utili'

/**
 * Programma fedeltà.
 *
 * Livelli e premi sono due collezioni distinte perché si modificano in momenti
 * diversi: i livelli si toccano una volta l'anno quando si ritara il
 * programma, i premi ogni volta che cambia il listino del banco.
 *
 * Nessuna soglia è scritta nel codice dell'applicazione: aggiungere un livello
 * sopra a quelli esistenti è un'operazione da pannello, non da sviluppatore.
 */

const colonneLivelli: ColonnaGestione<LivelloLoyalty>[] = [
  {
    etichetta: 'Livello',
    ricerca: (voce) => voce.nome,
    resa: (voce) => (
      <span className="flex items-center gap-3">
        <span
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${voce.colore}22`, color: voce.colore }}
        >
          <Icona nome="trofeo" className="size-4" />
        </span>
        <span className="font-medium">{voce.nome}</span>
      </span>
    ),
  },
  {
    etichetta: 'Soglia',
    resa: (voce) => <span className="tabellare">{numero(voce.puntiMinimi)} punti</span>,
  },
  {
    etichetta: 'Moltiplicatore',
    resa: (voce) => <span className="tabellare">×{voce.moltiplicatore}</span>,
  },
  {
    etichetta: 'Vantaggi',
    secondaria: true,
    resa: (voce) => <span className="text-[0.8rem] text-tenue">{voce.vantaggi.join(' · ')}</span>,
  },
]

const colonnePremi: ColonnaGestione<PremioLoyalty>[] = [
  {
    etichetta: 'Premio',
    ricerca: (voce) => `${voce.nome} ${voce.descrizione}`,
    resa: (voce) => (
      <span>
        <span className="block font-medium">{voce.nome}</span>
        <span className="block text-[0.78rem] text-tenue">{voce.descrizione}</span>
      </span>
    ),
  },
  {
    etichetta: 'Punti',
    resa: (voce) => <span className="tabellare font-semibold">{numero(voce.puntiRichiesti)}</span>,
  },
  { etichetta: 'Valore', resa: (voce) => cellaPrezzo(voce.valore) },
]

export default function PaginaLoyaltyAdmin() {
  const [vista, setVista] = useState<'livelli' | 'premi'>('livelli')

  return (
    <div>
      <header>
        <h1 className="font-titolo text-[1.8rem] font-semibold">Programma CLUB</h1>
        <p className="mt-1.5 max-w-2xl text-[0.9rem] text-tenue">
          Livelli e premi del programma fedeltà. Il livello di un cliente si calcola sui punti
          accumulati da sempre, non su quelli ancora disponibili: chi riscatta non retrocede.
        </p>
      </header>

      <Schede
        className="mt-7"
        etichetta="Sezioni del programma fedeltà"
        attiva={vista}
        onCambia={setVista}
        schede={[
          {
            id: 'livelli',
            etichetta: 'Livelli',
            contenuto: (
              <Gestione<LivelloLoyalty>
                titolo="Livelli"
                descrizione="Le soglie che determinano il livello. Un livello a cui appartengono dei clienti non si elimina finché non li si sposta."
                endpoint="/api/admin/loyalty/livelli"
                nomeVoce="livello"
                etichettaVoce={(voce) => voce.nome}
                colonne={colonneLivelli}
                vuota={{
                  nome: '',
                  puntiMinimi: 0,
                  colore: '#b9c0d4',
                  vantaggi: [],
                  moltiplicatore: 1,
                  ordine: 10,
                }}
                campi={[
                  { chiave: 'nome', etichetta: 'Nome', tipo: 'testo' },
                  { chiave: 'puntiMinimi', etichetta: 'Punti minimi', tipo: 'numero', minimo: 0 },
                  {
                    chiave: 'moltiplicatore',
                    etichetta: 'Moltiplicatore punti',
                    tipo: 'decimale',
                    minimo: 1,
                    massimo: 10,
                    aiuto: '1,25 significa «+25% punti su ogni acquisto».',
                  },
                  { chiave: 'colore', etichetta: 'Colore', tipo: 'colore' },
                  { chiave: 'vantaggi', etichetta: 'Vantaggi', tipo: 'elenco' },
                  { chiave: 'ordine', etichetta: 'Posizione', tipo: 'numero', minimo: 0 },
                ]}
              />
            ),
          },
          {
            id: 'premi',
            etichetta: 'Premi',
            contenuto: (
              <>
                <Nota className="mb-6" icona={<Icona nome="info" className="size-4" />}>
                  Riscattando un premio il cliente riceve un coupon da usare al prossimo acquisto,
                  valido 90 giorni. Anche i premi in natura — un popcorn, un upgrade — diventano
                  uno sconto pari al loro valore: è la stessa cosa per chi lo riceve ed è molto
                  più semplice da far quadrare in cassa.
                </Nota>

                <Gestione<PremioLoyalty>
                  titolo="Premi"
                  descrizione="Cosa si può ottenere con i punti."
                  endpoint="/api/admin/loyalty/premi"
                  nomeVoce="premio"
                  etichettaVoce={(voce) => voce.nome}
                  colonne={colonnePremi}
                  interruttori={[{ chiave: 'attivo', etichetta: 'Attivo' }]}
                  vuota={{
                    nome: '',
                    descrizione: '',
                    puntiRichiesti: 500,
                    tipo: 'sconto',
                    valore: 5,
                    attivo: true,
                  }}
                  campi={[
                    { chiave: 'nome', etichetta: 'Nome', tipo: 'testo' },
                    {
                      chiave: 'tipo',
                      etichetta: 'Tipo',
                      tipo: 'scelta',
                      opzioni: [
                        { valore: 'biglietto', etichetta: 'Biglietto' },
                        { valore: 'food', etichetta: 'Prodotto del banco' },
                        { valore: 'sconto', etichetta: 'Sconto' },
                        { valore: 'upgrade', etichetta: 'Upgrade di poltrona' },
                      ],
                    },
                    { chiave: 'puntiRichiesti', etichetta: 'Punti richiesti', tipo: 'numero', minimo: 1 },
                    {
                      chiave: 'valore',
                      etichetta: 'Valore in euro',
                      tipo: 'decimale',
                      minimo: 0,
                      aiuto: 'È l’importo dello sconto che il cliente riceve.',
                    },
                    { chiave: 'descrizione', etichetta: 'Descrizione', tipo: 'area' },
                  ]}
                />
              </>
            ),
          },
        ]}
      />
    </div>
  )
}
