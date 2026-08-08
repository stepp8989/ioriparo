import { ImageResponse } from 'next/og'
import { AGENZIA } from '@/dati/agenzia'

/**
 * L'immagine che compare quando qualcuno condivide il sito.
 *
 * Viene disegnata in fase di compilazione a partire dagli stessi dati del
 * marchio: cambiando il nome nello scheda dell'agenzia cambia anche qui, e non
 * resta in giro un file grafico da rifare a mano ogni volta.
 */
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${AGENZIA.nomeCompleto} — ${AGENZIA.motto}`

export default function Immagine() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          background: '#04060d',
          backgroundImage:
            'radial-gradient(circle at 78% 22%, rgba(139,92,246,.5), transparent 46%), radial-gradient(circle at 18% 82%, rgba(59,130,246,.42), transparent 48%)',
          color: '#eef2ff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#7fb2ff,#8b5cf6 60%,#22d3ee)',
              display: 'flex',
            }}
          />
          <div style={{ fontSize: 34, letterSpacing: '-0.02em', fontWeight: 600 }}>
            {AGENZIA.nomeCompleto}
          </div>
        </div>

        <div
          style={{
            marginTop: 54,
            fontSize: 86,
            lineHeight: 1.02,
            fontWeight: 700,
            letterSpacing: '-0.035em',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>Il tuo sito.</span>
          <span>La tua immagine.</span>
          <span
            style={{
              backgroundImage: 'linear-gradient(100deg,#7fb2ff,#b79dff 55%,#22d3ee)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Il tuo successo.
          </span>
        </div>

        <div style={{ marginTop: 46, fontSize: 28, color: '#93a0c0' }}>{AGENZIA.motto}</div>
      </div>
    ),
    size,
  )
}
