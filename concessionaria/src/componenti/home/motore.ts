/**
 * Rumore di motore sintetizzato.
 *
 * L'apertura del sito ha bisogno di un motore che si avvicina. Un file audio
 * costerebbe qualche centinaio di chilobyte scaricati da chiunque apra la home,
 * e il primo caricamento è esattamente il momento in cui non si possono
 * spendere. Qui il suono si costruisce con la Web Audio API: tre oscillatori e
 * un soffio d'aria filtrati insieme, zero byte di rete.
 *
 * Il timbro nasce da tre voci sovrapposte:
 *  - due denti di sega quasi accordate, che battendo fra loro danno
 *    l'irregolarità dello scoppio (una sola suonerebbe come una sirena);
 *  - un'onda quadra un'ottava sotto, che dà il corpo basso;
 *  - un fruscio filtrato, che è l'aria spostata dalla vettura.
 *
 * Il passa-basso che li raccoglie è la vera manopola: aprendolo mentre l'auto
 * si avvicina il motore passa da cupo e lontano a pieno e vicino, che è come lo
 * sente l'orecchio nella realtà.
 */

/** Comandi disponibili sul motore acceso. */
export type Motore = {
  /** Porta il motore al minimo. Va chiamata dopo un gesto dell'utente. */
  avvia: () => Promise<boolean>
  /** Sale di giri nell'arco di `secondi`: usata durante l'avvicinamento. */
  accelera: (secondi: number) => void
  /** Colpo di gas breve, sincronizzato con l'accensione degli abbaglianti. */
  sgassata: () => void
  /** Sfuma il suono e libera la scheda audio. */
  spegni: () => void
}

/** Giri al minimo e a pieno gas, espressi come frequenza della fondamentale. */
const MINIMO = 38
const MASSIMO = 132

export function creaMotore(): Motore | null {
  const Costruttore =
    typeof window === 'undefined'
      ? undefined
      : (window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)

  if (!Costruttore) return null

  let contesto: AudioContext
  try {
    contesto = new Costruttore()
  } catch {
    // Alcuni browser rifiutano di costruire il contesto quando la scheda audio
    // non è disponibile: l'apertura resta muta, il resto funziona.
    return null
  }

  const uscita = contesto.createGain()
  uscita.gain.value = 0
  uscita.connect(contesto.destination)

  // La manopola del timbro: cupo quando l'auto è lontana, aperto quando arriva.
  const filtro = contesto.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.value = 240
  filtro.Q.value = 4
  filtro.connect(uscita)

  const primaria = contesto.createOscillator()
  primaria.type = 'sawtooth'
  primaria.frequency.value = MINIMO

  // Scordata di poco: il battito fra le due è l'irregolarità dello scoppio.
  const secondaria = contesto.createOscillator()
  secondaria.type = 'sawtooth'
  secondaria.frequency.value = MINIMO * 1.007

  const bassi = contesto.createOscillator()
  bassi.type = 'square'
  bassi.frequency.value = MINIMO / 2

  const volumeBassi = contesto.createGain()
  volumeBassi.gain.value = 0.32

  primaria.connect(filtro)
  secondaria.connect(filtro)
  bassi.connect(volumeBassi)
  volumeBassi.connect(filtro)

  // Fruscio: due secondi di rumore bianco in ciclo, ripuliti dalle frequenze
  // acute che suonerebbero come una radio fuori sintonia.
  const campioni = contesto.sampleRate * 2
  const memoria = contesto.createBuffer(1, campioni, contesto.sampleRate)
  const traccia = memoria.getChannelData(0)
  for (let indice = 0; indice < campioni; indice += 1) {
    traccia[indice] = Math.random() * 2 - 1
  }

  const aria = contesto.createBufferSource()
  aria.buffer = memoria
  aria.loop = true

  const filtroAria = contesto.createBiquadFilter()
  filtroAria.type = 'bandpass'
  filtroAria.frequency.value = 620
  filtroAria.Q.value = 0.7

  const volumeAria = contesto.createGain()
  volumeAria.gain.value = 0.16

  aria.connect(filtroAria)
  filtroAria.connect(volumeAria)
  volumeAria.connect(uscita)

  let acceso = false
  let spento = false

  function frequenze(valore: number, quando: number, durata: number) {
    primaria.frequency.linearRampToValueAtTime(valore, quando + durata)
    secondaria.frequency.linearRampToValueAtTime(valore * 1.007, quando + durata)
    bassi.frequency.linearRampToValueAtTime(valore / 2, quando + durata)
  }

  return {
    async avvia() {
      if (spento) return false

      // Senza un gesto dell'utente il browser tiene il contesto sospeso: non è
      // un errore, è la regola contro i siti che partono a tutto volume. Chi
      // chiama deve saperlo per poter offrire il pulsante «attiva audio».
      if (contesto.state === 'suspended') {
        try {
          await contesto.resume()
        } catch {
          return false
        }
      }

      if (contesto.state !== 'running') return false

      if (!acceso) {
        acceso = true
        primaria.start()
        secondaria.start()
        bassi.start()
        aria.start()
      }

      const adesso = contesto.currentTime
      uscita.gain.cancelScheduledValues(adesso)
      uscita.gain.setValueAtTime(uscita.gain.value, adesso)
      uscita.gain.linearRampToValueAtTime(0.055, adesso + 0.9)

      return true
    },

    accelera(secondi) {
      if (!acceso || spento) return

      const adesso = contesto.currentTime
      frequenze(MASSIMO, adesso, secondi)

      // Il filtro si apre più dell'orecchio: è quello che fa «arrivare» l'auto.
      filtro.frequency.cancelScheduledValues(adesso)
      filtro.frequency.setValueAtTime(filtro.frequency.value, adesso)
      filtro.frequency.exponentialRampToValueAtTime(2600, adesso + secondi)

      uscita.gain.linearRampToValueAtTime(0.16, adesso + secondi)
      volumeAria.gain.linearRampToValueAtTime(0.3, adesso + secondi)
    },

    sgassata() {
      if (!acceso || spento) return

      const adesso = contesto.currentTime
      frequenze(MASSIMO * 1.45, adesso, 0.18)
      frequenze(MASSIMO, adesso + 0.18, 0.5)

      uscita.gain.cancelScheduledValues(adesso)
      uscita.gain.setValueAtTime(uscita.gain.value, adesso)
      uscita.gain.linearRampToValueAtTime(0.22, adesso + 0.18)
      uscita.gain.linearRampToValueAtTime(0.15, adesso + 0.7)
    },

    spegni() {
      if (spento) return
      spento = true

      const adesso = contesto.currentTime

      if (acceso) {
        uscita.gain.cancelScheduledValues(adesso)
        uscita.gain.setValueAtTime(uscita.gain.value, adesso)
        uscita.gain.linearRampToValueAtTime(0, adesso + 0.7)
        primaria.stop(adesso + 0.8)
        secondaria.stop(adesso + 0.8)
        bassi.stop(adesso + 0.8)
        aria.stop(adesso + 0.8)
      }

      // La chiusura del contesto libera la scheda audio: senza, una visita
      // lunga lascerebbe aperti tanti contesti quante sono le aperture viste.
      window.setTimeout(() => void contesto.close().catch(() => {}), 900)
    },
  }
}
