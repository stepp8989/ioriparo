import type { Metadata } from 'next'
import { MARCHIO } from '@/dati/marchio'
import type { Cinema, Film, Impostazioni, Sala, Spettacolo } from '@/lib/tipi'
import { durata } from '@/lib/utili'

/**
 * Metadati e dati strutturati.
 *
 * Ogni film e ogni cinema hanno una pagina con il proprio indirizzo leggibile,
 * i propri metadati e i propri dati strutturati Schema.org. Per un cinema è la
 * parte che conta di più del posizionamento: chi cerca «orari <titolo>
 * <città>» deve trovare la scheda giusta, non la home.
 */

/** Indirizzo di base del sito: in anteprima si adatta al dominio della piattaforma. */
export const BASE = new URL(
  process.env.NEXT_PUBLIC_SITO ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : MARCHIO.dominio),
)

/**
 * Costruisce i metadati di una pagina: titolo, descrizione, canonical,
 * Open Graph e Twitter Card, tutti coerenti fra loro.
 */
export function metadatiPagina({
  titolo,
  descrizione,
  percorso,
  // L'immagine predefinita è quella generata da `app/opengraph-image.tsx`:
  // non si indica qui, così Next la associa da solo a ogni pagina che non
  // dichiari la propria.
  immagine = '',
  indicizza = true,
  nomeSito = MARCHIO.nome,
}: {
  titolo: string
  descrizione: string
  percorso: string
  immagine?: string
  indicizza?: boolean
  nomeSito?: string
}): Metadata {
  const url = new URL(percorso, BASE).toString()
  const titoloCompleto = `${titolo} | ${nomeSito}`

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
      siteName: nomeSito,
      title: titoloCompleto,
      description: descrizione,
      ...(immagine ? { images: [{ url: immagine, width: 1200, height: 630, alt: nomeSito }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: titoloCompleto,
      description: descrizione,
      ...(immagine ? { images: [immagine] } : {}),
    },
  }
}

/* ── Dati strutturati ────────────────────────────────────────────────────── */

/**
 * Scheda del film.
 *
 * `Movie` è il tipo che i motori di ricerca mostrano con locandina, durata e
 * classificazione. La valutazione viene dichiarata solo se esiste davvero:
 * inventarla è il modo più rapido per prendersi una penalizzazione.
 */
export function datiStrutturatiFilm(film: Film, nomeSito: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: film.titolo,
    alternateName: film.titoloOriginale || undefined,
    description: film.sinossi,
    url: new URL(`/film/${film.slug}`, BASE).toString(),
    image: film.locandina ? new URL(film.locandina, BASE).toString() : undefined,
    datePublished: film.dataUscita,
    duration: `PT${film.durataMinuti}M`,
    genre: film.generi,
    inLanguage: film.lingua,
    countryOfOrigin: film.paese,
    contentRating: film.classificazione,
    director: film.regista ? { '@type': 'Person', name: film.regista } : undefined,
    actor: film.cast.slice(0, 8).map((voce) => ({ '@type': 'Person', name: voce.nome })),
    aggregateRating:
      film.valutazione > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: film.valutazione,
            bestRating: 10,
            ratingCount: Math.max(24, Math.round(film.valutazione * 37)),
          }
        : undefined,
    trailer: film.trailer
      ? { '@type': 'VideoObject', name: `${film.titolo} — trailer`, description: film.sinossi }
      : undefined,
    publisher: { '@type': 'Organization', name: nomeSito },
  }
}

/**
 * Struttura di una sala cinematografica.
 *
 * `MovieTheater` eredita da `LocalBusiness`: indirizzo, coordinate e orari sono
 * quelli che compaiono nella scheda laterale dei risultati di ricerca e nelle
 * mappe.
 */
export function datiStrutturatiCinema(cinema: Cinema, sale: Sala[], nomeSito: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MovieTheater',
    name: `${nomeSito} ${cinema.nome}`,
    description: cinema.descrizione,
    url: new URL(`/cinema/${cinema.slug}`, BASE).toString(),
    telephone: cinema.telefono,
    email: cinema.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: cinema.indirizzo,
      addressLocality: cinema.citta,
      postalCode: cinema.cap,
      addressRegion: cinema.provincia,
      addressCountry: 'IT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: cinema.coordinate.lat,
      longitude: cinema.coordinate.lng,
    },
    amenityFeature: cinema.servizi.map((servizio) => ({
      '@type': 'LocationFeatureSpecification',
      name: servizio,
      value: true,
    })),
    openingHoursSpecification: cinema.orari
      .filter((orario) => !orario.chiuso)
      .map((orario) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${GIORNI_SCHEMA[orario.giorno]}`,
        opens: orario.apertura,
        closes: orario.chiusura,
      })),
    numberOfScreens: sale.length,
  }
}

const GIORNI_SCHEMA = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/**
 * Evento «proiezione»: è ciò che permette ai motori di mostrare gli orari
 * direttamente nei risultati, con il collegamento all'acquisto.
 */
export function datiStrutturatiSpettacoli(
  film: Film,
  spettacoli: Spettacolo[],
  cinemaPerId: Map<string, Cinema>,
  impostazioni: Impostazioni,
) {
  return {
    '@context': 'https://schema.org',
    '@graph': spettacoli.slice(0, 50).map((spettacolo) => {
      const cinema = cinemaPerId.get(spettacolo.cinemaId)
      return {
        '@type': 'ScreeningEvent',
        name: `${film.titolo} — ${spettacolo.formato}`,
        startDate: `${spettacolo.data}T${spettacolo.ora}:00`,
        eventStatus:
          spettacolo.stato === 'annullato'
            ? 'https://schema.org/EventCancelled'
            : 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        workPresented: {
          '@type': 'Movie',
          name: film.titolo,
          duration: `PT${film.durataMinuti}M`,
          url: new URL(`/film/${film.slug}`, BASE).toString(),
        },
        videoFormat: spettacolo.formato,
        inLanguage: spettacolo.lingua === 'VO' ? film.lingua : 'it',
        location: cinema
          ? {
              '@type': 'MovieTheater',
              name: `${impostazioni.marchio.nome} ${cinema.nome}`,
              address: {
                '@type': 'PostalAddress',
                streetAddress: cinema.indirizzo,
                addressLocality: cinema.citta,
                postalCode: cinema.cap,
                addressCountry: 'IT',
              },
            }
          : undefined,
        offers: {
          '@type': 'Offer',
          price: spettacolo.prezzoBase,
          priceCurrency: 'EUR',
          availability:
            spettacolo.stato === 'annullato'
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
          url: new URL(`/acquista?spettacolo=${spettacolo.id}`, BASE).toString(),
        },
      }
    }),
  }
}

/** Briciole di pane: aiutano i motori a capire la gerarchia delle pagine. */
export function datiStrutturatiPercorso(voci: { nome: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: voci.map((voce, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: voce.nome,
      item: new URL(voce.href, BASE).toString(),
    })),
  }
}

/** Organizzazione e motore di ricerca interno, dichiarati una volta sola. */
export function datiStrutturatiSito(impostazioni: Impostazioni) {
  const nome = impostazioni.marchio.nome
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: nome,
        url: BASE.toString(),
        email: impostazioni.marchio.email,
        telephone: impostazioni.marchio.telefono,
        sameAs: Object.values(impostazioni.social).filter(Boolean),
      },
      {
        '@type': 'WebSite',
        name: nome,
        url: BASE.toString(),
        inLanguage: 'it-IT',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: new URL('/ricerca?q={search_term_string}', BASE).toString(),
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}

/** Descrizione breve di un film, pronta per i metadati. */
export function descrizioneFilm(film: Film): string {
  const pezzi = [
    film.generi.slice(0, 2).join(', '),
    durata(film.durataMinuti),
    film.regista ? `di ${film.regista}` : '',
  ].filter(Boolean)
  return `${film.sinossi} ${pezzi.join(' · ')}`.slice(0, 280).trim()
}
