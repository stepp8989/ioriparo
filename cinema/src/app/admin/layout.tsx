import type { Metadata } from 'next'
import { Guscio } from '@/componenti/admin/Guscio'
import { FornitoreAvvisi } from '@/componenti/ui/Avviso'

/**
 * Struttura del pannello.
 *
 * Il pannello non eredita l'intestazione né il piè di pagina del sito: sono due
 * applicazioni diverse che condividono solo il documento, i caratteri e il
 * sistema di colori.
 */
export const metadata: Metadata = {
  title: 'Pannello di gestione',
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <FornitoreAvvisi>
      <Guscio>{children}</Guscio>
    </FornitoreAvvisi>
  )
}
