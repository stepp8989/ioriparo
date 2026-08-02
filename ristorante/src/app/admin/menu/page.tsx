import { GestioneMenu } from '@/componenti/admin/GestioneMenu'
import { leggi } from '@/lib/archivio'

export default async function PaginaMenuAdmin() {
  const { piatti } = await leggi()
  return <GestioneMenu piatti={piatti} />
}
