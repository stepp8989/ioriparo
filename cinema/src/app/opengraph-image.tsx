import { ImageResponse } from 'next/og'
import { leggi } from '@/lib/archivio'

/**
 * Immagine di condivisione.
 *
 * Viene disegnata da Next invece di essere un file: così porta il nome e i
 * colori impostati nel pannello, e chi rinomina la rete non deve rifare
 * un'immagine in un programma di grafica.
 *
 * Il formato è PNG e non SVG: molte piattaforme di messaggistica non
 * visualizzano le anteprime vettoriali, e un'immagine di condivisione che su
 * WhatsApp non compare tanto vale non averla.
 */

export const alt = 'CINEMAX'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Immagine() {
  const { impostazioni } = await leggi()
  const { marchio } = impostazioni

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: `linear-gradient(135deg, #07060c 0%, ${marchio.colore}33 55%, ${marchio.coloreAlt}44 100%)`,
          color: '#f4f1fa',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 10,
            textTransform: 'uppercase',
            color: marchio.colore,
            fontWeight: 700,
          }}
        >
          {marchio.nome}
        </div>

        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1, marginTop: 28 }}>
          {marchio.claim}
        </div>

        <div
          style={{
            fontSize: 30,
            marginTop: 28,
            color: '#9d95b5',
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          {marchio.descrizione}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            gap: 16,
            fontSize: 24,
            color: '#9d95b5',
          }}
        >
          <span>Biglietti</span>
          <span>·</span>
          <span>Orari</span>
          <span>·</span>
          <span>Abbonamenti</span>
          <span>·</span>
          <span>Gift card</span>
        </div>
      </div>
    ),
    size,
  )
}
