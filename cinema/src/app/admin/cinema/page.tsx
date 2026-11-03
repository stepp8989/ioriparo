'use client'

import { Gestione, type ColonnaGestione } from '@/componenti/admin/Gestione'
import { Etichetta } from '@/componenti/ui/Sezione'
import { SERVIZI_CINEMA, type Cinema } from '@/lib/tipi'

/**
 * Strutture della rete.
 *
 * Gli orari di apertura non sono in questo modulo: sono sette righe con due
 * orari ciascuna, e meritano un'interfaccia propria invece di quattordici
 * campi in fila. Fino ad allora restano quelli impostati alla creazione, che
 * per un multisala cambiano una volta ogni tanto.
 */

const colonne: ColonnaGestione<Cinema>[] = [
  {
    etichetta: 'Cinema',
    ricerca: (cinema) => `${cinema.nome} ${cinema.citta} ${cinema.indirizzo} ${cinema.cap}`,
    resa: (cinema) => (
      <span>
        <span className="block font-medium">{cinema.nome}</span>
        <span className="block text-[0.78rem] text-tenue">
          {cinema.indirizzo}, {cinema.cap} {cinema.citta} ({cinema.provincia})
        </span>
      </span>
    ),
  },
  {
    etichetta: 'Contatti',
    secondaria: true,
    resa: (cinema) => (
      <span className="text-tenue">
        <span className="block">{cinema.telefono}</span>
        <span className="block">{cinema.email}</span>
      </span>
    ),
  },
  {
    etichetta: 'Servizi',
    secondaria: true,
    resa: (cinema) => (
      <span className="flex flex-wrap gap-1">
        {cinema.servizi.slice(0, 5).map((servizio) => (
          <Etichetta key={servizio} tono="neutro" className="px-2 py-0.5 text-[0.56rem]">
            {servizio}
          </Etichetta>
        ))}
        {cinema.servizi.length > 5 && (
          <span className="text-[0.72rem] text-tenue">+{cinema.servizi.length - 5}</span>
        )}
      </span>
    ),
  },
  {
    etichetta: 'Coordinate',
    secondaria: true,
    resa: (cinema) =>
      cinema.coordinate.lat === 0 && cinema.coordinate.lng === 0 ? (
        <Etichetta tono="ambra">Da impostare</Etichetta>
      ) : (
        <span className="tabellare text-[0.78rem] text-tenue">
          {cinema.coordinate.lat.toFixed(4)}, {cinema.coordinate.lng.toFixed(4)}
        </span>
      ),
  },
]

export default function PaginaCinemaAdmin() {
  return (
    <Gestione<Cinema>
      titolo="Cinema"
      descrizione="Le strutture della rete. Le coordinate servono alla ricerca «vicino a me»: senza, il cinema compare in elenco ma non viene mai ordinato per distanza."
      endpoint="/api/admin/cinema"
      nomeVoce="cinema"
      etichettaVoce={(cinema) => cinema.nome}
      colonne={colonne}
      interruttori={[{ chiave: 'visibile', etichetta: 'Visibile' }]}
      vuota={{
        nome: '',
        descrizione: '',
        indirizzo: '',
        citta: '',
        cap: '',
        provincia: '',
        telefono: '',
        email: '',
        coordinate: { lat: 0, lng: 0 },
        servizi: ['Bar'],
        orari: [],
        immagine: '',
        palette: ['#2a1040', '#ff4d7d'],
        visibile: true,
      }}
      campi={[
        { chiave: 'nome', etichetta: 'Nome', tipo: 'testo', aiuto: 'Senza il nome della catena: quello si aggiunge da solo.' },
        { chiave: 'citta', etichetta: 'Città', tipo: 'testo' },
        { chiave: 'indirizzo', etichetta: 'Indirizzo', tipo: 'testo', larga: true },
        { chiave: 'cap', etichetta: 'CAP', tipo: 'testo' },
        { chiave: 'provincia', etichetta: 'Provincia', tipo: 'testo', aiuto: 'Sigla di due lettere.' },
        { chiave: 'telefono', etichetta: 'Telefono', tipo: 'testo' },
        { chiave: 'email', etichetta: 'Email', tipo: 'testo' },
        { chiave: 'descrizione', etichetta: 'Descrizione', tipo: 'area' },
        {
          chiave: 'servizi',
          etichetta: 'Servizi',
          tipo: 'multiscelta',
          opzioni: SERVIZI_CINEMA.map((servizio) => ({ valore: servizio, etichetta: servizio })),
        },
        { chiave: 'immagine', etichetta: 'Indirizzo della fotografia', tipo: 'testo', larga: true },
        { chiave: 'palette', etichetta: 'Colori dell’immagine disegnata', tipo: 'palette' },
      ]}
    />
  )
}
