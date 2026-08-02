import { GestioneRecensioni } from '@/componenti/admin/GestioneRecensioni'
import { leggi } from '@/lib/archivio'

export default async function PaginaRecensioniAdmin() {
  const { recensioni } = await leggi()
  return <GestioneRecensioni recensioni={recensioni} />
}
