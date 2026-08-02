'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { RISTORANTE } from '@/dati/ristorante'

const MESSAGGIO_WHATSAPP = encodeURIComponent(
  `Buongiorno, vorrei informazioni su una prenotazione da ${RISTORANTE.nomeCompleto}.`,
)

/**
 * Azioni sempre a portata di pollice: WhatsApp, chiamata diretta e ritorno a
 * inizio pagina.
 *
 * Su telefono i due contatti restano in basso a destra, dove il pollice arriva
 * senza spostare la mano; su schermi grandi si affiancano al bordo. Il pulsante
 * di risalita compare solo dopo che si è scorso davvero.
 */
export function AzioniFisse() {
  const [mostraRisalita, setMostraRisalita] = useState(false)
  const menoMovimento = useReducedMotion()

  useEffect(() => {
    const aggiorna = () => setMostraRisalita(window.scrollY > 900)
    aggiorna()
    window.addEventListener('scroll', aggiorna, { passive: true })
    return () => window.removeEventListener('scroll', aggiorna)
  }, [])

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-center gap-3 sm:right-6 sm:bottom-6 no-stampa">
      <AnimatePresence>
        {mostraRisalita && (
          <motion.button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: menoMovimento ? 'auto' : 'smooth' })}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            aria-label="Torna a inizio pagina"
            className="inline-flex size-11 items-center justify-center rounded-full border border-bordo bg-superficie text-testo shadow-morbida transition-colors hover:border-accento hover:text-accento"
          >
            <Icona nome="frecciaSu" className="size-[1.05rem]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chiamata diretta: solo su telefono, dove ha davvero senso. */}
      <a
        href={`tel:${RISTORANTE.telefonoLink}`}
        aria-label={`Chiama ${RISTORANTE.nomeCompleto} al ${RISTORANTE.telefono}`}
        className="inline-flex size-12 items-center justify-center rounded-full border border-bordo bg-superficie text-testo shadow-morbida transition-all duration-300 hover:-translate-y-0.5 hover:border-accento hover:text-accento sm:hidden"
      >
        <Icona nome="telefono" className="size-5" />
      </a>

      <a
        href={`https://wa.me/${RISTORANTE.whatsapp}?text=${MESSAGGIO_WHATSAPP}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Scrivici su WhatsApp"
        className="group relative inline-flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-rilievo transition-transform duration-300 hover:-translate-y-0.5"
      >
        {/* Alone pulsante: fermo per chi ha ridotto le animazioni. */}
        <span
          className="absolute inset-0 rounded-full bg-[#25d366] opacity-40 motion-safe:animate-ping"
          aria-hidden
        />
        <Icona nome="whatsapp" className="relative size-7" />
      </a>
    </div>
  )
}
