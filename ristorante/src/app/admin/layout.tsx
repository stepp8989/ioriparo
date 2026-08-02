import type { Metadata } from 'next'
import { Accesso } from '@/componenti/admin/Accesso'
import { Guscio } from '@/componenti/admin/Guscio'
import { leggi } from '@/lib/archivio'
import { sessioneAttiva } from '@/lib/sessione'

export const metadata: Metadata = {
  title: 'Pannello di gestione',
  // Il pannello non deve finire nei motori di ricerca in nessun caso.
  robots: { index: false, follow: false, nocache: true },
}

/**
 * Il pannello è sempre reso al momento della richiesta: mostra dati che
 * cambiano di continuo e dipende dal cookie di sessione, quindi non ha senso
 * memorizzarlo in cache.
 */
export const dynamic = 'force-dynamic'

/**
 * Struttura del pannello.
 *
 * Il controllo dell'accesso sta qui, non nelle singole pagine: qualunque
 * indirizzo sotto `/admin` passa da questo layout, quindi non è possibile
 * dimenticare una pagina scoperta. Senza sessione valida si vede solo il
 * modulo di accesso.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await sessioneAttiva())) return <Accesso />

  // Numeri mostrati accanto alle voci del menù: quanto c'è da guardare.
  const { prenotazioni, messaggi } = await leggi()
  const contatori = {
    prenotazioni: prenotazioni.filter((voce) => voce.stato === 'in-attesa').length,
    messaggi: messaggi.filter((voce) => !voce.letto).length,
  }

  return <Guscio contatori={contatori}>{children}</Guscio>
}
