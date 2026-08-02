/**
 * Generatore delle immagini del sito.
 *
 * Il progetto non scarica fotografie da servizi esterni: le immagini vengono
 * composte qui con `sharp` a partire da gradienti caldi, forme morbide e una
 * grana leggera, così ogni scheda ha un'immagine coerente con la palette del
 * sito e le prestazioni restano sotto controllo.
 *
 * Quando arrivano le fotografie vere basta sovrascrivere i file dentro
 * `public/immagini/` mantenendo gli stessi nomi: nessuna modifica al codice.
 *
 *   node scripts/genera-immagini.mjs            rigenera solo i file mancanti
 *   node scripts/genera-immagini.mjs --tutto    rigenera tutto
 */
import { mkdir, writeFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const RADICE = join(dirname(fileURLToPath(import.meta.url)), '..')
const USCITA = join(RADICE, 'public', 'immagini')
const RIGENERA_TUTTO = process.argv.includes('--tutto')

/* ── Palette ────────────────────────────────────────────────────────────────
   Ogni palette descrive quattro colori caldi: il fondo scuro della scena, la
   luce che lo attraversa, l'accento dorato e il colore dell'ingrediente in
   primo piano. Sono le stesse tonalità del tema (nero, antracite, oro, beige,
   legno) usate nel resto del sito.                                          */
const PALETTE = {
  brace: { fondo: '#140b06', luce: '#7a3312', accento: '#e0a44a', cibo: '#b4471d' },
  legno: { fondo: '#130d07', luce: '#6b4a24', accento: '#c9954e', cibo: '#d9a355' },
  oro: { fondo: '#100c06', luce: '#8a6a1f', accento: '#f0cd82', cibo: '#e8c06a' },
  beige: { fondo: '#1c150d', luce: '#8d7350', accento: '#e8d5b5', cibo: '#f2e4cb' },
  verde: { fondo: '#0c110c', luce: '#3f5c38', accento: '#c3cf9a', cibo: '#7fa04d' },
  vino: { fondo: '#110a08', luce: '#5a2620', accento: '#c99a72', cibo: '#7d2a2a' },
  mare: { fondo: '#081014', luce: '#1f4a55', accento: '#9fd2d6', cibo: '#e0b08a' },
  antracite: { fondo: '#0b0b0d', luce: '#3a3a40', accento: '#c9c3b6', cibo: '#a8a094' },
  cacao: { fondo: '#110a06', luce: '#4e2c1b', accento: '#d9a06b', cibo: '#5a3117' },
  agrume: { fondo: '#150e05', luce: '#8a5510', accento: '#f2b95c', cibo: '#e2701f' },
}

/** Bianco caldo della ceramica: comune a tutte le palette. */
const CERAMICA = '#efe6d8'

/** Numeri pseudocasuali riproducibili: la stessa chiave dà sempre la stessa immagine. */
function generatoreCasuale(chiave) {
  let stato = 2166136261
  for (const carattere of chiave) {
    stato ^= carattere.charCodeAt(0)
    stato = Math.imul(stato, 16777619)
  }
  return () => {
    stato ^= stato << 13
    stato ^= stato >>> 17
    stato ^= stato << 5
    return ((stato >>> 0) % 100000) / 100000
  }
}

/** Strato di fondo: gradiente caldo più alcune macchie di luce, poi sfocato. */
function svgFondo(larghezza, altezza, palette, casuale) {
  const { fondo, luce, accento } = palette
  const macchie = Array.from({ length: 5 }, (_, indice) => {
    const cx = Math.round(casuale() * larghezza)
    const cy = Math.round(casuale() * altezza)
    const raggio = Math.round((0.25 + casuale() * 0.45) * Math.max(larghezza, altezza))
    const colore = indice % 2 === 0 ? luce : accento
    const opacita = (0.2 + casuale() * 0.35).toFixed(2)
    return `<circle cx="${cx}" cy="${cy}" r="${raggio}" fill="url(#macchia${indice})" opacity="${opacita}"/>
      <radialGradient id="macchia${indice}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${colore}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${colore}" stop-opacity="0"/>
      </radialGradient>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${larghezza}" height="${altezza}">
    <defs>
      <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${fondo}"/>
        <stop offset="55%" stop-color="${luce}"/>
        <stop offset="100%" stop-color="${fondo}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#base)"/>
    ${macchie}
  </svg>`
}

/**
 * Strato di dettaglio: cambia in base al soggetto.
 * `piatto` disegna cerchi concentrici come un piatto visto dall'alto,
 * `ambiente` linee orizzontali morbide come una sala in penombra,
 * `ritratto` una figura sfumata al centro.
 */
function svgDettaglio(larghezza, altezza, tipo, palette, casuale) {
  const { luce, accento, cibo } = palette
  const centroX = larghezza / 2
  const centroY = altezza / 2
  let forme = ''

  if (tipo === 'piatto') {
    const raggio = Math.min(larghezza, altezza) * (0.33 + casuale() * 0.05)
    // Ombra portata del piatto sul piano.
    forme += `<ellipse cx="${centroX}" cy="${(centroY + raggio * 0.12).toFixed(1)}" rx="${(
      raggio * 1.24
    ).toFixed(1)}" ry="${(raggio * 1.18).toFixed(1)}" fill="#000000" fill-opacity="0.34"/>`
    // Piatto in ceramica con tesa e fondo.
    forme += `<circle cx="${centroX}" cy="${centroY}" r="${raggio.toFixed(
      1,
    )}" fill="${CERAMICA}" fill-opacity="0.88"/>`
    forme += `<circle cx="${centroX}" cy="${centroY}" r="${(raggio * 0.995).toFixed(
      1,
    )}" fill="none" stroke="${accento}" stroke-opacity="0.5" stroke-width="${(raggio * 0.012).toFixed(2)}"/>`
    forme += `<circle cx="${centroX}" cy="${centroY}" r="${(raggio * 0.72).toFixed(
      1,
    )}" fill="${luce}" fill-opacity="0.14"/>`
    forme += `<circle cx="${centroX}" cy="${centroY}" r="${(raggio * 0.72).toFixed(
      1,
    )}" fill="none" stroke="#6b5334" stroke-opacity="0.28" stroke-width="${(raggio * 0.008).toFixed(2)}"/>`
    // Velo di salsa sotto la porzione.
    forme += `<ellipse cx="${centroX}" cy="${centroY}" rx="${(raggio * 0.52).toFixed(1)}" ry="${(
      raggio * 0.44
    ).toFixed(1)}" fill="${accento}" fill-opacity="0.3"/>`
    // La porzione: alcune forme sovrapposte, come un impiattamento visto dall'alto.
    const porzioni = 4 + Math.floor(casuale() * 4)
    for (let indice = 0; indice < porzioni; indice += 1) {
      const angolo = (indice / porzioni) * Math.PI * 2 + casuale() * 0.9
      const distanza = raggio * (0.08 + casuale() * 0.3)
      const dimensione = raggio * (0.16 + casuale() * 0.16)
      const colore = indice % 3 === 0 ? accento : cibo
      forme += `<ellipse cx="${(centroX + Math.cos(angolo) * distanza).toFixed(1)}" cy="${(
        centroY +
        Math.sin(angolo) * distanza * 0.86
      ).toFixed(1)}" rx="${dimensione.toFixed(1)}" ry="${(dimensione * (0.62 + casuale() * 0.3)).toFixed(
        1,
      )}" transform="rotate(${Math.round(casuale() * 360)} ${(centroX + Math.cos(angolo) * distanza).toFixed(
        1,
      )} ${(centroY + Math.sin(angolo) * distanza * 0.86).toFixed(1)})" fill="${colore}" fill-opacity="${(
        0.66 +
        casuale() * 0.3
      ).toFixed(2)}"/>`
    }
    // Guarnizione finale: piccoli punti di condimento sulla tesa.
    for (let indice = 0; indice < 6; indice += 1) {
      const angolo = casuale() * Math.PI * 2
      const distanza = raggio * (0.78 + casuale() * 0.12)
      forme += `<circle cx="${(centroX + Math.cos(angolo) * distanza).toFixed(1)}" cy="${(
        centroY +
        Math.sin(angolo) * distanza
      ).toFixed(1)}" r="${(raggio * (0.012 + casuale() * 0.022)).toFixed(2)}" fill="${cibo}" fill-opacity="0.6"/>`
    }
  } else if (tipo === 'ritratto') {
    const raggio = Math.min(larghezza, altezza) * 0.2
    const testaY = altezza * 0.34
    // Busto e testa in controluce: una sagoma, non un volto.
    forme += `<path d="M ${centroX - raggio * 2.2} ${altezza} Q ${centroX - raggio * 1.5} ${
      testaY + raggio * 1.2
    } ${centroX} ${testaY + raggio * 1.05} Q ${centroX + raggio * 1.5} ${testaY + raggio * 1.2} ${
      centroX + raggio * 2.2
    } ${altezza} Z" fill="#0d0c0a" fill-opacity="0.62"/>`
    forme += `<circle cx="${centroX}" cy="${testaY}" r="${raggio}" fill="#0d0c0a" fill-opacity="0.62"/>`
    forme += `<circle cx="${(centroX - raggio * 0.3).toFixed(1)}" cy="${(testaY - raggio * 0.25).toFixed(
      1,
    )}" r="${(raggio * 0.9).toFixed(1)}" fill="${luce}" fill-opacity="0.2"/>`
    forme += `<circle cx="${centroX}" cy="${testaY}" r="${(raggio * 1.9).toFixed(
      1,
    )}" fill="${accento}" fill-opacity="0.07"/>`
  } else if (tipo === 'dettaglio') {
    // Primo piano di una mise en place: piatto, calice, posate e tovagliolo.
    const base = Math.min(larghezza, altezza)
    forme += `<rect x="0" y="${(altezza * 0.62).toFixed(1)}" width="${larghezza}" height="${(
      altezza * 0.38
    ).toFixed(1)}" fill="#0f0a06" fill-opacity="0.35"/>`
    // Piatto, spostato a sinistra.
    const piattoX = larghezza * 0.4
    const piattoY = altezza * 0.6
    const raggio = base * 0.26
    forme += `<ellipse cx="${piattoX}" cy="${(piattoY + raggio * 0.1).toFixed(1)}" rx="${(
      raggio * 1.1
    ).toFixed(1)}" ry="${(raggio * 0.72).toFixed(1)}" fill="#000" fill-opacity="0.35"/>`
    forme += `<ellipse cx="${piattoX}" cy="${piattoY}" rx="${raggio.toFixed(1)}" ry="${(
      raggio * 0.62
    ).toFixed(1)}" fill="${CERAMICA}" fill-opacity="0.9"/>`
    forme += `<ellipse cx="${piattoX}" cy="${piattoY}" rx="${(raggio * 0.68).toFixed(1)}" ry="${(
      raggio * 0.42
    ).toFixed(1)}" fill="${luce}" fill-opacity="0.16"/>`
    // Calice: coppa, stelo e base.
    const calice = larghezza * 0.72
    forme += `<path d="M ${calice - base * 0.075} ${altezza * 0.24} L ${calice + base * 0.075} ${
      altezza * 0.24
    } Q ${calice + base * 0.06} ${altezza * 0.44} ${calice} ${altezza * 0.46} Q ${
      calice - base * 0.06
    } ${altezza * 0.44} ${calice - base * 0.075} ${altezza * 0.24} Z" fill="${CERAMICA}" fill-opacity="0.3"/>`
    forme += `<path d="M ${calice - base * 0.068} ${altezza * 0.33} L ${calice + base * 0.068} ${
      altezza * 0.33
    } Q ${calice + base * 0.055} ${altezza * 0.44} ${calice} ${altezza * 0.46} Q ${
      calice - base * 0.055
    } ${altezza * 0.44} ${calice - base * 0.068} ${altezza * 0.33} Z" fill="${cibo}" fill-opacity="0.6"/>`
    forme += `<rect x="${(calice - base * 0.006).toFixed(1)}" y="${(altezza * 0.46).toFixed(
      1,
    )}" width="${(base * 0.012).toFixed(1)}" height="${(altezza * 0.16).toFixed(
      1,
    )}" fill="${CERAMICA}" fill-opacity="0.35"/>`
    forme += `<ellipse cx="${calice}" cy="${(altezza * 0.62).toFixed(1)}" rx="${(base * 0.06).toFixed(
      1,
    )}" ry="${(base * 0.018).toFixed(1)}" fill="${CERAMICA}" fill-opacity="0.4"/>`
    // Posate a destra del piatto.
    for (const scostamento of [-0.06, 0.055]) {
      const x = piattoX + raggio * (scostamento < 0 ? -1.55 : 1.55) + larghezza * scostamento * 0.1
      forme += `<rect x="${x.toFixed(1)}" y="${(piattoY - base * 0.14).toFixed(1)}" width="${(
        base * 0.014
      ).toFixed(1)}" height="${(base * 0.28).toFixed(1)}" rx="${(base * 0.007).toFixed(
        1,
      )}" fill="${accento}" fill-opacity="0.5"/>`
    }
  } else if (tipo === 'cantina') {
    // Volte in mattoni con file di bottiglie in penombra.
    const base = Math.min(larghezza, altezza)
    const archi = 3
    for (let indice = 0; indice < archi; indice += 1) {
      const cx = larghezza * ((indice + 0.5) / archi)
      const larghezzaArco = (larghezza / archi) * 0.74
      forme += `<path d="M ${(cx - larghezzaArco / 2).toFixed(1)} ${altezza} L ${(
        cx -
        larghezzaArco / 2
      ).toFixed(1)} ${(altezza * 0.5).toFixed(1)} Q ${cx} ${(altezza * 0.16).toFixed(1)} ${(
        cx +
        larghezzaArco / 2
      ).toFixed(1)} ${(altezza * 0.5).toFixed(1)} L ${(cx + larghezzaArco / 2).toFixed(
        1,
      )} ${altezza} Z" fill="#0b0706" fill-opacity="0.5" stroke="${accento}" stroke-opacity="0.22" stroke-width="${(
        base * 0.006
      ).toFixed(2)}"/>`
      // Bottiglie: file orizzontali di piccoli tondi.
      for (let fila = 0; fila < 4; fila += 1) {
        const y = altezza * (0.56 + fila * 0.1)
        for (let bottiglia = 0; bottiglia < 6; bottiglia += 1) {
          const x = cx - larghezzaArco * 0.36 + (larghezzaArco * 0.72 * bottiglia) / 5
          forme += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(base * 0.012).toFixed(
            2,
          )}" fill="${cibo}" fill-opacity="${(0.35 + casuale() * 0.4).toFixed(2)}"/>`
        }
      }
    }
    // Lampadina calda appesa al centro.
    forme += `<circle cx="${larghezza / 2}" cy="${(altezza * 0.12).toFixed(1)}" r="${(
      base * 0.1
    ).toFixed(1)}" fill="${accento}" fill-opacity="0.14"/>`
    forme += `<circle cx="${larghezza / 2}" cy="${(altezza * 0.12).toFixed(1)}" r="${(
      base * 0.018
    ).toFixed(1)}" fill="${CERAMICA}" fill-opacity="0.9"/>`
  } else if (tipo === 'facciata') {
    // Facciata su strada: porta illuminata, insegna e vetrine.
    const base = Math.min(larghezza, altezza)
    forme += `<rect x="0" y="${(altezza * 0.86).toFixed(1)}" width="${larghezza}" height="${(
      altezza * 0.14
    ).toFixed(1)}" fill="#0b0806" fill-opacity="0.55"/>`
    const portaLarghezza = larghezza * 0.26
    forme += `<rect x="${((larghezza - portaLarghezza) / 2).toFixed(1)}" y="${(
      altezza * 0.42
    ).toFixed(1)}" width="${portaLarghezza.toFixed(1)}" height="${(altezza * 0.44).toFixed(
      1,
    )}" fill="${accento}" fill-opacity="0.34"/>`
    forme += `<rect x="${((larghezza - portaLarghezza) / 2).toFixed(1)}" y="${(
      altezza * 0.42
    ).toFixed(1)}" width="${portaLarghezza.toFixed(1)}" height="${(altezza * 0.44).toFixed(
      1,
    )}" fill="none" stroke="${CERAMICA}" stroke-opacity="0.25" stroke-width="${(base * 0.006).toFixed(2)}"/>`
    // Vetrine laterali.
    for (const lato of [-1, 1]) {
      const x = larghezza / 2 + lato * (portaLarghezza * 0.85 + larghezza * 0.13) - larghezza * 0.1
      forme += `<rect x="${x.toFixed(1)}" y="${(altezza * 0.5).toFixed(1)}" width="${(
        larghezza * 0.2
      ).toFixed(1)}" height="${(altezza * 0.3).toFixed(1)}" fill="${luce}" fill-opacity="0.28"/>`
    }
    // Insegna.
    forme += `<rect x="${(larghezza * 0.34).toFixed(1)}" y="${(altezza * 0.26).toFixed(1)}" width="${(
      larghezza * 0.32
    ).toFixed(1)}" height="${(altezza * 0.08).toFixed(1)}" fill="#0b0806" fill-opacity="0.5"/>`
    forme += `<rect x="${(larghezza * 0.4).toFixed(1)}" y="${(altezza * 0.295).toFixed(1)}" width="${(
      larghezza * 0.2
    ).toFixed(1)}" height="${(altezza * 0.012).toFixed(1)}" fill="${accento}" fill-opacity="0.8"/>`
  } else {
    // Ambiente: piano del tavolo, fondo in penombra e lampade sospese.
    const orizzonte = altezza * (0.52 + casuale() * 0.12)
    forme += `<rect x="0" y="${orizzonte.toFixed(1)}" width="${larghezza}" height="${(
      altezza - orizzonte
    ).toFixed(1)}" fill="#0d0906" fill-opacity="0.5"/>`
    forme += `<rect x="0" y="${orizzonte.toFixed(1)}" width="${larghezza}" height="${(
      altezza * 0.012
    ).toFixed(1)}" fill="${accento}" fill-opacity="0.4"/>`
    // Lampade: alone caldo più sorgente luminosa.
    const luci = 3 + Math.floor(casuale() * 3)
    for (let indice = 0; indice < luci; indice += 1) {
      const cx = larghezza * ((indice + 0.5) / luci + (casuale() - 0.5) * 0.1)
      const cy = altezza * (0.14 + casuale() * 0.2)
      const raggio = Math.min(larghezza, altezza) * (0.022 + casuale() * 0.02)
      forme += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(raggio * 4).toFixed(
        1,
      )}" fill="${accento}" fill-opacity="0.12"/>`
      forme += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${raggio.toFixed(
        1,
      )}" fill="${CERAMICA}" fill-opacity="0.85"/>`
      forme += `<rect x="${(cx - larghezza * 0.001).toFixed(1)}" y="0" width="${(
        larghezza * 0.002
      ).toFixed(1)}" height="${(cy - raggio).toFixed(1)}" fill="${accento}" fill-opacity="0.3"/>`
    }
    // Tavoli apparecchiati sul piano, sempre più piccoli verso il fondo.
    const tavoli = 2 + Math.floor(casuale() * 3)
    for (let indice = 0; indice < tavoli; indice += 1) {
      const scala = 0.5 + casuale() * 0.6
      const cx = larghezza * (0.12 + casuale() * 0.76)
      const cy = orizzonte + (altezza - orizzonte) * (0.2 + casuale() * 0.6)
      const rx = Math.min(larghezza, altezza) * 0.11 * scala
      forme += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(
        rx * 0.42
      ).toFixed(1)}" fill="${CERAMICA}" fill-opacity="${(0.16 + casuale() * 0.2).toFixed(2)}"/>`
      forme += `<ellipse cx="${cx.toFixed(1)}" cy="${(cy - rx * 0.06).toFixed(1)}" rx="${(
        rx * 0.34
      ).toFixed(1)}" ry="${(rx * 0.15).toFixed(1)}" fill="${accento}" fill-opacity="0.4"/>`
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${larghezza}" height="${altezza}">${forme}</svg>`
}

/** Vignettatura: scurisce i bordi e concentra lo sguardo al centro. */
function svgVignetta(larghezza, altezza) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${larghezza}" height="${altezza}">
    <defs>
      <radialGradient id="v" cx="50%" cy="45%" r="72%">
        <stop offset="55%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#4a4038"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#v)"/>
  </svg>`
}

/** Grana fotografica: un riquadro di rumore replicato su tutta l'immagine. */
async function tesseraGrana() {
  const lato = 256
  const dati = Buffer.alloc(lato * lato * 4)
  for (let indice = 0; indice < lato * lato; indice += 1) {
    const valore = 118 + Math.floor(Math.random() * 26)
    dati[indice * 4] = valore
    dati[indice * 4 + 1] = valore
    dati[indice * 4 + 2] = valore
    dati[indice * 4 + 3] = 26
  }
  return sharp(dati, { raw: { width: lato, height: lato, channels: 4 } }).png().toBuffer()
}

let granaCondivisa = null

/** Compone e salva una singola immagine. */
async function generaImmagine({ percorso, larghezza, altezza, palette, tipo, chiave, qualita }) {
  const destinazione = join(USCITA, percorso)
  if (!RIGENERA_TUTTO) {
    try {
      await access(destinazione)
      return false
    } catch {
      // Il file non esiste: si procede con la generazione.
    }
  }

  const casuale = generatoreCasuale(chiave)
  const colori = PALETTE[palette] ?? PALETTE.legno

  // 1. Fondo sfocato: dà l'impressione di profondità di campo.
  const fondo = await sharp(Buffer.from(svgFondo(larghezza, altezza, colori, casuale)))
    .blur(Math.max(12, Math.round(Math.min(larghezza, altezza) / 22)))
    .toBuffer()

  // 2. Dettaglio appena ammorbidito: resta leggibile ma non ha bordi netti da vettore.
  const dettaglio = await sharp(Buffer.from(svgDettaglio(larghezza, altezza, tipo, colori, casuale)))
    .blur(Math.max(1.2, Math.min(larghezza, altezza) / 400))
    .toBuffer()

  granaCondivisa ??= await tesseraGrana()

  const immagine = await sharp(fondo)
    .composite([
      { input: dettaglio, blend: 'over' },
      { input: Buffer.from(svgVignetta(larghezza, altezza)), blend: 'multiply' },
      { input: granaCondivisa, tile: true, blend: 'overlay' },
    ])
    .modulate({ saturation: 1.06, brightness: 1.02 })
    .jpeg({ quality: qualita, mozjpeg: true, chromaSubsampling: '4:2:0' })
    .toBuffer()

  await mkdir(dirname(destinazione), { recursive: true })
  await writeFile(destinazione, immagine)
  return true
}

/* ── Elenco delle immagini da produrre ───────────────────────────────────── */

const PALETTE_CATEGORIA = {
  antipasti: 'beige',
  primi: 'oro',
  secondi: 'brace',
  pizza: 'agrume',
  carne: 'brace',
  pesce: 'mare',
  dolci: 'cacao',
  bevande: 'antracite',
  vini: 'vino',
}

/** Legge il menù senza dipendere da TypeScript: estrae id e categoria dal sorgente. */
async function piattiDalMenu() {
  const sorgente = await import('node:fs/promises').then((fs) =>
    fs.readFile(join(RADICE, 'src', 'dati', 'menu.ts'), 'utf8'),
  )
  const piatti = []
  const blocchi = sorgente.split(/\n\s{2}\{\n/).slice(1)
  for (const blocco of blocchi) {
    const id = blocco.match(/id:\s*'([^']+)'/)?.[1]
    const categoria = blocco.match(/categoria:\s*'([^']+)'/)?.[1]
    if (id && categoria) piatti.push({ id, categoria })
  }
  return piatti
}

async function main() {
  const lavori = []

  // Fotografie dei piatti.
  for (const { id, categoria } of await piattiDalMenu()) {
    lavori.push({
      percorso: `piatti/${id}.jpg`,
      larghezza: 1200,
      altezza: 900,
      palette: PALETTE_CATEGORIA[categoria] ?? 'legno',
      tipo: 'piatto',
      chiave: id,
      qualita: 66,
    })
  }

  // Immagini di ambiente: apertura, sezioni della home, pagine interne.
  const ambienti = [
    { nome: 'hero', larghezza: 2400, altezza: 1350, palette: 'brace', tipo: 'ambiente' },
    { nome: 'chi-siamo', larghezza: 1600, altezza: 1200, palette: 'legno', tipo: 'ambiente' },
    { nome: 'chi-siamo-storia', larghezza: 1600, altezza: 1067, palette: 'beige', tipo: 'dettaglio' },
    { nome: 'specialita', larghezza: 1600, altezza: 1067, palette: 'brace', tipo: 'piatto' },
    { nome: 'invito', larghezza: 2000, altezza: 1000, palette: 'oro', tipo: 'dettaglio' },
    { nome: 'menu-copertina', larghezza: 2000, altezza: 900, palette: 'legno', tipo: 'dettaglio' },
    { nome: 'prenota-copertina', larghezza: 2000, altezza: 900, palette: 'oro', tipo: 'ambiente' },
    { nome: 'galleria-copertina', larghezza: 2000, altezza: 900, palette: 'beige', tipo: 'dettaglio' },
    { nome: 'contatti-copertina', larghezza: 2000, altezza: 900, palette: 'antracite', tipo: 'facciata' },
    { nome: 'chi-siamo-copertina', larghezza: 2000, altezza: 900, palette: 'legno', tipo: 'cantina' },
    { nome: 'social', larghezza: 1200, altezza: 630, palette: 'brace', tipo: 'ambiente' },
  ]
  for (const ambiente of ambienti) {
    lavori.push({
      percorso: `ambienti/${ambiente.nome}.jpg`,
      larghezza: ambiente.larghezza,
      altezza: ambiente.altezza,
      palette: ambiente.palette,
      tipo: ambiente.tipo,
      chiave: `ambiente-${ambiente.nome}`,
      qualita: 70,
    })
  }

  // Galleria: tre formati diversi per un impaginato a mosaico credibile.
  // Ogni scatto ha una composizione propria: senza varietà la galleria
  // sembrerebbe la stessa fotografia ripetuta dodici volte.
  const galleria = [
    ['sala-principale', 'verticale', 'legno', 'ambiente'],
    ['brace', 'orizzontale', 'brace', 'piatto'],
    ['mise-en-place', 'quadrato', 'beige', 'dettaglio'],
    ['cantina', 'verticale', 'vino', 'cantina'],
    ['pasta-fresca', 'orizzontale', 'oro', 'piatto'],
    ['dettaglio-tavolo', 'quadrato', 'legno', 'dettaglio'],
    ['cucina', 'orizzontale', 'antracite', 'ambiente'],
    ['dehors', 'verticale', 'verde', 'facciata'],
    ['bancone', 'quadrato', 'agrume', 'dettaglio'],
    ['dessert', 'orizzontale', 'cacao', 'piatto'],
    ['ingresso', 'verticale', 'antracite', 'facciata'],
    ['brindisi', 'quadrato', 'oro', 'dettaglio'],
  ]
  const MISURE = {
    verticale: [1000, 1400],
    orizzontale: [1600, 1067],
    quadrato: [1200, 1200],
  }
  for (const [nome, formato, palette, tipo] of galleria) {
    const [larghezza, altezza] = MISURE[formato]
    lavori.push({
      percorso: `galleria/${nome}.jpg`,
      larghezza,
      altezza,
      palette,
      tipo,
      chiave: `galleria-${nome}`,
      qualita: 68,
    })
  }

  // Ritratti della squadra.
  for (const nome of ['chef', 'maitre', 'sommelier', 'pastry']) {
    lavori.push({
      percorso: `squadra/${nome}.jpg`,
      larghezza: 900,
      altezza: 1200,
      palette: 'antracite',
      tipo: 'ritratto',
      chiave: `squadra-${nome}`,
      qualita: 68,
    })
  }

  // Eventi e promozioni.
  for (const [nome, palette, tipo] of [
    ['evt-tartufo', 'legno', 'piatto'],
    ['evt-degustazione', 'oro', 'dettaglio'],
    ['evt-pranzo-lavoro', 'beige', 'ambiente'],
  ]) {
    lavori.push({
      percorso: `eventi/${nome}.jpg`,
      larghezza: 1400,
      altezza: 933,
      palette,
      tipo,
      chiave: `evento-${nome}`,
      qualita: 68,
    })
  }

  let create = 0
  for (const lavoro of lavori) {
    if (await generaImmagine(lavoro)) create += 1
  }
  console.log(`Immagini: ${create} generate, ${lavori.length - create} già presenti.`)
}

main().catch((errore) => {
  console.error(errore)
  process.exit(1)
})
