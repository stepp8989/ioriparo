import type { Metadata } from 'next'
import { AreaPersonale } from '@/componenti/account/AreaPersonale'
import { Sezione } from '@/componenti/ui/Sezione'
import { metadatiPagina } from '@/lib/seo'

/**
 * Area personale.
 *
 * La pagina è un guscio: tutto il contenuto arriva dal browser dopo
 * l'autenticazione, perché è interamente personale e non ha nulla da mostrare a
 * chi non ha una sessione. Disegnarla dal server significherebbe passare dati
 * privati attraverso una pagina che i motori di ricerca potrebbero raggiungere.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = metadatiPagina({
  titolo: 'My Cinema',
  descrizione: 'I tuoi biglietti, i punti CLUB, i coupon e l’abbonamento.',
  percorso: '/area-personale',
  indicizza: false,
})

export default async function PaginaAreaPersonale({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const parametri = await searchParams
  const vista = (Array.isArray(parametri.vista) ? parametri.vista[0] : parametri.vista) ?? ''

  return (
    <Sezione spaziatura="testata">
      <AreaPersonale vistaIniziale={vista} />
    </Sezione>
  )
}
