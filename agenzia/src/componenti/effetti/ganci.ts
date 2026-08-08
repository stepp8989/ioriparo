'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Ganci di animazione
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tutto il movimento del sito passa da qui, e tutto segue tre regole:
 *
 *  1. Un solo osservatore e un solo ciclo di disegno condivisi da tutta la
 *     pagina. Decine di `IntersectionObserver` e di listener di scorrimento
 *     separati sono il modo più semplice per rendere lento un sito animato.
 *  2. Chi ha chiesto meno movimento al sistema operativo lo ottiene davvero:
 *     i cicli non partono nemmeno e il contenuto è già al suo posto.
 *  3. Durante lo scorrimento si scrive nel DOM, non nello stato di React: un
 *     `setState` per fotogramma farebbe ricalcolare l'albero sessanta volte al
 *     secondo. Lo stato si muove solo quando cambia qualcosa di discreto — la
 *     tappa attiva, la voce di menu evidenziata.
 */

/* ── Preferenza di movimento ───────────────────────────────────────────────── */

/**
 * Vero quando il sistema ha chiesto animazioni ridotte.
 *
 * Parte da `false` anche per chi ha la preferenza attiva, perché sul server la
 * preferenza non è conoscibile e un valore diverso fra server e browser
 * romperebbe l'idratazione. Il primo effetto sistema il valore prima che
 * qualsiasi ciclo abbia il tempo di partire.
 */
export function useMovimentoRidotto(): boolean {
  const [ridotto, setRidotto] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setRidotto(query.matches)

    const aggiorna = () => setRidotto(query.matches)
    query.addEventListener('change', aggiorna)
    return () => query.removeEventListener('change', aggiorna)
  }, [])

  return ridotto
}

/** Vero dove esiste un puntatore fine: mouse o trackpad, non un dito. */
export function usePuntatoreFine(): boolean {
  const [fine, setFine] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)')
    setFine(query.matches)

    const aggiorna = () => setFine(query.matches)
    query.addEventListener('change', aggiorna)
    return () => query.removeEventListener('change', aggiorna)
  }, [])

  return fine
}

/* ── Comparse allo scorrimento ─────────────────────────────────────────────── */

let osservatore: IntersectionObserver | null = null

function osservatoreCondiviso(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null

  osservatore ??= new IntersectionObserver(
    (voci) => {
      for (const voce of voci) {
        if (!voce.isIntersecting) continue
        voce.target.classList.add('visibile')
        // Una comparsa sola: chi è già entrato non deve più essere seguito.
        osservatore?.unobserve(voce.target)
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
  )

  return osservatore
}

/**
 * Aggiunge `visibile` all'elemento la prima volta che entra nello schermo.
 * Il movimento vero e proprio sta in CSS, nelle classi `rivela-*`.
 */
export function useRivela<T extends HTMLElement>(): RefObject<T | null> {
  const riferimento = useRef<T>(null)

  useEffect(() => {
    const elemento = riferimento.current
    if (!elemento) return

    const attuale = osservatoreCondiviso()
    // Senza osservatore (browser molto vecchi) il contenuto si mostra e basta.
    if (!attuale) {
      elemento.classList.add('visibile')
      return
    }

    attuale.observe(elemento)
    return () => attuale.unobserve(elemento)
  }, [])

  return riferimento
}

/**
 * Vero quando l'elemento è entrato nello schermo almeno una volta.
 * Serve a far partire ciò che ha bisogno di stato: contatori, sequenze.
 */
export function useInVista<T extends HTMLElement>(
  soglia = 0.3,
): [RefObject<T | null>, boolean] {
  const riferimento = useRef<T>(null)
  const [entrato, setEntrato] = useState(false)

  useEffect(() => {
    const elemento = riferimento.current
    if (!elemento || typeof IntersectionObserver === 'undefined') {
      setEntrato(true)
      return
    }

    const proprio = new IntersectionObserver(
      ([voce]) => {
        if (!voce.isIntersecting) return
        setEntrato(true)
        proprio.disconnect()
      },
      { threshold: soglia },
    )

    proprio.observe(elemento)
    return () => proprio.disconnect()
  }, [soglia])

  return [riferimento, entrato]
}

/* ── Ciclo di scorrimento condiviso ────────────────────────────────────────── */

/**
 * Un iscritto al ciclo: prima si misura, poi si applica.
 *
 * La separazione fra le due fasi non è pignoleria. Misurare significa leggere
 * la posizione di un elemento, e applicare significa scrivere uno stile: se le
 * due cose si alternano — leggo, scrivo, leggo, scrivo — ogni lettura obbliga
 * il browser a rifare i conti del layout appena invalidato dalla scrittura
 * precedente. Con una decina di iscritti sono dieci ricalcoli per fotogramma,
 * ed è il modo classico di rendere lento uno scorrimento che sulla carta non
 * fa quasi niente.
 *
 * Il ciclo qui sotto legge tutto prima e scrive tutto dopo: un ricalcolo per
 * fotogramma, indipendentemente da quanti elementi stiano seguendo la pagina.
 */
type Iscritto = {
  misura: () => Avanzamento
  applica: (avanzamento: Avanzamento) => void
}

const ascoltatori = new Set<Iscritto>()
let inCoda = false

function passata() {
  inCoda = false

  // Prima fase: solo letture.
  const misure: [Iscritto, Avanzamento][] = []
  for (const iscritto of ascoltatori) misure.push([iscritto, iscritto.misura()])

  // Seconda fase: solo scritture.
  for (const [iscritto, avanzamento] of misure) iscritto.applica(avanzamento)
}

function programma() {
  if (inCoda) return
  inCoda = true
  requestAnimationFrame(passata)
}

function iscrivi(iscritto: Iscritto): () => void {
  const primo = ascoltatori.size === 0
  ascoltatori.add(iscritto)

  if (primo) {
    window.addEventListener('scroll', programma, { passive: true })
    window.addEventListener('resize', programma, { passive: true })
  }

  // Una prima misura subito, per non partire da una posizione sbagliata.
  iscritto.applica(iscritto.misura())

  return () => {
    ascoltatori.delete(iscritto)
    if (ascoltatori.size === 0) {
      window.removeEventListener('scroll', programma)
      window.removeEventListener('resize', programma)
    }
  }
}

/** Quanto è avanzato lo scorrimento rispetto a un elemento. */
export type Avanzamento = {
  /**
   * Attraversamento: 0 quando l'elemento entra dal basso, 1 quando esce in
   * alto. È la misura giusta per il parallasse.
   */
  passaggio: number
  /**
   * Percorso interno: 0 quando l'elemento appoggia in cima allo schermo, 1
   * quando è stato percorso tutto. È la misura giusta per le sezioni alte con
   * il contenuto fissato (`position: sticky`).
   */
  percorso: number
  /**
   * Uscita dall'alto: 0 finché l'elemento non ha cominciato a scorrere via, 1
   * quando è uscito del tutto. È la misura giusta per la prima schermata, che
   * a pagina ferma è già a metà del proprio attraversamento e con `passaggio`
   * risulterebbe mezza dissolta ancora prima che qualcuno tocchi la rotella.
   */
  uscita: number
}

/**
 * Segue un elemento durante lo scorrimento e chiama `quando` a ogni
 * fotogramma utile, con i tre avanzamenti già calcolati.
 *
 * Il callback viene eseguito nella fase di scrittura del ciclo condiviso:
 * deve limitarsi a impostare stili o variabili CSS. Se legge una posizione
 * (`getBoundingClientRect`, `offsetTop`, `scrollHeight`) rimette il browser
 * esattamente nella situazione che il ciclo a due fasi serve a evitare.
 */
export function useScorrimento<T extends HTMLElement>(
  riferimento: RefObject<T | null>,
  quando: (avanzamento: Avanzamento) => void,
  attivo = true,
) {
  // Il callback cambia a ogni render: tenerlo in un riferimento evita di
  // riagganciare gli ascoltatori sessanta volte al secondo.
  const ultimo = useRef(quando)
  ultimo.current = quando

  useEffect(() => {
    const elemento = riferimento.current
    if (!elemento || !attivo) return

    return iscrivi({
      misura() {
        const misura = elemento.getBoundingClientRect()
        const altezzaSchermo = window.innerHeight || 1

        const passaggio = limita(
          (altezzaSchermo - misura.top) / (altezzaSchermo + misura.height),
          0,
          1,
        )

        const percorribile = misura.height - altezzaSchermo
        const percorso = percorribile > 0 ? limita(-misura.top / percorribile, 0, 1) : passaggio

        const uscita = limita(-misura.top / Math.max(misura.height, 1), 0, 1)

        return { passaggio, percorso, uscita }
      },
      applica(avanzamento) {
        ultimo.current(avanzamento)
      },
    })
  }, [riferimento, attivo])
}

/* ── Inclinazione sotto il puntatore ───────────────────────────────────────── */

/**
 * Fa inclinare un elemento seguendo il puntatore, in tre dimensioni.
 *
 * Scrive due variabili CSS — `--incl-x` e `--incl-y`, in gradi — e lascia al
 * foglio di stile decidere cosa farne: così lo stesso gancio serve a una carta
 * che ruota, a un riflesso che si sposta e a un'ombra che segue la luce.
 * Su schermi tattili non si aggancia nulla.
 */
export function useInclinazione<T extends HTMLElement>(intensita = 10) {
  const riferimento = useRef<T>(null)
  const puntatoreFine = usePuntatoreFine()
  const ridotto = useMovimentoRidotto()

  useEffect(() => {
    const elemento = riferimento.current
    if (!elemento || !puntatoreFine || ridotto) return

    let inCodaLocale = false
    let ultimoEvento: PointerEvent | null = null

    const applica = () => {
      inCodaLocale = false
      if (!ultimoEvento) return

      const misura = elemento.getBoundingClientRect()
      const x = (ultimoEvento.clientX - misura.left) / misura.width - 0.5
      const y = (ultimoEvento.clientY - misura.top) / misura.height - 0.5

      elemento.style.setProperty('--incl-x', `${(-y * intensita).toFixed(2)}deg`)
      elemento.style.setProperty('--incl-y', `${(x * intensita).toFixed(2)}deg`)
      elemento.style.setProperty('--luce-x', `${((x + 0.5) * 100).toFixed(1)}%`)
      elemento.style.setProperty('--luce-y', `${((y + 0.5) * 100).toFixed(1)}%`)
    }

    const muovi = (evento: PointerEvent) => {
      ultimoEvento = evento
      if (inCodaLocale) return
      inCodaLocale = true
      requestAnimationFrame(applica)
    }

    const esci = () => {
      ultimoEvento = null
      elemento.style.setProperty('--incl-x', '0deg')
      elemento.style.setProperty('--incl-y', '0deg')
    }

    elemento.addEventListener('pointermove', muovi)
    elemento.addEventListener('pointerleave', esci)
    return () => {
      elemento.removeEventListener('pointermove', muovi)
      elemento.removeEventListener('pointerleave', esci)
    }
  }, [intensita, puntatoreFine, ridotto])

  return riferimento
}

/* ── Utilità ───────────────────────────────────────────────────────────────── */

/** Costringe un numero dentro un intervallo. */
export function limita(valore: number, minimo: number, massimo: number): number {
  return Math.min(Math.max(valore, minimo), massimo)
}

/** Interpolazione lineare, usata dai movimenti che inseguono con ritardo. */
export function fra(da: number, a: number, quota: number): number {
  return da + (a - da) * quota
}
