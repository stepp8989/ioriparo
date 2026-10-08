import 'server-only'
import { revalidatePath } from 'next/cache'
import { annota, leggi, modifica } from '@/lib/archivio'
import { corpoJson, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import type { Archivio } from '@/lib/tipi'

/**
 * Costruttore delle rotte di gestione.
 *
 * Quattordici collezioni con lo stesso ciclo di vita — elenco, creazione,
 * sostituzione, modifica parziale, eliminazione — significherebbero quattordici
 * file quasi identici, e quattordici occasioni di dimenticare il controllo di
 * autenticazione o la voce nel registro in uno solo di essi.
 *
 * Qui c'è la parte comune. Ogni collezione fornisce soltanto ciò che la
 * distingue davvero: come si costruisce una voce valida a partire dal corpo
 * della richiesta, e quali legami ne impediscono l'eliminazione.
 *
 * Tutte le operazioni sono riservate alla sessione di gestione: la maschera
 * all'ingresso non passa di qui.
 */

/** Collezioni gestibili: tutte tranne le impostazioni, che non sono un elenco. */
type CollezioneElenco = {
  [K in keyof Archivio]: Archivio[K] extends Array<{ id: string }> ? K : never
}[keyof Archivio]

type Voce<K extends CollezioneElenco> = Archivio[K][number]

export type EsitoCostruzione<T> = { ok: true; voce: T } | { ok: false; errore: string }

export type OpzioniCollezione<K extends CollezioneElenco> = {
  collezione: K
  /** Nome singolare, usato nei messaggi e nel registro: «film», «promozione». */
  nome: string
  /**
   * Costruisce una voce valida dal corpo della richiesta.
   *
   * Riceve la voce esistente quando si tratta di una modifica: serve a
   * conservare i campi che non vanno mai riscritti dall'esterno, come lo slug
   * di una pagina già pubblicata o la data di creazione.
   */
  dalCorpo: (
    corpo: Record<string, unknown>,
    archivio: Archivio,
    esistente?: Voce<K>,
  ) => EsitoCostruzione<Voce<K>>
  /**
   * Motivo per cui una voce non può essere eliminata, oppure `null`.
   *
   * Serve a impedire le cancellazioni che lascerebbero riferimenti rotti: una
   * sala con spettacoli programmati, un film con biglietti venduti.
   */
  bloccoEliminazione?: (voce: Voce<K>, archivio: Archivio) => string | null
  /** Percorsi pubblici da rigenerare dopo una modifica. */
  percorsiDaRigenerare?: (voce: Voce<K>) => string[]
  /** Campi modificabili al volo con `PATCH`, senza rimandare tutta la voce. */
  campiRapidi?: readonly (keyof Voce<K> & string)[]
}

export function rotteCollezione<K extends CollezioneElenco>(opzioni: OpzioniCollezione<K>) {
  const { collezione, nome } = opzioni

  /** Rigenera le pagine pubbliche toccate dalla modifica. */
  function rigenera(voce: Voce<K>) {
    for (const percorso of opzioni.percorsiDaRigenerare?.(voce) ?? []) {
      try {
        revalidatePath(percorso)
      } catch {
        // Fuori da un contesto di richiesta la rigenerazione non è possibile:
        // non è un motivo per far fallire un salvataggio già andato a buon fine.
      }
    }
  }

  return {
    /** Elenco completo, comprese le voci nascoste al pubblico. */
    async GET() {
      const blocco = await bloccaSeNonAutenticato()
      if (blocco) return blocco

      const archivio = await leggi()
      return Response.json(
        { voci: archivio[collezione] },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    },

    async POST(richiesta: Request) {
      const blocco = await bloccaSeNonAutenticato()
      if (blocco) return blocco

      const corpo = await corpoJson(richiesta)

      const esito = await modifica((archivio) => {
        const costruzione = opzioni.dalCorpo(corpo, archivio)
        if (!costruzione.ok) return { errore: costruzione.errore, stato: 400 } as const

        // `as never` è necessario: TypeScript non riesce a dimostrare che la
        // voce costruita appartiene proprio a questa collezione quando la
        // chiave è generica, pur avendolo garantito nei tipi.
        ;(archivio[collezione] as { id: string }[]).unshift(costruzione.voce as never)
        annota(archivio, 'gestione', `${nome}-creato`, costruzione.voce.id)

        return { voce: costruzione.voce } as const
      })

      if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })

      rigenera(esito.voce)
      return Response.json({ voce: esito.voce }, { status: 201 })
    },

    /** Sostituzione completa di una voce esistente. */
    async PUT(richiesta: Request) {
      const blocco = await bloccaSeNonAutenticato()
      if (blocco) return blocco

      const corpo = await corpoJson(richiesta)
      const id = testoPulito(corpo.id, 80)

      const esito = await modifica((archivio) => {
        const elenco = archivio[collezione] as { id: string }[]
        const indice = elenco.findIndex((voce) => voce.id === id)
        if (indice < 0) return { errore: `${nome} non trovato.`, stato: 404 } as const

        const costruzione = opzioni.dalCorpo(corpo, archivio, elenco[indice] as Voce<K>)
        if (!costruzione.ok) return { errore: costruzione.errore, stato: 400 } as const

        elenco[indice] = costruzione.voce as never
        annota(archivio, 'gestione', `${nome}-modificato`, id)

        return { voce: costruzione.voce } as const
      })

      if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })

      rigenera(esito.voce)
      return Response.json({ voce: esito.voce })
    },

    /**
     * Modifica rapida di pochi campi.
     *
     * Serve agli interruttori degli elenchi — visibile, attivo, in evidenza —
     * dove rimandare l'intera voce solo per cambiare un booleano è
     * un'occasione per perdere per strada i campi che non erano stati caricati.
     */
    async PATCH(richiesta: Request) {
      const blocco = await bloccaSeNonAutenticato()
      if (blocco) return blocco

      const corpo = await corpoJson(richiesta)
      const id = testoPulito(corpo.id, 80)
      const consentiti = opzioni.campiRapidi ?? []

      const esito = await modifica((archivio) => {
        const elenco = archivio[collezione] as Record<string, unknown>[]
        const voce = elenco.find((riga) => riga.id === id)
        if (!voce) return { errore: `${nome} non trovato.`, stato: 404 } as const

        let cambiati = 0
        for (const campo of consentiti) {
          if (!(campo in corpo)) continue
          const valore = corpo[campo]
          // Solo valori semplici: un oggetto annidato passato di qui
          // salterebbe la validazione di `dalCorpo`.
          if (typeof valore === 'boolean' || typeof valore === 'number' || typeof valore === 'string') {
            voce[campo] = valore
            cambiati += 1
          }
        }

        if (cambiati === 0) {
          return { errore: 'Nessun campo modificabile nella richiesta.', stato: 400 } as const
        }

        annota(archivio, 'gestione', `${nome}-aggiornato`, id, Object.keys(corpo).join(', '))
        return { voce: voce as unknown as Voce<K> } as const
      })

      if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })

      rigenera(esito.voce)
      return Response.json({ voce: esito.voce })
    },

    async DELETE(richiesta: Request) {
      const blocco = await bloccaSeNonAutenticato()
      if (blocco) return blocco

      const corpo = await corpoJson(richiesta)
      const id = testoPulito(corpo.id, 80)

      const esito = await modifica((archivio) => {
        const elenco = archivio[collezione] as { id: string }[]
        const indice = elenco.findIndex((voce) => voce.id === id)
        if (indice < 0) return { errore: `${nome} non trovato.`, stato: 404 } as const

        const voce = elenco[indice] as Voce<K>

        const motivo = opzioni.bloccoEliminazione?.(voce, archivio)
        if (motivo) return { errore: motivo, stato: 409 } as const

        elenco.splice(indice, 1)
        annota(archivio, 'gestione', `${nome}-eliminato`, id)

        return { voce } as const
      })

      if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })

      rigenera(esito.voce)
      return Response.json({ esito: 'eliminato' })
    },
  }
}
