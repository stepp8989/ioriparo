import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useInstallazione } from '@/lib/app'
import { useMemoria } from '../lib/hook'
import { segnaAzione } from '../lib/misure'
import { Icona } from './Icona'
import { Bottone } from './base'
import { useNotifica } from './Notifiche'

/**
 * Istruzioni per iPhone, dove nessun sito può installarsi da solo: Apple non
 * offre un pulsante da premere per conto del cliente.
 *
 * Da iOS 26 Safari ha nascosto Condividi dentro il menu `≡` della barra in
 * basso; sulle versioni precedenti è l'icona con la freccia in su. Il testo
 * nomina entrambi, perché non sappiamo quale Safari ha in mano il cliente.
 */
const ISTRUZIONI_IOS =
  'Tocca ≡ nella barra di Safari (oppure l’icona Condividi ⬆︎), poi «Condividi» e «Aggiungi alla schermata Home».'

/**
 * Riquadro «Installa l'app», da mettere dove serve davvero: sulla tessera e
 * dopo aver trovato la propria pratica. Sparisce da solo dove l'installazione
 * non è possibile o è già fatta.
 */
export function RiquadroApp({ testo }: { testo: string }) {
  const { modo, installa } = useInstallazione()
  const notifica = useNotifica()
  if (modo === 'installata' || modo === 'nessuno') return null

  return (
    <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <img src="/marchio/icona-96.png" alt="" width={48} height={48} style={{ borderRadius: 12 }} />
      <div style={{ flex: 1, minWidth: 200 }}>
        <b>Io Riparo sul tuo telefono</b>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: 3 }}>
          {modo === 'ios' ? `${testo} ${ISTRUZIONI_IOS}` : testo}
        </p>
      </div>
      {modo === 'pulsante' && (
        <Bottone
          piccolo
          onClick={async () => {
            if (await installa()) {
              segnaAzione('app')
              notifica('App installata: la trovi fra le altre app del telefono.')
            }
          }}
        >
          Installa l’app
        </Bottone>
      )}
    </div>
  )
}

/** Giorni di silenzio dopo che il visitatore ha detto «no grazie». */
const PAUSA_GIORNI = 30

/**
 * Invito a comparsa in fondo allo schermo.
 *
 * Non alla prima pagina: chi è appena arrivato non sa ancora chi siamo. Dalla
 * terza pagina in poi il visitatore è interessato, e l'invito ha senso. Chi lo
 * chiude non lo rivede per un mese.
 */
export function InvitoApp() {
  const { modo, installa } = useInstallazione()
  const posizione = useLocation()
  const [chiuso, setChiuso] = useMemoria('ioriparo_app_chiuso', '')
  const [pagine, setPagine] = useState(0)

  useEffect(() => {
    setPagine((n) => n + 1)
  }, [posizione.pathname])

  const inPausa = chiuso !== '' && Date.now() - Number(chiuso) < PAUSA_GIORNI * 86_400_000
  const visibile = (modo === 'pulsante' || modo === 'ios') && pagine >= 3 && !inPausa
  if (!visibile) return null

  const chiudi = () => setChiuso(String(Date.now()))

  return (
    <div className="app-invito" role="dialog" aria-label="Installa l’app Io Riparo">
      <img src="/marchio/icona-96.png" alt="" />
      <div>
        <b>Installa l’app Io Riparo</b>
        <p>
          {modo === 'ios'
            ? ISTRUZIONI_IOS
            : 'Stato riparazione, tessera punti e prenotazioni a un tocco. Gratis, senza App Store.'}
        </p>
      </div>
      {modo === 'pulsante' && (
        <Bottone
          piccolo
          onClick={async () => {
            if (await installa()) segnaAzione('app')
            chiudi()
          }}
        >
          Installa
        </Bottone>
      )}
      <button className="iconbtn" onClick={chiudi} aria-label="Non ora">
        <Icona nome="x" dimensione={18} />
      </button>
    </div>
  )
}
