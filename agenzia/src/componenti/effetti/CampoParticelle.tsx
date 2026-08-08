'use client'

import { useEffect, useRef } from 'react'
import { useMovimentoRidotto } from '@/componenti/effetti/ganci'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Campo particellare di fondo
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Una rete di punti luminosi che si muovono piano e si collegano fra loro
 * quando si avvicinano, con il puntatore che apre un varco intorno a sé. Sta
 * dietro a tutta la pagina, in un unico `canvas`: un elemento solo, un ciclo
 * di disegno solo.
 *
 * Le scelte che tengono in piedi la velocità:
 *
 *  * la densità dipende dall'area dello schermo, con un tetto — su un telefono
 *    una ventina di punti bastano, su un monitor grande non se ne disegnano mai
 *    più di centodieci;
 *  * la risoluzione è limitata a 1,5 volte quella logica sul computer e a una
 *    sul telefono: oltre non si vede differenza su punti sfocati, ma i pixel da
 *    riempire raddoppiano — e sul telefono quel raddoppio si sente;
 *  * sul telefono si disegna a trenta fotogrammi al secondo invece che a
 *    sessanta. Su un movimento così lento la differenza non si vede, e metà
 *    del lavoro se ne va;
 *  * il ciclo si ferma quando la scheda passa in secondo piano, e riparte al
 *    ritorno senza saltare in avanti;
 *  * chi ha chiesto meno movimento riceve un unico fotogramma immobile: la
 *    grafica c'è, il movimento no.
 *
 * Le tre misure insieme fanno la differenza fra uno scorrimento fluido e uno
 * a scatti su un telefono di fascia media, che è esattamente il dispositivo da
 * cui arriverà la maggior parte dei visitatori.
 */

type Punto = {
  x: number
  y: number
  /** Velocità, in pixel per fotogramma a 60 Hz. */
  vx: number
  vy: number
  raggio: number
  /** 0 = blu, 1 = viola: decide la tinta del punto. */
  tinta: number
}

/** Distanza entro cui due punti vengono collegati da una linea. */
const LEGAME = 132
/** Raggio d'influenza del puntatore. */
const INFLUENZA = 170

export function CampoParticelle() {
  const riferimento = useRef<HTMLCanvasElement>(null)
  const ridotto = useMovimentoRidotto()

  useEffect(() => {
    const tela = riferimento.current
    if (!tela) return

    const contesto = tela.getContext('2d', { alpha: true })
    if (!contesto) return

    let larghezza = 0
    let altezza = 0
    let punti: Punto[] = []
    let fotogramma = 0
    let ultimoIstante = 0

    /** Puntatore: fuori dallo schermo finché non si muove davvero. */
    const puntatore = { x: -9999, y: -9999, attivo: false }

    /** Schermo stretto: si tratta come un telefono. */
    let ristretto = window.innerWidth < 768

    function dimensiona() {
      larghezza = window.innerWidth
      altezza = window.innerHeight
      ristretto = larghezza < 768

      const scala = Math.min(window.devicePixelRatio || 1, ristretto ? 1 : 1.5)

      tela!.width = Math.floor(larghezza * scala)
      tela!.height = Math.floor(altezza * scala)
      tela!.style.width = `${larghezza}px`
      tela!.style.height = `${altezza}px`
      contesto!.setTransform(scala, 0, 0, scala, 0, 0)

      // Un punto ogni ~18.000 pixel quadrati (~26.000 sul telefono),
      // fra 18 e 110.
      const quanti = Math.round(
        Math.min(Math.max((larghezza * altezza) / (ristretto ? 26_000 : 18_000), 18), 110),
      )

      punti = Array.from({ length: quanti }, () => ({
        x: Math.random() * larghezza,
        y: Math.random() * altezza,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        raggio: Math.random() * 1.6 + 0.7,
        tinta: Math.random(),
      }))
    }

    function tinteggia(punto: Punto, opacita: number): string {
      // Blu elettrico verso viola, con qualche punto sul ciano.
      if (punto.tinta > 0.86) return `rgba(34, 211, 238, ${opacita})`
      return punto.tinta > 0.5
        ? `rgba(139, 92, 246, ${opacita})`
        : `rgba(96, 165, 250, ${opacita})`
    }

    function disegna() {
      contesto!.clearRect(0, 0, larghezza, altezza)

      // Prima le linee, così i punti restano sopra e più nitidi.
      for (let i = 0; i < punti.length; i++) {
        const a = punti[i]

        for (let j = i + 1; j < punti.length; j++) {
          const b = punti[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distanza2 = dx * dx + dy * dy
          if (distanza2 > LEGAME * LEGAME) continue

          const vicinanza = 1 - Math.sqrt(distanza2) / LEGAME
          contesto!.strokeStyle = `rgba(99, 132, 220, ${(vicinanza * 0.22).toFixed(3)})`
          contesto!.lineWidth = 1
          contesto!.beginPath()
          contesto!.moveTo(a.x, a.y)
          contesto!.lineTo(b.x, b.y)
          contesto!.stroke()
        }

        // Filo verso il puntatore: la rete sembra reagire alla mano.
        if (puntatore.attivo) {
          const dx = a.x - puntatore.x
          const dy = a.y - puntatore.y
          const distanza2 = dx * dx + dy * dy
          if (distanza2 < INFLUENZA * INFLUENZA) {
            const vicinanza = 1 - Math.sqrt(distanza2) / INFLUENZA
            contesto!.strokeStyle = `rgba(139, 92, 246, ${(vicinanza * 0.42).toFixed(3)})`
            contesto!.lineWidth = 1
            contesto!.beginPath()
            contesto!.moveTo(a.x, a.y)
            contesto!.lineTo(puntatore.x, puntatore.y)
            contesto!.stroke()
          }
        }
      }

      for (const punto of punti) {
        contesto!.fillStyle = tinteggia(punto, 0.75)
        contesto!.beginPath()
        contesto!.arc(punto.x, punto.y, punto.raggio, 0, Math.PI * 2)
        contesto!.fill()
      }
    }

    function muovi(passo: number) {
      for (const punto of punti) {
        punto.x += punto.vx * passo
        punto.y += punto.vy * passo

        // Il puntatore allontana i punti, senza mai catturarli.
        if (puntatore.attivo) {
          const dx = punto.x - puntatore.x
          const dy = punto.y - puntatore.y
          const distanza2 = dx * dx + dy * dy
          if (distanza2 < INFLUENZA * INFLUENZA && distanza2 > 1) {
            const distanza = Math.sqrt(distanza2)
            const spinta = ((INFLUENZA - distanza) / INFLUENZA) * 0.9
            punto.x += (dx / distanza) * spinta
            punto.y += (dy / distanza) * spinta
          }
        }

        // Bordi: si esce da un lato e si rientra dall'altro.
        if (punto.x < -20) punto.x = larghezza + 20
        else if (punto.x > larghezza + 20) punto.x = -20
        if (punto.y < -20) punto.y = altezza + 20
        else if (punto.y > altezza + 20) punto.y = -20
      }
    }

    function ciclo(istante: number) {
      fotogramma = requestAnimationFrame(ciclo)

      const trascorso = ultimoIstante ? istante - ultimoIstante : 16.67

      // Sul telefono si salta un fotogramma sì e uno no: trenta al secondo
      // sono più che sufficienti per un movimento così lento.
      if (ristretto && trascorso < 30) return

      // Passo normalizzato a 60 Hz: su schermi a 120 Hz il movimento non
      // raddoppia di velocità, e dopo una pausa non fa un salto in avanti.
      const passo = Math.min(trascorso / 16.67, 3)
      ultimoIstante = istante

      muovi(passo)
      disegna()
    }

    function seguiPuntatore(evento: PointerEvent) {
      // Solo mouse e trackpad: il dito sta già toccando il contenuto.
      if (evento.pointerType !== 'mouse') return
      puntatore.x = evento.clientX
      puntatore.y = evento.clientY
      puntatore.attivo = true
    }

    function abbandona() {
      puntatore.attivo = false
    }

    function visibilita() {
      if (document.hidden) {
        cancelAnimationFrame(fotogramma)
        fotogramma = 0
        ultimoIstante = 0
      } else if (!fotogramma && !ridotto) {
        fotogramma = requestAnimationFrame(ciclo)
      }
    }

    function ridimensiona() {
      dimensiona()
      if (ridotto) disegna()
    }

    dimensiona()

    if (ridotto) {
      // Un fotogramma solo: la rete si vede, ma sta ferma.
      disegna()
    } else {
      fotogramma = requestAnimationFrame(ciclo)
      window.addEventListener('pointermove', seguiPuntatore, { passive: true })
      window.addEventListener('pointerleave', abbandona)
      document.addEventListener('visibilitychange', visibilita)
    }

    window.addEventListener('resize', ridimensiona)

    return () => {
      cancelAnimationFrame(fotogramma)
      window.removeEventListener('resize', ridimensiona)
      window.removeEventListener('pointermove', seguiPuntatore)
      window.removeEventListener('pointerleave', abbandona)
      document.removeEventListener('visibilitychange', visibilita)
    }
  }, [ridotto])

  return (
    <canvas
      ref={riferimento}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-70"
    />
  )
}
