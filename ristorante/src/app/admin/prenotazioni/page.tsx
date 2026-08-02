import { GestionePrenotazioni } from '@/componenti/admin/GestionePrenotazioni'
import { leggi } from '@/lib/archivio'

export default async function PaginaPrenotazioniAdmin() {
  const { prenotazioni } = await leggi()
  return <GestionePrenotazioni prenotazioni={prenotazioni} />
}
