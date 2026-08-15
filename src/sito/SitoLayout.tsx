import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import './sito.css'
import { Chat } from './componenti/Chat'
import { Icona, SpriteIcone } from './componenti/Icona'
import { SpriteIllustrazioni } from './componenti/Illustrazione'
import { ProviderNotifiche, useNotifica } from './componenti/Notifiche'
import { BannerCookie, MenuMobile, Ricerca, type Consenso } from './componenti/Pannelli'
import { PiePagina } from './componenti/PiePagina'
import { Testata } from './componenti/Testata'
import { WHATSAPP } from './dati/azienda'
import { animazioniRidotte, useMemoria } from './lib/hook'
import { cambiaPagina, impostaMisure } from './lib/misure'
import { cn } from './lib/utili'

function Contenuto() {
  const posizione = useLocation()
  const notifica = useNotifica()

  const [tema, setTema] = useMemoria('ioriparo_theme', '')
  const [consenso, setConsenso] = useMemoria('ioriparo_consent', '')
  const [temaSistema] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
  )
  const temaAttivo = tema || temaSistema
  const [menu, setMenu] = useState(false)
  const [ricerca, setRicerca] = useState(false)
  const [chat, setChat] = useState(false)
  const [cookie, setCookie] = useState(false)
  const [preferenze, setPreferenze] = useState(false)
  const [inAlto, setInAlto] = useState(true)
  const primaVisita = useRef(true)

  /* Tema: preferenza salvata, altrimenti quella del sistema. */
  useEffect(() => {
    document.documentElement.dataset.theme = temaAttivo
    document.documentElement.style.colorScheme = temaAttivo
  }, [temaAttivo])

  /* Gli stili del sito valgono solo qui: il gestionale mantiene il suo tema. */
  useEffect(() => {
    document.body.dataset.sito = 'true'
    return () => {
      delete document.body.dataset.sito
      delete document.documentElement.dataset.theme
      document.documentElement.style.colorScheme = ''
    }
  }, [])

  /* Misure di visita: si accendono e si spengono seguendo il consenso. */
  useEffect(() => {
    impostaMisure(consenso)
  }, [consenso])

  /* Ogni cambio di pagina chiude quella precedente e ne apre una nuova. */
  useEffect(() => {
    cambiaPagina(posizione.pathname)
  }, [posizione.pathname])

  /* Banner cookie alla prima visita. */
  useEffect(() => {
    if (consenso) return
    const t = setTimeout(() => setCookie(true), 1400)
    return () => clearTimeout(t)
  }, [consenso])

  /* Scorciatoia da tastiera per la ricerca. */
  useEffect(() => {
    const tasti = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setRicerca(true)
      }
    }
    document.addEventListener('keydown', tasti)
    return () => document.removeEventListener('keydown', tasti)
  }, [])

  /* Ogni cambio pagina riporta in cima e chiude i pannelli aperti. */
  useEffect(() => {
    setMenu(false)
    setRicerca(false)
    if (primaVisita.current) {
      primaVisita.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: animazioniRidotte() ? 'auto' : 'smooth' })
  }, [posizione.pathname, posizione.search])

  useEffect(() => {
    const misura = () => setInAlto(window.scrollY < 500)
    misura()
    window.addEventListener('scroll', misura, { passive: true })
    return () => window.removeEventListener('scroll', misura)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
  }, [menu])

  const salvaConsenso = useCallback(
    (scelta: Consenso) => {
      setConsenso(scelta)
      setCookie(false)
      setPreferenze(false)
      notifica(`Preferenze cookie salvate: ${scelta}.`)
    },
    [notifica, setConsenso],
  )

  const apriPreferenze = useCallback(() => {
    setPreferenze(true)
    setCookie(true)
  }, [])

  const chiudiTutto = useCallback(() => {
    setMenu(false)
    setRicerca(false)
  }, [])

  return (
    <>
      <a className="skip" href="#contenuto">
        Vai al contenuto
      </a>
      <SpriteIcone />
      <SpriteIllustrazioni />

      <div id="app">
        <Testata
          tema={temaAttivo}
          onCambiaTema={() => setTema(temaAttivo === 'dark' ? 'light' : 'dark')}
          onApriRicerca={() => setRicerca(true)}
          onApriMenu={() => setMenu(true)}
        />

        <main id="contenuto">
          <Outlet />
        </main>

        <PiePagina onPreferenzeCookie={apriPreferenze} />

        <div className="fabs">
          <div className="fabs__in">
            <button
              className={cn('fab', 'fab--top', !inAlto && 'is-on')}
              onClick={() => window.scrollTo({ top: 0, behavior: animazioniRidotte() ? 'auto' : 'smooth' })}
              aria-label="Torna su"
            >
              <Icona nome="up" dimensione={19} />
            </button>
            <button className="fab fab--chat" onClick={() => setChat((c) => !c)} aria-label="Apri la chat">
              <Icona nome="chat" dimensione={25} />
            </button>
            <a
              className="fab fab--wa"
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Scrivici su WhatsApp"
            >
              <Icona nome="wa" dimensione={25} pieno />
            </a>
          </div>
        </div>
      </div>

      <div id="layers">
        <div className={cn('scrim', (menu || ricerca) && 'is-on')} onClick={chiudiTutto} />
        <MenuMobile aperto={menu} onChiudi={() => setMenu(false)} />
        <Ricerca aperta={ricerca} onChiudi={() => setRicerca(false)} />
        <Chat aperta={chat} onChiudi={() => setChat(false)} />
        <BannerCookie visibile={cookie} onSalva={salvaConsenso} apertoDaPreferenze={preferenze} />
      </div>
    </>
  )
}

/** Struttura comune a tutte le pagine pubbliche del sito. */
export function SitoLayout() {
  return (
    <ProviderNotifiche>
      <Contenuto />
    </ProviderNotifiche>
  )
}
