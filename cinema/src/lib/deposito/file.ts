import 'server-only'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { Archivio } from '@/lib/tipi'
import type { Deposito } from '@/lib/deposito/tipi'

/**
 * Deposito su file JSON: è quello predefinito in sviluppo e basta anche in
 * produzione per un singolo cinema servito da un solo processo.
 *
 * La scrittura è atomica — file temporaneo e poi rinomina — così
 * un'interruzione a metà salvataggio non lascia mai un archivio troncato. Dove
 * il disco non è scrivibile (funzioni serverless) il deposito segnala l'errore
 * e l'archivio prosegue con la sola copia in memoria: per la produzione su
 * quelle piattaforme, e per qualunque catena con più sale, si usa PostgreSQL.
 */

const PERCORSO =
  process.env.PERCORSO_ARCHIVIO ?? join(process.cwd(), 'dati-locali', 'archivio.json')

export function depositoFile(): Deposito {
  return {
    nome: `file (${PERCORSO})`,

    async leggi() {
      try {
        return JSON.parse(await readFile(PERCORSO, 'utf8')) as Partial<Archivio>
      } catch (errore) {
        // File assente: è il primo avvio, non un guasto.
        if ((errore as NodeJS.ErrnoException)?.code === 'ENOENT') return null
        throw errore
      }
    },

    async scrivi(dati) {
      // Il nome del file temporaneo è unico per singola scrittura, non per
      // processo: durante la compilazione più operazioni partono insieme dallo
      // stesso processo e, condividendo il nome, la prima rinomina toglierebbe
      // il file da sotto i piedi alle altre.
      const temporaneo = `${PERCORSO}.${process.pid}.${Date.now().toString(36)}${Math.random()
        .toString(36)
        .slice(2, 8)}.tmp`

      try {
        await mkdir(dirname(PERCORSO), { recursive: true })
        await writeFile(temporaneo, JSON.stringify(dati, null, 2), 'utf8')
        await rename(temporaneo, PERCORSO)
      } catch (errore) {
        await rm(temporaneo, { force: true }).catch(() => undefined)
        throw errore
      }
    },
  }
}
