import type { Metadata } from 'next'
import { AZIENDA, INDIRIZZO_COMPLETO } from '@/dati/azienda'
import { DOMANDE_FREQUENTI } from '@/dati/contenuti'
import type { Articolo, OrarioGiorno, Recensione, Veicolo } from '@/lib/tipi'
import { NOMI_ALIMENTAZIONE, NOMI_CAMBIO } from '@/lib/tipi'
import { media, titoloVeicolo } from '@/lib/utili'

/** Indirizzo di base del sito: in anteprima si adatta al dominio della piattaforma. */
export const BASE = new URL(
  process.env.NEXT_PUBLIC_SITO ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : AZIENDA.sito),
)

/**
 * Costruisce i metadati di una pagina: titolo, descrizione, canonical,
 * Open Graph e Twitter Card, tutti coerenti fra loro.
 */
export function metadatiPagina({
  titolo,
  descrizione,
  percorso,
  immagine = '/immagini/social.jpg',
  indicizza = true,
}: {
  titolo: string
  descrizione: string
  percorso: string
  immagine?: string
  indicizza?: boolean
}): Metadata {
  const url = new URL(percorso, BASE).toString()
  const titoloCompleto = `${titolo} | ${AZIENDA.nomeCompleto}`

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
      siteName: AZIENDA.nomeCompleto,
      title: titoloCompleto,
      description: descrizione,
      images: [{ url: immagine, width: 1200, height: 630, alt: AZIENDA.nomeCompleto }],
    },
    twitter: {
      card: 'summary_large_image',
      title: titoloCompleto,
      description: descrizione,
      images: [immagine],
    },
  }
}

/* ── Dati strutturati ────────────────────────────────────────────────────── */

/** Converte «08:30 – 13:00» nella coppia richiesta da Schema.org. */
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

function aperture(orari: OrarioGiorno[]) {
  return orari
    .filter((giorno) => !giorno.chiuso)
    .flatMap((giorno) =>
      [giorno.mattina, giorno.pomeriggio]
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
}

/**
 * Dati strutturati `AutomotiveBusiness`: sono quelli che Google usa per la
 * scheda dell'attività, con indirizzo, orari, valutazione media e servizi.
 */
export function schemaAzienda(orari: OrarioGiorno[], recensioni: Recensione[]) {
  const pubblicate = recensioni.filter((recensione) => recensione.pubblicata)

  return {
    '@context': 'https://schema.org',
    '@type': ['AutomotiveBusiness', 'AutoDealer'],
    '@id': `${BASE.origin}/#azienda`,
    name: AZIENDA.nomeCompleto,
    legalName: AZIENDA.ragioneSociale,
    description: AZIENDA.descrizione,
    url: BASE.origin,
    telephone: AZIENDA.telefono,
    email: AZIENDA.email,
    priceRange: AZIENDA.fasciaPrezzo,
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Contanti, Carte di credito, Bonifico, Finanziamento',
    foundingDate: String(AZIENDA.fondata),
    vatID: AZIENDA.partitaIva,
    image: [new URL('/immagini/social.jpg', BASE).toString()],
    logo: new URL('/marchio/logo.svg', BASE).toString(),
    address: {
      '@type': 'PostalAddress',
      streetAddress: AZIENDA.indirizzo.via,
      postalCode: AZIENDA.indirizzo.cap,
      addressLocality: AZIENDA.indirizzo.citta,
      addressRegion: AZIENDA.indirizzo.provincia,
      addressCountry: AZIENDA.indirizzo.nazione,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: AZIENDA.indirizzo.latitudine,
      longitude: AZIENDA.indirizzo.longitudine,
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Ogliastra' },
      { '@type': 'AdministrativeArea', name: 'Sardegna' },
    ],
    sameAs: [
      AZIENDA.social.instagram,
      AZIENDA.social.facebook,
      AZIENDA.social.youtube,
      AZIENDA.social.linkedin,
    ],
    openingHoursSpecification: aperture(orari),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servizi',
      itemListElement: [
        'Vendita auto nuove e usate',
        'Vendita moto nuove e usate',
        'Noleggio auto',
        'Noleggio moto',
        'Car detailing',
        'Sanificazione interni',
        'Lucidatura carrozzeria',
        'Protezione ceramica',
        'Finanziamenti',
        'Permuta',
        'Assistenza post vendita',
      ].map((nome) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: nome },
      })),
    },
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

/**
 * Dati strutturati di un singolo veicolo.
 *
 * Google distingue `Car` da `Motorcycle`: usare il tipo giusto è ciò che
 * consente alla scheda di comparire fra i risultati per la vendita di veicoli,
 * con prezzo, chilometraggio e anno in evidenza.
 */
export function schemaVeicolo(veicolo: Veicolo) {
  const titolo = titoloVeicolo(veicolo)
  const url = new URL(`/catalogo/${veicolo.slug}`, BASE).toString()

  return {
    '@context': 'https://schema.org',
    '@type': veicolo.tipo === 'moto' ? 'Motorcycle' : 'Car',
    '@id': `${url}#veicolo`,
    name: titolo,
    description: veicolo.descrizione,
    url,
    image: veicolo.immagini.map((percorso) => new URL(percorso, BASE).toString()),
    brand: { '@type': 'Brand', name: veicolo.marca },
    model: veicolo.modello,
    vehicleConfiguration: veicolo.allestimento,
    productionDate: String(veicolo.anno),
    vehicleModelDate: String(veicolo.anno),
    color: veicolo.colore,
    itemCondition:
      veicolo.condizione === 'nuovo'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: veicolo.chilometri,
      unitCode: 'KMT',
    },
    vehicleTransmission: NOMI_CAMBIO[veicolo.cambio],
    fuelType: NOMI_ALIMENTAZIONE[veicolo.alimentazione],
    vehicleEngine: {
      '@type': 'EngineSpecification',
      enginePower: { '@type': 'QuantitativeValue', value: veicolo.potenzaKw, unitCode: 'KWT' },
      ...(veicolo.cilindrata > 0 && {
        engineDisplacement: {
          '@type': 'QuantitativeValue',
          value: veicolo.cilindrata,
          unitCode: 'CMQ',
        },
      }),
    },
    ...(veicolo.tipo === 'auto' && {
      numberOfDoors: veicolo.porte,
      vehicleSeatingCapacity: veicolo.posti,
      bodyType: veicolo.tipologia,
    }),
    ...(veicolo.emissioniCo2 > 0 && {
      emissionsCO2: veicolo.emissioniCo2,
      meetsEmissionStandard: veicolo.classeEmissioni,
    }),
    offers: {
      '@type': 'Offer',
      price: veicolo.prezzo,
      priceCurrency: 'EUR',
      availability:
        veicolo.stato === 'disponibile'
          ? 'https://schema.org/InStock'
          : veicolo.stato === 'prenotato'
            ? 'https://schema.org/PreOrder'
            : 'https://schema.org/SoldOut',
      itemCondition:
        veicolo.condizione === 'nuovo'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
      url,
      seller: { '@id': `${BASE.origin}/#azienda` },
    },
  }
}

/** Dati strutturati di un articolo del blog. */
export function schemaArticolo(articolo: Articolo) {
  const url = new URL(`/blog/${articolo.slug}`, BASE).toString()

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#articolo`,
    headline: articolo.titolo,
    description: articolo.sommario,
    url,
    image: [new URL(articolo.immagine, BASE).toString()],
    datePublished: articolo.data,
    dateModified: articolo.data,
    inLanguage: 'it-IT',
    keywords: articolo.tag.join(', '),
    wordCount: articolo.contenuto.split(/\s+/).length,
    author: { '@type': 'Person', name: articolo.autore },
    publisher: {
      '@type': 'Organization',
      name: AZIENDA.nomeCompleto,
      logo: { '@type': 'ImageObject', url: new URL('/marchio/logo.svg', BASE).toString() },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
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

/** Dati strutturati `FAQPage`, alimentati dalle domande frequenti. */
export function schemaFaq(
  voci: ReadonlyArray<{ domanda: string; risposta: string }> = DOMANDE_FREQUENTI,
) {
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

/** Elenco di veicoli, per far capire ai motori che il catalogo è una raccolta. */
export function schemaCatalogo(veicoli: Veicolo[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Catalogo veicoli — ${AZIENDA.nomeCompleto}`,
    numberOfItems: veicoli.length,
    itemListElement: veicoli.slice(0, 30).map((veicolo, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      url: new URL(`/catalogo/${veicolo.slug}`, BASE).toString(),
      name: titoloVeicolo(veicolo),
    })),
  }
}

/** Indirizzo postale leggibile, riutilizzato in più punti del sito. */
export const INDIRIZZO_TESTO = INDIRIZZO_COMPLETO
