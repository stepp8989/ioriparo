import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { inSlug } from '@/lib/utili'

/**
 * Fotografie del sito.
 *
 *   GET   elenca le immagini già disponibili in `public/immagini/`
 *   POST  riceve un file, lo ridimensiona e lo salva in `public/immagini/caricate/`
 *
 * Il file caricato viene sempre riconvertito in JPEG con `sharp`: così un
 * ritratto da otto megapixel scattato col telefono diventa un'immagine da
 * poche decine di kilobyte, e nessun contenuto arbitrario finisce servito
 * intatto dal dominio del sito.
 *
 * Su piattaforme con filesystem di sola lettura il caricamento non è
 * possibile: in quel caso la rotta lo dice chiaramente e si continua a
 * indicare l'immagine tramite percorso, appoggiandosi a un servizio di
 * archiviazione esterno.
 */

const RADICE = join(process.cwd(), 'public', 'immagini')
const CARTELLA_CARICHI = join(RADICE, 'caricate')

/** Dimensione massima accettata prima della conversione. */
const PESO_MASSIMO = 8 * 1024 * 1024

const TIPI_AMMESSI = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  try {
    const voci = await readdir(RADICE, { withFileTypes: true, recursive: true })

    const immagini = voci
      .filter((voce) => voce.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(voce.name))
      .map((voce) => {
        // `parentPath` è il percorso assoluto della cartella che contiene il file.
        const relativo = voce.parentPath.slice(RADICE.length).replaceAll('\\', '/')
        return `/immagini${relativo}/${voce.name}`
      })
      .sort()

    return Response.json({ immagini })
  } catch {
    return Response.json({ immagini: [] })
  }
}

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const modulo = await richiesta.formData().catch(() => null)
  const file = modulo?.get('file')

  if (!(file instanceof File)) {
    return Response.json({ errore: 'Nessun file ricevuto.' }, { status: 400 })
  }

  if (!TIPI_AMMESSI.includes(file.type)) {
    return Response.json(
      { errore: 'Formato non supportato. Usate JPEG, PNG, WebP o AVIF.' },
      { status: 415 },
    )
  }

  if (file.size > PESO_MASSIMO) {
    return Response.json({ errore: 'Il file supera gli 8 MB.' }, { status: 413 })
  }

  const nomeBase = inSlug(file.name.replace(/\.[^.]+$/, '')) || 'immagine'
  const nomeFile = `${nomeBase}-${Date.now().toString(36)}.jpg`

  try {
    const originale = Buffer.from(await file.arrayBuffer())

    const convertita = await sharp(originale)
      // `withoutEnlargement` evita di gonfiare le immagini già piccole.
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .rotate() // rispetta l'orientamento registrato dalla fotocamera
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer()

    await mkdir(CARTELLA_CARICHI, { recursive: true })
    await writeFile(join(CARTELLA_CARICHI, nomeFile), convertita)

    return Response.json({ percorso: `/immagini/caricate/${nomeFile}` }, { status: 201 })
  } catch (errore) {
    const codice = (errore as NodeJS.ErrnoException)?.code

    if (codice === 'EROFS' || codice === 'EACCES' || codice === 'EPERM') {
      return Response.json(
        {
          errore:
            'Su questa piattaforma la cartella delle immagini è in sola lettura. ' +
            'Caricate la fotografia su un servizio di archiviazione e incollate qui il percorso.',
        },
        { status: 501 },
      )
    }

    return Response.json({ errore: 'Immagine non leggibile o danneggiata.' }, { status: 400 })
  }
}
