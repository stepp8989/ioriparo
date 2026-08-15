import type { Metadata } from 'next'
import { Guscio } from '@/componenti/admin/Guscio'

/**
 * Il pannello ha una struttura tutta sua: niente intestazione del sito, niente
 * piè di pagina, niente banner cookie. Non è indicizzabile e non deve esserlo.
 */
export const metadata: Metadata = {
  title: 'Pannello di gestione',
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Guscio>{children}</Guscio>
}
