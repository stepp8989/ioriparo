'use client'

import { useEffect, useState } from 'react'
import { ChatDiretta } from '@/componenti/comuni/ChatDiretta'
import { Icona } from '@/componenti/ui/Icona'
import { AZIENDA, linkWhatsApp } from '@/dati/azienda'
import { classi } from '@/lib/utili'

/**
 * Azioni sempre a portata di pollice: telefono, WhatsApp, chat e ritorno in
 * cima.
 *
 * Restano in basso a destra su ogni pagina, sopra il contenuto ma sotto il
 * banner cookie. Il ritorno in cima compare solo dopo che si è scorso
 * abbastanza da averne bisogno.
 */
export function AzioniFisse() {
  const [inAlto, setInAlto] = useState(true)

  useEffect(() => {
    const aggiorna = () => setInAlto(window.scrollY < 700)
    aggiorna()
    window.addEventListener('scroll', aggiorna, { passive: true })
    return () => window.removeEventListener('scroll', aggiorna)
  }, [])

  return (
    <div className="no-stampa fixed right-4 bottom-4 z-[65] flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Torna in cima"
        className={classi(
          'vetro inline-flex size-11 items-center justify-center rounded-full text-testo shadow-morbida transition-all duration-400 hover:text-accento',
          inAlto ? 'pointer-events-none translate-y-3 opacity-0' : 'opacity-100',
        )}
      >
        <Icona nome="frecciaSu" className="size-[1.05rem]" />
      </button>

      <a
        href={`tel:${AZIENDA.telefonoLink}`}
        aria-label={`Telefona al ${AZIENDA.telefono}`}
        className="vetro inline-flex size-11 items-center justify-center rounded-full text-testo shadow-morbida transition-colors duration-300 hover:text-accento sm:hidden"
      >
        <Icona nome="telefono" className="size-[1.05rem]" />
      </a>

      <a
        href={linkWhatsApp('Buongiorno, ho visto il sito e vorrei un’informazione.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Scrivici su WhatsApp"
        className="inline-flex size-13 items-center justify-center rounded-full bg-[#25d366] text-white shadow-rilievo transition-transform duration-300 hover:-translate-y-0.5"
        style={{ width: '3.25rem', height: '3.25rem' }}
      >
        <Icona nome="whatsapp" className="size-6" />
      </a>

      <ChatDiretta />
    </div>
  )
}
