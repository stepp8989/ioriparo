import 'server-only'
import { COLLEZIONI, type Archivio, type Collezione } from '@/lib/tipi'
import type { Deposito } from '@/lib/deposito/tipi'

/**
 * Deposito PostgreSQL: si attiva da solo quando `DATABASE_URL` è impostata.
 *
 * Ogni collezione dell'archivio (veicoli, noleggi, clienti…) sta in una riga
 * della tabella `archivio`, con il contenuto in una colonna `jsonb`. È una
 * scelta deliberata: il pannello lavora sempre sull'insieme completo di una
 * collezione, quindi una riga per collezione evita di dover mantenere undici
 * tabelle, altrettante migrazioni e le relative traduzioni da e verso
 * TypeScript, e i tipi in `lib/tipi.ts` restano l'unico schema da aggiornare.
 *
 * Il limite da conoscere: `jsonb` non impone vincoli fra collezioni e non
 * permette query per singolo campo dal database. Quando il catalogo crescerà
 * al punto da richiedere ricerche lato server, la strada è normalizzare prima
 * la tabella `veicoli` — è l'unica che lo giustifichi — lasciando qui il resto.
 *
 * La scrittura avviene in transazione: o si aggiornano tutte le collezioni, o
 * nessuna.
 */

const TABELLA = 'archivio'

/**
 * `pg` è una dipendenza facoltativa: chi usa il deposito su file non deve
 * essere costretto a installarla. L'importazione è quindi differita al primo
 * utilizzo, e il modulo viene caricato una volta sola.
 */
type ModuloPg = typeof import('pg')

let modulo: Promise<ModuloPg> | null = null

function caricaPg(): Promise<ModuloPg> {
  modulo ??= import('pg').catch((errore) => {
    modulo = null
    throw new Error(
      'DATABASE_URL è impostata ma il pacchetto «pg» non è installato. ' +
        'Eseguite `npm install pg` oppure togliete DATABASE_URL per usare il deposito su file.',
      { cause: errore },
    )
  })
  return modulo
}

/** Riserva di connessioni: una sola per processo, riusata da tutte le richieste. */
type Riserva = Awaited<ReturnType<typeof creaRiserva>>

let riserva: Promise<Riserva> | null = null

async function creaRiserva(url: string) {
  const { Pool } = await caricaPg()

  const pool = new Pool({
    connectionString: url,
    // Le piattaforme gestite (Neon, Supabase, Railway) espongono PostgreSQL
    // dietro TLS con certificati che il client non conosce: si accetta la
    // cifratura senza pretendere la verifica della catena, a meno che
    // l'amministratore non chieda il contrario.
    ssl: richiedeTls(url) ? { rejectUnauthorized: process.env.DATABASE_SSL_STRICT === '1' } : undefined,
    max: Number(process.env.DATABASE_CONNESSIONI ?? 5),
    idleTimeoutMillis: 30_000,
  })

  // Un errore su una connessione inattiva non deve far cadere il processo.
  pool.on('error', (errore) => console.error('[deposito] Errore sulla connessione:', errore))

  await pool.query(`
    create table if not exists ${TABELLA} (
      collezione     text primary key,
      dati           jsonb not null,
      aggiornato_il  timestamptz not null default now()
    )
  `)

  return pool
}

/** Vero quando l'indirizzo non è un database locale: fuori da localhost si cifra. */
function richiedeTls(url: string): boolean {
  if (process.env.DATABASE_SSL === '0') return false
  if (process.env.DATABASE_SSL === '1') return true
  try {
    const host = new URL(url).hostname
    return host !== 'localhost' && host !== '127.0.0.1' && host !== '::1'
  } catch {
    return true
  }
}

function ottieniRiserva(url: string): Promise<Riserva> {
  riserva ??= creaRiserva(url).catch((errore) => {
    // Un tentativo fallito non deve avvelenare quelli successivi.
    riserva = null
    throw errore
  })
  return riserva
}

export function depositoPostgres(url: string): Deposito {
  return {
    nome: 'PostgreSQL',

    async leggi() {
      const pool = await ottieniRiserva(url)
      const esito = await pool.query<{ collezione: string; dati: unknown }>(
        `select collezione, dati from ${TABELLA}`,
      )

      if (esito.rows.length === 0) return null

      // Le collezioni mancanti restano assenti: le completa `normalizza`
      // nell'archivio, così un database creato da una versione precedente
      // continua a funzionare dopo l'aggiunta di una collezione nuova.
      const archivio: Partial<Archivio> = {}
      for (const riga of esito.rows) {
        if ((COLLEZIONI as readonly string[]).includes(riga.collezione)) {
          archivio[riga.collezione as Collezione] = riga.dati as never
        }
      }

      return archivio as Archivio
    },

    async scrivi(dati) {
      const pool = await ottieniRiserva(url)
      const connessione = await pool.connect()

      try {
        await connessione.query('begin')
        for (const collezione of COLLEZIONI) {
          await connessione.query(
            `insert into ${TABELLA} (collezione, dati, aggiornato_il)
             values ($1, $2::jsonb, now())
             on conflict (collezione)
             do update set dati = excluded.dati, aggiornato_il = now()`,
            [collezione, JSON.stringify(dati[collezione] ?? [])],
          )
        }
        await connessione.query('commit')
      } catch (errore) {
        await connessione.query('rollback').catch(() => undefined)
        throw errore
      } finally {
        connessione.release()
      }
    },
  }
}
