/**
 * Genera public/sitemap.xml dalle rotte pubbliche del sito.
 * Gli slug degli articoli sono letti da src/sito/dati/blog.ts, così la sitemap
 * resta allineata ai contenuti senza doverla aggiornare a mano.
 *
 * Uso: node scripts/genera-sitemap.mjs [https://dominio]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const radice = join(dirname(fileURLToPath(import.meta.url)), '..')
const sito = process.argv[2] ?? process.env.SITE_URL ?? 'https://ioriparotortoli.it'

const PAGINE = [
  { percorso: '/', priorita: '1.0', frequenza: 'weekly' },
  { percorso: '/servizi', priorita: '0.9', frequenza: 'monthly' },
  { percorso: '/preventivo', priorita: '0.9', frequenza: 'monthly' },
  { percorso: '/contatti', priorita: '0.8', frequenza: 'monthly' },
  { percorso: '/chi-siamo', priorita: '0.7', frequenza: 'yearly' },
  { percorso: '/galleria', priorita: '0.7', frequenza: 'monthly' },
  { percorso: '/stato-riparazione', priorita: '0.7', frequenza: 'monthly' },
  { percorso: '/prenota', priorita: '0.7', frequenza: 'monthly' },
  { percorso: '/tessera', priorita: '0.6', frequenza: 'monthly' },
  { percorso: '/blog', priorita: '0.7', frequenza: 'weekly' },
  { percorso: '/mappa-del-sito', priorita: '0.3', frequenza: 'yearly' },
  { percorso: '/privacy', priorita: '0.3', frequenza: 'yearly' },
  { percorso: '/cookie-policy', priorita: '0.3', frequenza: 'yearly' },
]

const servizi = readFileSync(join(radice, 'src/sito/dati/servizi.ts'), 'utf8')
const idServizi = [...servizi.matchAll(/^\s{4}id: '([^']+)',$/gm)].map((m) => m[1])

const blog = readFileSync(join(radice, 'src/sito/dati/blog.ts'), 'utf8')
const articoli = [...blog.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])
const date = [...blog.matchAll(/dataIso:\s*'([^']+)'/g)].map((m) => m[1])
const oggi = new Date().toISOString().slice(0, 10)

const voci = [
  ...PAGINE.map((p) => ({ ...p, aggiornata: oggi })),
  ...idServizi.map((id) => ({
    percorso: `/servizi/${id}`,
    priorita: '0.8',
    frequenza: 'monthly',
    aggiornata: oggi,
  })),
  ...articoli.map((slug, i) => ({
    percorso: `/blog/${slug}`,
    priorita: '0.6',
    frequenza: 'yearly',
    aggiornata: date[i] ?? oggi,
  })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${voci
  .map(
    (v) => `  <url>
    <loc>${sito}${v.percorso}</loc>
    <lastmod>${v.aggiornata}</lastmod>
    <changefreq>${v.frequenza}</changefreq>
    <priority>${v.priorita}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

writeFileSync(join(radice, 'public/sitemap.xml'), xml)
console.log(`sitemap.xml generata: ${voci.length} URL su ${sito}`)
