import { GestioneOrari } from '@/componenti/admin/GestioneOrari'
import { leggi } from '@/lib/archivio'

export default async function PaginaOrariAdmin() {
  const { orari } = await leggi()
  return <GestioneOrari orari={orari} />
}
