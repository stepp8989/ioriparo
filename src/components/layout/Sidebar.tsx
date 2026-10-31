import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Boxes,
  CalendarClock,
  DatabaseBackup,
  FileText,
  Gift,
  Globe,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  Receipt,
  Settings,
  Smartphone,
  Truck,
  UserCircle2,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { Logo } from './Logo'
import { cn } from '@/lib/cn'
import { useGestionale } from '@/data/store'

interface VoceMenu {
  etichetta: string
  percorso: string
  icona: LucideIcon
}

interface GruppoMenu {
  /** Titolo della sezione; assente per il primo gruppo, che apre il menu */
  titolo?: string
  voci: VoceMenu[]
}

/**
 * Menu raggruppato per area di lavoro: ogni sezione del gestionale ha la sua
 * pagina, e i gruppi rendono l'elenco leggibile anche quando le voci cresceranno.
 */
export const GRUPPI_MENU: GruppoMenu[] = [
  {
    voci: [
      { etichetta: 'Dashboard', percorso: '/gestionale', icona: LayoutDashboard },
      { etichetta: 'Richieste dal sito', percorso: '/gestionale/richieste', icona: Inbox },
    ],
  },
  {
    titolo: 'Laboratorio',
    voci: [
      { etichetta: 'Riparazioni', percorso: '/gestionale/riparazioni', icona: Smartphone },
      { etichetta: 'Clienti', percorso: '/gestionale/clienti', icona: Users },
      { etichetta: 'Fedeltà e inviti', percorso: '/gestionale/fedelta', icona: Gift },
      { etichetta: 'Scadenze e promemoria', percorso: '/gestionale/scadenze', icona: CalendarClock },
      { etichetta: 'Impianti e installazioni', percorso: '/gestionale/impianti', icona: Wrench },
    ],
  },
  {
    titolo: 'Documenti',
    voci: [
      { etichetta: 'Preventivi', percorso: '/gestionale/preventivi', icona: FileText },
      { etichetta: 'Fatture', percorso: '/gestionale/fatture', icona: Receipt },
    ],
  },
  {
    titolo: 'Magazzino',
    voci: [
      { etichetta: 'Ricambi', percorso: '/gestionale/magazzino', icona: Boxes },
      { etichetta: 'Ordini fornitori', percorso: '/gestionale/ordini', icona: Truck },
    ],
  },
  {
    titolo: 'Analisi',
    voci: [{ etichetta: 'Statistiche', percorso: '/gestionale/statistiche', icona: BarChart3 }],
  },
  {
    titolo: 'Account',
    voci: [
      { etichetta: 'Profilo personale', percorso: '/gestionale/profilo', icona: UserCircle2 },
      { etichetta: 'Impostazioni', percorso: '/gestionale/impostazioni', icona: Settings },
      { etichetta: 'Backup ed esportazioni', percorso: '/gestionale/backup', icona: DatabaseBackup },
    ],
  },
]

/** Elenco piatto, per la ricerca rapida e la navigazione da tastiera. */
export const VOCI_MENU: VoceMenu[] = GRUPPI_MENU.flatMap((g) => g.voci)

export function Sidebar({ aperta, onChiudi }: { aperta: boolean; onChiudi: () => void }) {
  const { db } = useGestionale()
  const { azienda } = db

  return (
    <>
      {/* Sfondo scuro sotto il menu a scomparsa su mobile */}
      {aperta && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onChiudi}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-200 lg:translate-x-0',
          aperta ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <Logo />
          <button
            type="button"
            onClick={onChiudi}
            aria-label="Chiudi menu"
            className="rounded-lg p-1.5 text-ink-faint hover:bg-surface-2 hover:text-ink lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="no-scrollbar flex-1 overflow-y-auto p-3" aria-label="Menu principale">
          {GRUPPI_MENU.map((gruppo, i) => (
            <div key={gruppo.titolo ?? 'principale'} className={cn(i > 0 && 'mt-4')}>
              {gruppo.titolo && (
                <p className="px-2.5 pb-1.5 text-[10.5px] font-semibold tracking-wider text-ink-faint uppercase">
                  {gruppo.titolo}
                </p>
              )}
              <ul className="space-y-0.5">
                {gruppo.voci.map(({ etichetta, percorso, icona: Icona }) => (
                  <li key={percorso}>
                    <NavLink
                      to={percorso}
                      end={percorso === '/gestionale'}
                      onClick={onChiudi}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13.5px] transition-colors',
                          isActive
                            ? 'bg-brand font-semibold text-white'
                            : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
                        )
                      }
                    >
                      <Icona size={18} strokeWidth={1.9} className="shrink-0" />
                      <span className="truncate">{etichetta}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-line p-4">
          <NavLink
            to="/"
            className="mb-3 flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] font-semibold text-ink-muted transition-colors hover:border-brand hover:text-ink"
          >
            <Globe size={14} />
            Vai al sito pubblico
          </NavLink>
          <Logo compatto senzaTesto className="mb-3" />
          <p className="text-[13px] font-bold text-ink">{azienda.nome}</p>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-tight text-ink-faint">
            <li>
              {azienda.indirizzo}
              <br />
              {azienda.citta}
            </li>
            <li>
              <a href={`tel:${azienda.telefono.replace(/\s/g, '')}`} className="hover:text-ink-muted">
                {azienda.telefono}
              </a>
            </li>
            <li>
              <a href={`mailto:${azienda.email}`} className="break-all hover:text-ink-muted">
                {azienda.email}
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}
