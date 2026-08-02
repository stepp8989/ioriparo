import { GestioneEventi } from '@/componenti/admin/GestioneEventi'
import { leggi } from '@/lib/archivio'

export default async function PaginaEventiAdmin() {
  const { eventi } = await leggi()
  return <GestioneEventi eventi={eventi} />
}
