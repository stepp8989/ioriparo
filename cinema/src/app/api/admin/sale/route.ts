import { rotteCollezione, type EsitoCostruzione } from '@/lib/rotteAdmin'
import { generaSchema, type ConfigurazioneSala } from '@/lib/posti'
import { elencoPulito, fraLeVoci, numeroDecimale, numeroIntero, testoPulito } from '@/lib/protezione'
import {
  FORMATI,
  TIPI_POSTO,
  type Archivio,
  type Posto,
  type Sala,
  type SchemaSala,
} from '@/lib/tipi'
import { nuovoId } from '@/lib/utili'

/**
 * Gestione delle sale.
 *
 * Lo schema delle poltrone può arrivare in due forme, e la differenza conta:
 *
 *   — come parametri (`configurazione`), quando l'operatore usa l'editor
 *     guidato: file, posti per fila, quante file premium. È il caso normale;
 *   — come schema completo (`schema`), quando ha spostato singole poltrone a
 *     mano. In quel caso i parametri non basterebbero più a descrivere la sala,
 *     e sovrascriverli significherebbe perdere il lavoro fatto.
 */

function schemaDalCorpo(corpo: Record<string, unknown>, esistente?: Sala): SchemaSala {
  const grezzo = corpo.schema as Record<string, unknown> | undefined

  if (grezzo && Array.isArray(grezzo.file) && grezzo.file.length > 0) {
    const file = (grezzo.file as unknown[]).slice(0, 60).map((voce) => {
      const riga = voce as Record<string, unknown>
      const posti = Array.isArray(riga.posti) ? riga.posti : []

      return {
        etichetta: testoPulito(riga.etichetta, 4).toUpperCase() || 'A',
        posti: posti.slice(0, 80).map((posto): Posto => {
          const cella = posto as Record<string, unknown>
          const tipo = testoPulito(cella.tipo, 16)
          return {
            numero: numeroIntero(cella.numero, 0, 200, 0),
            tipo: fraLeVoci(tipo, TIPI_POSTO) ? tipo : 'standard',
          }
        }),
      }
    })

    return {
      file,
      corridoiOrizzontali: (Array.isArray(grezzo.corridoiOrizzontali)
        ? grezzo.corridoiOrizzontali
        : []
      )
        .map((valore) => numeroIntero(valore, 0, 60, 0))
        .filter((valore) => valore > 0),
      schermo: grezzo.schermo === 'basso' ? 'basso' : 'alto',
    }
  }

  const configurazione = (corpo.configurazione ?? {}) as Record<string, unknown>

  const parametri: ConfigurazioneSala = {
    file: numeroIntero(configurazione.file, 1, 40, 12),
    postiPerFila: numeroIntero(configurazione.postiPerFila, 2, 60, 16),
    filePremium: numeroIntero(configurazione.filePremium, 0, 40, 3),
    postiDisabili: numeroIntero(configurazione.postiDisabili, 0, 20, 2),
    filaDisabili: numeroIntero(configurazione.filaDisabili, 0, 40, 0),
    corridoiVerticali: numeroIntero(configurazione.corridoiVerticali, 0, 4, 2),
    corridoiOrizzontali: (Array.isArray(configurazione.corridoiOrizzontali)
      ? configurazione.corridoiOrizzontali
      : []
    )
      .map((valore) => numeroIntero(valore, 0, 40, 0))
      .filter((valore) => valore > 0),
    schermo: configurazione.schermo === 'basso' ? 'basso' : 'alto',
  }

  // Senza parametri e senza schema si conserva quello che c'era: un `PATCH`
  // che cambia solo il nome non deve azzerare la pianta della sala.
  if (!corpo.configurazione && esistente) return esistente.schema

  return generaSchema(parametri)
}

function costruisci(
  corpo: Record<string, unknown>,
  archivio: Archivio,
  esistente?: Sala,
): EsitoCostruzione<Sala> {
  const nome = testoPulito(corpo.nome, 60) || esistente?.nome || ''
  if (!nome) return { ok: false, errore: 'Il nome della sala è obbligatorio.' }

  const cinemaId = testoPulito(corpo.cinemaId, 60) || esistente?.cinemaId || ''
  if (!archivio.cinema.some((voce) => voce.id === cinemaId)) {
    return { ok: false, errore: 'Cinema non trovato: la sala deve appartenere a una struttura.' }
  }

  return {
    ok: true,
    voce: {
      id: esistente?.id ?? nuovoId('sal'),
      cinemaId,
      nome,
      formati: elencoPulito(corpo.formati, 6, 20).filter((formato) =>
        (FORMATI as readonly string[]).includes(formato),
      ) as Sala['formati'],
      schema: schemaDalCorpo(corpo, esistente),
      supplemento: numeroDecimale(corpo.supplemento, 0, 50, esistente?.supplemento ?? 0),
      attiva: corpo.attiva !== false,
      creataIl: esistente?.creataIl ?? new Date().toISOString(),
    },
  }
}

const rotte = rotteCollezione({
  collezione: 'sale',
  nome: 'sala',
  dalCorpo: costruisci,
  campiRapidi: ['attiva', 'supplemento', 'nome'],
  bloccoEliminazione: (sala, archivio) => {
    const spettacoli = archivio.spettacoli.filter(
      (voce) => voce.salaId === sala.id && voce.stato !== 'annullato',
    ).length
    if (spettacoli > 0) {
      return `Ci sono ${spettacoli} spettacoli programmati in questa sala. Annullali o spostali prima di eliminarla.`
    }
    return null
  },
})

export const { GET, POST, PUT, PATCH, DELETE } = rotte
export const dynamic = 'force-dynamic'
