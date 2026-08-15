/**
 * Generatore delle immagini del sito.
 *
 * Il progetto non scarica fotografie da servizi esterni: le immagini vengono
 * composte qui con `sharp` a partire da gradienti profondi, silhouette di
 * veicoli, scie di luce e una grana leggera, così ogni scheda ha un'immagine
 * riconoscibile e le prestazioni restano sotto controllo.
 *
 * Quando arrivano le fotografie vere basta sovrascrivere i file dentro
 * `public/immagini/` mantenendo gli stessi nomi: nessuna modifica al codice.
 *
 * Nota sulle tinte: le palette qui sotto sono ancora quelle fredde della prima
 * versione del sito, mentre l'interfaccia è passata al rame. È una scelta
 * consapevole — le fotografie verranno sostituite da scatti veri, quindi
 * rifare i segnaposto sarebbe lavoro buttato. Per allinearle basta cambiare i
 * colori di `PALETTE` e lanciare `npm run immagini -- --tutto`.
 *
 *   node scripts/genera-immagini.mjs            rigenera solo i file mancanti
 *   node scripts/genera-immagini.mjs --tutto    rigenera tutto
 */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const RADICE = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBBLICA = join(RADICE, 'public')
const USCITA = join(PUBBLICA, 'immagini')
const RIGENERA_TUTTO = process.argv.includes('--tutto')

/* ── Palette ────────────────────────────────────────────────────────────────
   Ogni palette descrive quattro colori: il fondo profondo della scena, la luce
   che lo attraversa, l'accento (quasi sempre il blu elettrico del marchio) e
   il colore della carrozzeria in primo piano. Sono le stesse tonalità del tema
   — nero opaco, blu elettrico, bianco, grigio antracite — usate nel resto del
   sito.                                                                     */
const PALETTE = {
  notte: { fondo: '#05070c', luce: '#12203c', accento: '#3d86ff', corpo: '#1b2130' },
  blu: { fondo: '#050a16', luce: '#0f2a5c', accento: '#4d8bff', corpo: '#16233d' },
  antracite: { fondo: '#080a0e', luce: '#242a35', accento: '#6f8dbd', corpo: '#2c323f' },
  argento: { fondo: '#0b0e14', luce: '#3b4453', accento: '#c3cbdb', corpo: '#8c94a4' },
  bianco: { fondo: '#0d1017', luce: '#4a5364', accento: '#e8ecf4', corpo: '#c9d0dc' },
  rosso: { fondo: '#0b0608', luce: '#4a1220', accento: '#ff5a6e', corpo: '#8e1c2b' },
  verde: { fondo: '#050c0a', luce: '#123b31', accento: '#3ddca4', corpo: '#17503f' },
  bronzo: { fondo: '#0c0904', luce: '#463218', accento: '#e0a44a', corpo: '#7a5a2e' },
  ghiaccio: { fondo: '#060c12', luce: '#153a55', accento: '#7fd4ff', corpo: '#1d3a4d' },
  officina: { fondo: '#07090d', luce: '#1d232e', accento: '#3d86ff', corpo: '#333b4a' },
}

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

/** Strato di fondo: gradiente profondo, macchie di luce e una griglia tecnica. */
function svgFondo(larghezza, altezza, palette, casuale) {
  const { fondo, luce, accento } = palette

  const macchie = Array.from({ length: 5 }, (_, indice) => {
    const cx = Math.round(casuale() * larghezza)
    const cy = Math.round(casuale() * altezza * 0.9)
    const raggio = Math.round((0.22 + casuale() * 0.4) * Math.max(larghezza, altezza))
    const colore = indice % 2 === 0 ? luce : accento
    const opacita = (0.18 + casuale() * 0.3).toFixed(2)
    return `<radialGradient id="macchia${indice}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${colore}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${colore}" stop-opacity="0"/>
      </radialGradient>
      <circle cx="${cx}" cy="${cy}" r="${raggio}" fill="url(#macchia${indice})" opacity="${opacita}"/>`
  }).join('')

  // Scie orizzontali: suggeriscono velocità senza disegnare nulla di preciso.
  const scie = Array.from({ length: 3 }, (_, indice) => {
    const y = Math.round((0.2 + casuale() * 0.6) * altezza)
    const spessore = Math.max(1, Math.round(altezza * (0.004 + casuale() * 0.01)))
    const opacita = (0.1 + casuale() * 0.22).toFixed(2)
    return `<rect x="0" y="${y}" width="${larghezza}" height="${spessore}" fill="url(#scia${indice})" opacity="${opacita}"/>
      <linearGradient id="scia${indice}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${accento}" stop-opacity="0"/>
        <stop offset="50%" stop-color="${accento}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${accento}" stop-opacity="0"/>
      </linearGradient>`
  }).join('')

  const passo = Math.round(Math.max(larghezza, altezza) / 18)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${larghezza}" height="${altezza}">
    <defs>
      <linearGradient id="base" x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="${fondo}"/>
        <stop offset="52%" stop-color="${luce}"/>
        <stop offset="100%" stop-color="${fondo}"/>
      </linearGradient>
      <pattern id="griglia" width="${passo}" height="${passo}" patternUnits="userSpaceOnUse">
        <path d="M ${passo} 0 L 0 0 0 ${passo}" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#base)"/>
    ${macchie}
    <rect width="100%" height="100%" fill="url(#griglia)"/>
    ${scie}
  </svg>`
}

/* ── Silhouette ─────────────────────────────────────────────────────────────
   Profili disegnati su una griglia 100×40 e poi riscalati: bastano poche curve
   perché la forma sia riconoscibile una volta illuminata da dietro.         */

/** Profilo di un'automobile: cofano, abitacolo, coda e due ruote. */
function profiloAuto(variante) {
  // La variante cambia l'altezza del padiglione: berlina, SUV, coupé.
  const tetto = variante === 'suv' ? 6 : variante === 'coupe' ? 12 : 9
  return `
    <path d="M3 31 C3 25 6 22.5 12 21.5 L23 ${tetto + 3}
             C26 ${tetto} 31 ${tetto - 1} 39 ${tetto - 1}
             L60 ${tetto - 1} C69 ${tetto - 1} 75 ${tetto + 1} 79 ${tetto + 4}
             L88 20 C93.5 21.5 97 24.5 97 30 L97 33 L3 33 Z"/>
    <circle cx="24" cy="33" r="7.4"/>
    <circle cx="76" cy="33" r="7.4"/>`
}

/** Profilo di una moto: due ruote grandi, serbatoio, sella e manubrio. */
function profiloMoto() {
  return `
    <circle cx="19" cy="27" r="12"/>
    <circle cx="81" cy="27" r="12"/>
    <path d="M28 24 L44 18 C48 15 55 14 61 15 L70 17 L74 22 L66 26 L52 27 L40 30 Z"/>
    <path d="M60 15 L68 7 L78 6 L79 9 L70 11 L65 17 Z"/>
    <path d="M30 26 L19 27 L28 20 Z"/>`
}

/** Cerchio con razze: usato per le inquadrature di dettaglio. */
function ruotaDettaglio(casuale) {
  const razze = 5 + Math.floor(casuale() * 4)
  const bracci = Array.from({ length: razze }, (_, indice) => {
    const angolo = (indice / razze) * 360
    return `<rect x="49" y="14" width="2" height="18" rx="1" transform="rotate(${angolo} 50 32)"/>`
  }).join('')

  return `<circle cx="50" cy="32" r="20" fill="none" stroke-width="3"/>
    <circle cx="50" cy="32" r="14"/>
    ${bracci}
    <circle cx="50" cy="32" r="4"/>`
}

/**
 * Strato del soggetto: cambia in base al tipo di scena.
 *
 * La sagoma viene disegnata in un colore solo, senza dettagli inventati, e
 * composta scura contro un fondo illuminato: è il modo in cui si fotografano
 * davvero i veicoli in studio, in controluce, e l'unico che regga senza una
 * fotografia vera.
 */
function formeSoggetto(tipo, casuale) {
  switch (tipo) {
    case 'auto':
      return profiloAuto(casuale() > 0.6 ? 'suv' : casuale() > 0.3 ? 'berlina' : 'coupe')

    case 'moto':
      return profiloMoto()

    case 'ruota':
      return ruotaDettaglio(casuale)

    case 'faro':
      // Un faro con i due fasci che si allargano verso destra.
      return `<path d="M12 22 C12 16 18 13 26 13 L34 13 C42 13 46 17 46 23 C46 29 42 33 34 33 L26 33 C18 33 12 29 12 22 Z"/>
        <path d="M46 18 L96 8 L96 14 L46 22 Z"/>
        <path d="M46 26 L96 30 L96 36 L46 30 Z"/>`

    case 'goccia':
      // Gocce d'acqua su una superficie trattata: la firma del detailing.
      return Array.from({ length: 30 }, () => {
        const cx = (casuale() * 100).toFixed(1)
        const cy = (2 + casuale() * 36).toFixed(1)
        const raggio = (0.8 + casuale() * 3).toFixed(2)
        return `<circle cx="${cx}" cy="${cy}" r="${raggio}"/>`
      }).join('')

    case 'ritratto':
      // Figura a mezzo busto, di tre quarti.
      return `<circle cx="50" cy="13" r="8.5"/>
        <path d="M28 40 C28 29.5 37 24.5 50 24.5 C63 24.5 72 29.5 72 40 Z"/>`

    case 'officina':
      // Ponte sollevatore con una vettura sopra: la sagoma dell'officina.
      return `<rect x="8" y="30" width="84" height="3" rx="1.5"/>
        <rect x="24" y="20" width="6" height="12" rx="2"/>
        <rect x="70" y="20" width="6" height="12" rx="2"/>
        <path d="M18 20 C18 15 22 13 28 12.5 L38 6 C41 4 46 3.5 53 3.5 L68 3.5 C75 3.5 80 5 83 7.5 L88 12 C92 13 94 15 94 19 L94 20 Z"/>`

    default:
      // Astratto: nessuna sagoma, resta il fondo con le sue luci.
      return ''
  }
}

/**
 * Avvolge le forme in un SVG delle dimensioni giuste.
 *
 * La griglia di disegno è 100×40; qui viene riscalata al 78% della larghezza e
 * appoggiata a poco meno di quattro quinti dell'altezza, così il soggetto ha
 * aria sopra e non tocca mai il bordo inferiore.
 */
function svgSoggetto(larghezza, altezza, forme, colore, opacita = 1) {
  if (!forme) return ''

  const scala = (larghezza * 0.78) / 100
  const x = (larghezza - 100 * scala) / 2
  const y = altezza * 0.84 - 40 * scala

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${larghezza}" height="${altezza}">
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scala.toFixed(4)})"
       fill="${colore}" fill-opacity="${opacita}"
       stroke="${colore}" stroke-opacity="${opacita}" stroke-width="0.6">
      ${forme}
    </g>
  </svg>`
}

/** Riflesso: una banda chiara obliqua che dà volume alla scena. */
function svgRiflesso(larghezza, altezza, palette, casuale) {
  const inizio = (casuale() * 40).toFixed(0)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${larghezza}" height="${altezza}">
    <defs>
      <linearGradient id="riflesso" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="${inizio}%" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="${Number(inizio) + 12}%" stop-color="${palette.accento}" stop-opacity="0.5"/>
        <stop offset="${Number(inizio) + 24}%" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="vignetta" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.35"/>
        <stop offset="45%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#riflesso)"/>
    <rect width="100%" height="100%" fill="url(#vignetta)"/>
  </svg>`
}

/** Grana: toglie la piattezza dei gradienti e nasconde le bande di colore. */
async function grana(larghezza, altezza, intensita = 12) {
  const pixel = Buffer.alloc(larghezza * altezza)
  for (let indice = 0; indice < pixel.length; indice += 1) {
    pixel[indice] = 128 + Math.round((Math.random() - 0.5) * intensita * 2)
  }
  return sharp(pixel, { raw: { width: larghezza, height: altezza, channels: 1 } })
    .png()
    .toBuffer()
}

/**
 * Compone una singola immagine.
 *
 * L'ordine degli strati è quello di uno scatto in studio: il fondo illuminato,
 * la luce di contorno che stacca il soggetto, la sagoma scura in controluce, il
 * riflesso obliquo e infine la grana. Una sfocatura leggera sulla sagoma
 * ammorbidisce i bordi vettoriali senza cancellare la forma.
 */
async function componi({ percorso, larghezza, altezza, palette, soggetto, chiave, sfocatura = 6 }) {
  const casuale = generatoreCasuale(chiave)
  const tavolozza = PALETTE[palette] ?? PALETTE.notte

  const fondo = await sharp(Buffer.from(svgFondo(larghezza, altezza, tavolozza, casuale)))
    .blur(Math.max(larghezza, altezza) / 100)
    .toBuffer()

  const strati = []
  const forme = formeSoggetto(soggetto, casuale)

  if (forme) {
    // Luce di contorno: la stessa forma nel colore d'accento, molto sfocata,
    // sommata al fondo. È ciò che dà l'impressione del veicolo controluce.
    strati.push({
      input: await sharp(Buffer.from(svgSoggetto(larghezza, altezza, forme, tavolozza.accento, 0.5)))
        .blur(sfocatura * 6)
        .toBuffer(),
      blend: 'screen',
    })

    // La sagoma vera, scura e appena ammorbidita sui bordi.
    strati.push({
      input: await sharp(Buffer.from(svgSoggetto(larghezza, altezza, forme, tavolozza.fondo, 0.88)))
        .blur(sfocatura)
        .toBuffer(),
      blend: 'over',
    })

    // Un accenno di carrozzeria: la stessa forma nel colore del veicolo, tenue,
    // per non lasciare la sagoma completamente piatta.
    strati.push({
      input: await sharp(Buffer.from(svgSoggetto(larghezza, altezza, forme, tavolozza.corpo, 0.32)))
        .blur(sfocatura * 2.5)
        .toBuffer(),
      blend: 'over',
    })
  }

  strati.push({
    input: Buffer.from(svgRiflesso(larghezza, altezza, tavolozza, casuale)),
    blend: 'over',
  })
  strati.push({ input: await grana(larghezza, altezza), blend: 'overlay' })

  await mkdir(dirname(percorso), { recursive: true })

  await sharp(fondo)
    .composite(strati)
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(percorso)
}

/** Vero se il file esiste già e non è stato chiesto di rifarlo. */
async function daSaltare(percorso) {
  if (RIGENERA_TUTTO) return false
  try {
    await access(percorso)
    return true
  } catch {
    return false
  }
}

/* ── Elenco delle immagini ──────────────────────────────────────────────── */

/**
 * Veicoli del catalogo iniziale.
 *
 * Gli slug devono combaciare con quelli di `src/dati/veicoli.ts`: alla fine
 * dell'esecuzione lo script rilegge quel file e segnala gli slug rimasti senza
 * fotografie, così una scheda nuova non finisce online con i riquadri vuoti.
 */
const VEICOLI = [
  { slug: 'audi-a4-avant-40-tdi-quattro', tipo: 'auto', palette: 'antracite' },
  { slug: 'bmw-serie-3-320e-msport', tipo: 'auto', palette: 'notte' },
  { slug: 'mercedes-benz-glc-300-de-4matic', tipo: 'auto', palette: 'argento' },
  { slug: 'porsche-718-cayman-gts-4-0', tipo: 'auto', palette: 'rosso' },
  { slug: 'volkswagen-golf-1-5-etsi-life', tipo: 'auto', palette: 'bianco' },
  { slug: 'fiat-500e-la-prima', tipo: 'auto', palette: 'verde' },
  { slug: 'jeep-avenger-e-hybrid-altitude', tipo: 'auto', palette: 'blu' },
  { slug: 'toyota-yaris-cross-hybrid-lounge', tipo: 'auto', palette: 'bronzo' },
  { slug: 'mini-cooper-s-cabrio', tipo: 'auto', palette: 'blu' },
  { slug: 'fiat-panda-1-0-hybrid', tipo: 'auto', palette: 'argento' },
  { slug: 'volkswagen-t-roc-2-0-tdi-style', tipo: 'auto', palette: 'notte' },
  { slug: 'renault-clio-tce-90-evolution', tipo: 'auto', palette: 'rosso' },
  { slug: 'ducati-monster-937', tipo: 'moto', palette: 'rosso' },
  { slug: 'bmw-r-1300-gs-trophy', tipo: 'moto', palette: 'blu' },
  { slug: 'yamaha-mt-07', tipo: 'moto', palette: 'ghiaccio' },
  { slug: 'honda-africa-twin-crf1100l', tipo: 'moto', palette: 'bianco' },
  { slug: 'vespa-gts-300-super', tipo: 'moto', palette: 'blu' },
  { slug: 'kawasaki-ninja-zx-6r', tipo: 'moto', palette: 'verde' },
  { slug: 'harley-davidson-nightster', tipo: 'moto', palette: 'antracite' },
]

/** Le quattro inquadrature di ogni veicolo, nell'ordine della galleria. */
const INQUADRATURE = ['profilo', 'ruota', 'faro', 'ambiente']

const SERVIZI = [
  { nome: 'vendita-auto', soggetto: 'auto', palette: 'notte' },
  { nome: 'vendita-moto', soggetto: 'moto', palette: 'rosso' },
  { nome: 'noleggio-auto', soggetto: 'auto', palette: 'blu' },
  { nome: 'noleggio-moto', soggetto: 'moto', palette: 'ghiaccio' },
  { nome: 'detailing', soggetto: 'goccia', palette: 'blu' },
  { nome: 'lavaggio', soggetto: 'goccia', palette: 'ghiaccio' },
  { nome: 'sanificazione', soggetto: 'astratto', palette: 'ghiaccio' },
  { nome: 'lucidatura', soggetto: 'ruota', palette: 'argento' },
  { nome: 'ceramica', soggetto: 'goccia', palette: 'blu' },
  { nome: 'finanziamenti', soggetto: 'astratto', palette: 'antracite' },
  { nome: 'permuta', soggetto: 'auto', palette: 'argento' },
  { nome: 'assistenza', soggetto: 'officina', palette: 'officina' },
]

const DETAILING = [
  { nome: 'lavaggio-premium', soggetto: 'goccia', palette: 'ghiaccio' },
  { nome: 'lavaggio-interni', soggetto: 'astratto', palette: 'antracite' },
  { nome: 'sanificazione', soggetto: 'astratto', palette: 'ghiaccio' },
  { nome: 'lucidatura', soggetto: 'ruota', palette: 'argento' },
  { nome: 'ceramica', soggetto: 'goccia', palette: 'blu' },
  { nome: 'protezione-vernice', soggetto: 'auto', palette: 'notte' },
  { nome: 'wrapping', soggetto: 'auto', palette: 'verde' },
  { nome: 'ripristino-fari', soggetto: 'faro', palette: 'ghiaccio' },
  { nome: 'pulizia-pelle', soggetto: 'astratto', palette: 'bronzo' },
  { nome: 'pulizia-tessuti', soggetto: 'astratto', palette: 'antracite' },
]

/** Coppie prima/dopo: il «prima» è spento e opaco, il «dopo» brillante. */
const CONFRONTI = [
  { nome: 'interni', soggetto: 'astratto' },
  { nome: 'lucidatura', soggetto: 'ruota' },
  { nome: 'ceramica', soggetto: 'goccia' },
  { nome: 'wrapping', soggetto: 'auto' },
  { nome: 'fari', soggetto: 'faro' },
]

const BLOG = [
  { nome: 'auto-usata-garantita', soggetto: 'auto', palette: 'antracite' },
  { nome: 'ceramica', soggetto: 'goccia', palette: 'blu' },
  { nome: 'ibrida', soggetto: 'auto', palette: 'verde' },
  { nome: 'noleggio-acquisto', soggetto: 'auto', palette: 'argento' },
  { nome: 'estate-salsedine', soggetto: 'goccia', palette: 'ghiaccio' },
  { nome: 'patente-a2', soggetto: 'moto', palette: 'rosso' },
  { nome: 'elettriche-2026', soggetto: 'auto', palette: 'blu' },
]

const OFFERTE = [
  { nome: 'ceramica-omaggio', soggetto: 'goccia', palette: 'blu' },
  { nome: 'noleggio-lungo', soggetto: 'auto', palette: 'notte' },
  { nome: 'tasso-agevolato', soggetto: 'astratto', palette: 'antracite' },
]

const SQUADRA = ['luca', 'marta', 'salvatore', 'elena']

const AZIENDA_FOTO = [
  { nome: 'salone', soggetto: 'auto', palette: 'notte' },
  { nome: 'officina', soggetto: 'officina', palette: 'officina' },
  { nome: 'cabina', soggetto: 'goccia', palette: 'blu' },
]

/* ── Marchio e icone ────────────────────────────────────────────────────── */

/** Il simbolo del marchio, identico a quello disegnato in `Marchio.tsx`. */
function svgMarchio(dimensione = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="${dimensione}" height="${dimensione}">
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e59243"/>
      <stop offset="100%" stop-color="#9c5416"/>
    </linearGradient>
  </defs>
  <rect width="40" height="40" rx="9" fill="#0d0805"/>
  <path d="M20 2.5 34.5 8v12.6c0 8.2-5.9 14.4-14.5 16.9C11.4 35 5.5 28.8 5.5 20.6V8z" fill="url(#s)"/>
  <path d="M20 11.5 27.5 28h-4.2L20 20l-3.3 8h-4.2z" fill="#fff"/>
  <path d="M13.5 23.5h13" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>
</svg>`
}

/** Marchio orizzontale con il nome accanto al simbolo. */
function svgLogo() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 48" width="220" height="48">
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e59243"/>
      <stop offset="100%" stop-color="#9c5416"/>
    </linearGradient>
  </defs>
  <g transform="translate(4 4) scale(1)">
    <path d="M20 2.5 34.5 8v12.6c0 8.2-5.9 14.4-14.5 16.9C11.4 35 5.5 28.8 5.5 20.6V8z" fill="url(#s)"/>
    <path d="M20 11.5 27.5 28h-4.2L20 20l-3.3 8h-4.2z" fill="#fff"/>
  </g>
  <text x="52" y="27" font-family="Sora, Inter, Arial, sans-serif" font-size="17" font-weight="600" letter-spacing="3.4" fill="#14100c">AURORA</text>
  <text x="53" y="39" font-family="Inter, Arial, sans-serif" font-size="8" font-weight="500" letter-spacing="5" fill="#6a5f53">MOTORI</text>
</svg>`
}

async function generaMarchio() {
  const cartella = join(PUBBLICA, 'marchio')
  await mkdir(cartella, { recursive: true })

  const icona = join(cartella, 'icona.svg')
  if (!(await daSaltare(icona))) await writeFile(icona, svgMarchio(), 'utf8')

  const logo = join(cartella, 'logo.svg')
  if (!(await daSaltare(logo))) await writeFile(logo, svgLogo(), 'utf8')

  // Icone raster: servono al manifesto PWA e a iOS, che non accetta SVG.
  for (const lato of [192, 512]) {
    const percorso = join(cartella, `icona-${lato}.png`)
    if (await daSaltare(percorso)) continue
    await sharp(Buffer.from(svgMarchio(lato))).png().toFile(percorso)
  }

  const apple = join(RADICE, 'src', 'app', 'apple-icon.png')
  if (!(await daSaltare(apple))) {
    await sharp(Buffer.from(svgMarchio(180))).png().toFile(apple)
  }

  const iconaApp = join(RADICE, 'src', 'app', 'icon.svg')
  if (!(await daSaltare(iconaApp))) await writeFile(iconaApp, svgMarchio(), 'utf8')
}

/* ── Esecuzione ─────────────────────────────────────────────────────────── */

async function main() {
  const lavori = []

  // Apertura: tre fotogrammi che si alternano dietro il titolo.
  for (let indice = 1; indice <= 3; indice += 1) {
    lavori.push({
      percorso: join(USCITA, `apertura-${indice}.jpg`),
      larghezza: 1920,
      altezza: 1080,
      palette: indice === 2 ? 'rosso' : indice === 3 ? 'notte' : 'blu',
      soggetto: indice === 2 ? 'moto' : 'auto',
      chiave: `apertura-${indice}`,
      sfocatura: 7,
    })
  }

  lavori.push({
    percorso: join(USCITA, 'social.jpg'),
    larghezza: 1200,
    altezza: 630,
    palette: 'blu',
    soggetto: 'auto',
    chiave: 'social',
    sfocatura: 6,
  })

  for (const veicolo of VEICOLI) {
    INQUADRATURE.forEach((inquadratura, indice) => {
      lavori.push({
        percorso: join(USCITA, 'veicoli', `${veicolo.slug}-${indice + 1}.jpg`),
        larghezza: 1600,
        altezza: 1067,
        palette: veicolo.palette,
        soggetto:
          inquadratura === 'profilo'
            ? veicolo.tipo
            : inquadratura === 'ambiente'
              ? 'astratto'
              : inquadratura,
        chiave: `${veicolo.slug}-${inquadratura}`,
        sfocatura: inquadratura === 'profilo' ? 5 : 9,
      })
    })
  }

  for (const servizio of SERVIZI) {
    lavori.push({
      percorso: join(USCITA, 'servizi', `${servizio.nome}.jpg`),
      larghezza: 1200,
      altezza: 800,
      palette: servizio.palette,
      soggetto: servizio.soggetto,
      chiave: `servizio-${servizio.nome}`,
      sfocatura: 7,
    })
  }

  for (const trattamento of DETAILING) {
    lavori.push({
      percorso: join(USCITA, 'detailing', `${trattamento.nome}.jpg`),
      larghezza: 1200,
      altezza: 800,
      palette: trattamento.palette,
      soggetto: trattamento.soggetto,
      chiave: `detailing-${trattamento.nome}`,
      sfocatura: 7,
    })
  }

  for (const confronto of CONFRONTI) {
    // Il «prima» usa una palette spenta e una sfocatura maggiore: la differenza
    // si legge a colpo d'occhio anche senza guardare l'etichetta.
    lavori.push({
      percorso: join(USCITA, 'detailing', `${confronto.nome}-prima.jpg`),
      larghezza: 1200,
      altezza: 800,
      palette: 'antracite',
      soggetto: confronto.soggetto,
      chiave: `${confronto.nome}-prima`,
      sfocatura: 8,
    })
    lavori.push({
      percorso: join(USCITA, 'detailing', `${confronto.nome}-dopo.jpg`),
      larghezza: 1200,
      altezza: 800,
      palette: 'blu',
      soggetto: confronto.soggetto,
      chiave: `${confronto.nome}-dopo`,
      sfocatura: 4,
    })
  }

  for (const articolo of BLOG) {
    lavori.push({
      percorso: join(USCITA, 'blog', `${articolo.nome}.jpg`),
      larghezza: 1200,
      altezza: 675,
      palette: articolo.palette,
      soggetto: articolo.soggetto,
      chiave: `blog-${articolo.nome}`,
      sfocatura: 8,
    })
  }

  for (const offerta of OFFERTE) {
    lavori.push({
      percorso: join(USCITA, 'offerte', `${offerta.nome}.jpg`),
      larghezza: 1200,
      altezza: 800,
      palette: offerta.palette,
      soggetto: offerta.soggetto,
      chiave: `offerta-${offerta.nome}`,
      sfocatura: 8,
    })
  }

  for (const persona of SQUADRA) {
    lavori.push({
      percorso: join(USCITA, 'squadra', `${persona}.jpg`),
      larghezza: 800,
      altezza: 1000,
      palette: 'antracite',
      soggetto: 'ritratto',
      chiave: `squadra-${persona}`,
      sfocatura: 11,
    })
  }

  for (const foto of AZIENDA_FOTO) {
    lavori.push({
      percorso: join(USCITA, 'azienda', `${foto.nome}.jpg`),
      larghezza: 1400,
      altezza: 933,
      palette: foto.palette,
      soggetto: foto.soggetto,
      chiave: `azienda-${foto.nome}`,
      sfocatura: 8,
    })
  }

  const daFare = []
  for (const lavoro of lavori) {
    if (await daSaltare(lavoro.percorso)) continue
    daFare.push(lavoro)
  }

  console.log(
    `Immagini da generare: ${daFare.length} su ${lavori.length}` +
      (RIGENERA_TUTTO ? ' (rigenerazione completa)' : ''),
  )

  // Si procede a piccoli gruppi: sharp usa già più thread al suo interno, e
  // lanciare tutto insieme farebbe solo salire il consumo di memoria.
  const GRUPPO = 6
  for (let indice = 0; indice < daFare.length; indice += GRUPPO) {
    await Promise.all(daFare.slice(indice, indice + GRUPPO).map(componi))
    process.stdout.write(`  ${Math.min(indice + GRUPPO, daFare.length)}/${daFare.length}\r`)
  }

  await generaMarchio()
  await verificaSlug()

  console.log(`\nFatto. Immagini in ${USCITA}`)
}

/**
 * Controlla che ogni veicolo del catalogo abbia le sue fotografie.
 *
 * L'elenco `VEICOLI` qui sopra e quello di `src/dati/veicoli.ts` sono due file
 * distinti — uno JavaScript, l'altro TypeScript — e possono divergere quando si
 * aggiunge una scheda. Invece di fidarsi della memoria, si legge il sorgente e
 * si confrontano gli slug.
 */
async function verificaSlug() {
  try {
    const sorgente = await readFile(join(RADICE, 'src', 'dati', 'veicoli.ts'), 'utf8')
    const dichiarati = [...sorgente.matchAll(/slug:\s*'([^']+)'/g)].map((trovato) => trovato[1])
    const generati = new Set(VEICOLI.map((veicolo) => veicolo.slug))
    const mancanti = dichiarati.filter((slug) => !generati.has(slug))

    if (mancanti.length > 0) {
      console.warn(
        `\nAttenzione: questi veicoli non hanno fotografie generate:\n  ${mancanti.join('\n  ')}\n` +
          'Aggiungeteli all’elenco VEICOLI in scripts/genera-immagini.mjs.',
      )
    }
  } catch {
    // Il controllo è un aiuto, non un requisito: se il file non si legge si tira dritto.
  }
}

main().catch((errore) => {
  console.error(errore)
  process.exitCode = 1
})
