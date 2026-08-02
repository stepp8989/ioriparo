import { GestioneMessaggi } from '@/componenti/admin/GestioneMessaggi'
import { leggi } from '@/lib/archivio'

export default async function PaginaMessaggiAdmin() {
  const { messaggi } = await leggi()
  return <GestioneMessaggi messaggi={messaggi} />
}
