import type { Metadata } from 'next'
import { INDIRIZZO_COMPLETO, RISTORANTE } from '@/dati/ristorante'
import type { OrarioGiorno, Piatto, Recensione } from '@/lib/tipi'
import { NOMI_CATEGORIA } from '@/lib/tipi'
import { media } from '@/lib/utili'

/** Indirizzo di base del sito: in anteprima si adatta al dominio della piattaforma. */
export const BASE = new URL(
  process.env.NEXT_PUBLIC_SITO ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : RISTORANTE.sito),
)

/**
 * Costruisce i metadati di una pagina: titolo, descrizione, canonical,
 * Open Graph e Twitter Card, tutti coerenti fra loro.
 */
export function metadatiPagina({
  titolo,
  descrizione,
  percorso,
  immagine = '/immagini/ambienti/social.jpg',
  indicizza = true,
}: {
  titolo: string
  descrizione: string
  percorso: string
  immagine?: string
  indicizza?: boolean
}): Metadata {
  const url = new URL(percorso, BASE).toString()
  const titoloCompleto = `${titolo} | ${RISTORANTE.nomeCompleto}`

  return {
    title: titolo,
    description: descrizione,
    alternates: { canonical: url },
    robots: indicizza
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      url,
      siteName: RISTORANTE.nomeCompleto,
      title: titoloCompleto,
      description: descrizione,
      images: [{ url: immagine, width: 1200, height: 630, alt: RISTORANTE.nomeCompleto }],
    },
    twitter: {
      card: 'summary_large_image',
      title: titoloCompleto,
      description: descrizione,
      images: [immagine],
    },
  }
}

/** Converte «12:30 – 14:30» nella coppia richiesta da Schema.org. */
function fascia(testo: string): { apre: string; chiude: string } | null {
  const parti = testo.split(/[–-]/).map((valore) => valore.trim())
  if (parti.length !== 2) return null
  return { apre: parti[0], chiude: parti[1] }
}

const GIORNI_SCHEMA: Record<string, string> = {
  Lunedì: 'Monday',
  Martedì: 'Tuesday',
  Mercoledì: 'Wednesday',
  Giovedì: 'Thursday',
  Venerdì: 'Friday',
  Sabato: 'Saturday',
  Domenica: 'Sunday',
}

/**
 * Dati strutturati `Restaurant`: sono quelli che Google usa per la scheda del
 * ristorante, con indirizzo, orari, valutazione media e menù.
 */
export function schemaRistorante(orari: OrarioGiorno[], recensioni: Recensione[]) {
  const pubblicate = recensioni.filter((recensione) => recensione.pubblicata)
  const aperture = orari
    .filter((giorno) => !giorno.chiuso)
    .flatMap((giorno) =>
      [giorno.pranzo, giorno.cena]
        .filter((valore): valore is string => Boolean(valore))
        .map((valore) => {
          const orario = fascia(valore)
          if (!orario) return null
          return {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: GIORNI_SCHEMA[giorno.giorno] ?? giorno.giorno,
            opens: orario.apre,
            closes: orario.chiude,
          }
        })
        .filter(Boolean),
    )

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${BASE.origin}/#ristorante`,
    name: RISTORANTE.nomeCompleto,
    description: RISTORANTE.descrizione,
    url: BASE.origin,
    telephone: RISTORANTE.telefono,
    email: RISTORANTE.email,
    priceRange: RISTORANTE.fasciaPrezzo,
    servesCuisine: ['Italiana', 'Toscana', 'Contemporanea'],
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Contanti, Carte di credito, Bancomat',
    image: [new URL('/immagini/ambienti/social.jpg', BASE).toString()],
    logo: new URL('/marchio/logo.svg', BASE).toString(),
    hasMenu: new URL('/menu', BASE).toString(),
    acceptsReservations: new URL('/prenota', BASE).toString(),
    maximumAttendeeCapacity: RISTORANTE.postiSala,
    vatID: RISTORANTE.partitaIva,
    address: {
      '@type': 'PostalAddress',
      streetAddress: RISTORANTE.indirizzo.via,
      postalCode: RISTORANTE.indirizzo.cap,
      addressLocality: RISTORANTE.indirizzo.citta,
      addressRegion: RISTORANTE.indirizzo.provincia,
      addressCountry: RISTORANTE.indirizzo.nazione,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: RISTORANTE.indirizzo.latitudine,
      longitude: RISTORANTE.indirizzo.longitudine,
    },
    sameAs: [RISTORANTE.social.instagram, RISTORANTE.social.facebook, RISTORANTE.social.tripadvisor],
    openingHoursSpecification: aperture,
    ...(pubblicate.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: media(pubblicate.map((recensione) => recensione.voto)),
        reviewCount: pubblicate.length,
        bestRating: 5,
        worstRating: 1,
      },
      review: pubblicate.slice(0, 5).map((recensione) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: recensione.autore },
        datePublished: recensione.data,
        reviewBody: recensione.testo,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: recensione.voto,
          bestRating: 5,
          worstRating: 1,
        },
      })),
    }),
  }
}

/** Dati strutturati `Menu`: una sezione per categoria, con prezzi e allergeni. */
export function schemaMenu(piatti: Piatto[]) {
  const perCategoria = new Map<string, Piatto[]>()
  for (const piatto of piatti) {
    const elenco = perCategoria.get(piatto.categoria) ?? []
    elenco.push(piatto)
    perCategoria.set(piatto.categoria, elenco)
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: `Menù di ${RISTORANTE.nomeCompleto}`,
    inLanguage: 'it-IT',
    hasMenuSection: [...perCategoria.entries()].map(([categoria, elenco]) => ({
      '@type': 'MenuSection',
      name: NOMI_CATEGORIA[categoria as keyof typeof NOMI_CATEGORIA] ?? categoria,
      hasMenuItem: elenco.map((piatto) => ({
        '@type': 'MenuItem',
        name: piatto.nome,
        description: piatto.descrizione,
        image: new URL(piatto.immagine, BASE).toString(),
        offers: { '@type': 'Offer', price: piatto.prezzo, priceCurrency: 'EUR' },
        ...(piatto.allergeni.length > 0 && {
          suitableForDiet: [],
          nutrition: { '@type': 'NutritionInformation' },
          additionalProperty: piatto.allergeni.map((allergene) => ({
            '@type': 'PropertyValue',
            name: 'Allergene',
            value: allergene,
          })),
        }),
      })),
    })),
  }
}

/** Dati strutturati `BreadcrumbList` per la navigazione nei risultati di ricerca. */
export function schemaBriciole(voci: Array<{ nome: string; percorso: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: voci.map((voce, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: voce.nome,
      item: new URL(voce.percorso, BASE).toString(),
    })),
  }
}

/** Dati strutturati `FAQPage`. */
export function schemaFaq(voci: ReadonlyArray<{ domanda: string; risposta: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: voci.map((voce) => ({
      '@type': 'Question',
      name: voce.domanda,
      acceptedAnswer: { '@type': 'Answer', text: voce.risposta },
    })),
  }
}

/** Indirizzo postale leggibile, riutilizzato in più punti del sito. */
export const INDIRIZZO_TESTO = INDIRIZZO_COMPLETO
