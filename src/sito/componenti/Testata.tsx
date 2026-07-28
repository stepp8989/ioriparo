import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utili'
import { Icona } from './Icona'
import { Marchio } from './Marchio'

export const VOCI_NAVIGAZIONE = [
  { etichetta: 'Home', percorso: '/' },
  { etichetta: 'Chi siamo', percorso: '/chi-siamo' },
  { etichetta: 'Servizi', percorso: '/servizi' },
  { etichetta: 'Galleria', percorso: '/galleria' },
  { etichetta: 'Stato riparazione', percorso: '/stato-riparazione' },
  { etichetta: 'Blog', percorso: '/blog' },
  { etichetta: 'Contatti', percorso: '/contatti' },
]

export function Testata({
  tema,
  onCambiaTema,
  onApriRicerca,
  onApriMenu,
}: {
  tema: string
  onCambiaTema: () => void
  onApriRicerca: () => void
  onApriMenu: () => void
}) {
  const [ancorata, setAncorata] = useState(false)
  const [avanzamento, setAvanzamento] = useState(0)

  useEffect(() => {
    const aggiorna = () => {
      const y = window.scrollY
      const totale = document.documentElement.scrollHeight - window.innerHeight
      setAncorata(y > 8)
      setAvanzamento(totale > 0 ? (y / totale) * 100 : 0)
    }
    aggiorna()
    window.addEventListener('scroll', aggiorna, { passive: true })
    return () => window.removeEventListener('scroll', aggiorna)
  }, [])

  return (
    <header className={cn('hdr', ancorata && 'is-stuck')}>
      <div className="wrap">
        <Marchio altezza={100} />

        <nav className="nav" aria-label="Navigazione principale">
          {VOCI_NAVIGAZIONE.map((v) => (
            <NavLink key={v.percorso} to={v.percorso} className={({ isActive }) => (isActive ? 'is-active' : '')} end={v.percorso === '/'}>
              {v.etichetta}
            </NavLink>
          ))}
        </nav>

        <div className="hdr__tools">
          <button className="iconbtn" onClick={onApriRicerca} aria-label="Cerca nel sito" title="Cerca (Ctrl K)">
            <Icona nome="search" />
          </button>
          <button
            className="iconbtn"
            onClick={onCambiaTema}
            aria-label={tema === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
            title="Tema chiaro/scuro"
          >
            <Icona nome={tema === 'dark' ? 'sun' : 'moon'} />
          </button>
          <NavLink className="iconbtn hdr__user" to="/area-clienti" aria-label="Area clienti" title="Area clienti">
            <Icona nome="user" />
          </NavLink>
          <NavLink className="btn btn--sm" to="/preventivo">
            Richiedi preventivo
          </NavLink>
          <button className="iconbtn hdr__burger" onClick={onApriMenu} aria-label="Apri il menu" aria-expanded={false}>
            <Icona nome="menu" />
          </button>
        </div>
      </div>
      <div className="progress" style={{ width: `${avanzamento}%` }} aria-hidden="true" />
    </header>
  )
}
