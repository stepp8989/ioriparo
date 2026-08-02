'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { RISTORANTE } from '@/dati/ristorante'

/**
 * Apertura a schermo intero.
 *
 * L'immagine è caricata con priorità e senza attesa (`priority`) perché è il
 * contenuto più grande della prima schermata: è lei a determinare il Largest
 * Contentful Paint. Il movimento in scorrimento agisce solo su `transform` e
 * `opacity`, così il browser non deve ricalcolare il layout mentre si scorre.
 *
 * Per usare un video al posto della fotografia basta sostituire `<Image>` con
 * un `<video autoPlay muted loop playsInline poster="...">`: il resto della
 * composizione — velo, titolo, pulsanti — resta invariato.
 */
export function Apertura() {
  const riferimento = useRef<HTMLElement>(null)
  const menoMovimento = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: riferimento,
    offset: ['start start', 'end start'],
  })

  // Parallasse discreta: lo sfondo scorre più lentamente del contenuto.
  const spostamentoSfondo = useTransform(scrollYProgress, [0, 1], ['0%', menoMovimento ? '0%' : '16%'])
  const opacitaContenuto = useTransform(scrollYProgress, [0, 0.7], [1, menoMovimento ? 1 : 0])

  const titolo = ['Il gusto', 'della', 'misura']

  return (
    <section
      ref={riferimento}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-notte"
      aria-labelledby="titolo-apertura"
    >
      {/* Fotografia di sfondo */}
      <motion.div className="absolute inset-0" style={{ y: spostamentoSfondo }}>
        <Image
          src="/immagini/ambienti/hero.jpg"
          alt="La sala di Aurea illuminata dalle lampade sospese"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={78}
          className="object-cover motion-safe:panoramica"
        />
      </motion.div>

      {/* Velo: porta il contrasto del testo bianco ben oltre il minimo richiesto */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-notte/55 via-notte/25 to-notte/85"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(12,10,8,0.15)_20%,rgba(12,10,8,0.68)_100%)]"
        aria-hidden
      />

      {/* Contenuto */}
      <motion.div
        className="contenitore relative z-10 pt-28 pb-24 text-center text-white"
        style={{ opacity: opacitaContenuto }}
      >
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-4 text-[0.68rem] font-medium uppercase tracking-[0.42em] text-accento-tenue"
        >
          <span className="filetto rotate-180" aria-hidden />
          {RISTORANTE.indirizzo.citta} · dal {RISTORANTE.fondato}
          <span className="filetto" aria-hidden />
        </motion.p>

        <h1
          id="titolo-apertura"
          className="mt-8 font-titolo text-[3.4rem] leading-[0.98] font-light sm:text-7xl lg:text-[6.5rem]"
        >
          {titolo.map((parola, indice) => (
            <motion.span
              key={parola}
              className="inline-block"
              initial={{ opacity: 0, y: menoMovimento ? 0 : 46, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: menoMovimento ? 0.01 : 1,
                delay: menoMovimento ? 0 : 0.3 + indice * 0.13,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {indice === 2 ? <em className="testo-oro not-italic">{parola}</em> : parola}
              {indice < titolo.length - 1 && ' '}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/75"
        >
          Cucina italiana contemporanea nel cuore di {RISTORANTE.indirizzo.citta}. Materie prime
          scelte una per una, tecnica classica, una sala che sa quando farsi da parte.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Bottone href="/prenota" misura="grande" className="w-full sm:w-auto">
            Prenota un tavolo
            <Icona nome="freccia" className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Bottone>

          <Bottone href="/menu" variante="chiaro" misura="grande" className="w-full sm:w-auto">
            Guarda il menù
          </Bottone>
        </motion.div>
      </motion.div>

      {/* Invito a scorrere */}
      <motion.a
        href="#chi-siamo"
        aria-label="Scorri alla sezione successiva"
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/55 transition-colors hover:text-white md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-[0.6rem] uppercase tracking-[0.3em]">Scopri</span>
        <motion.span
          animate={menoMovimento ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icona nome="frecciaGiu" className="size-5" />
        </motion.span>
      </motion.a>
    </section>
  )
}
