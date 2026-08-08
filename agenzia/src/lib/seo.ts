import { AGENZIA, DOMINIO, LISTINO } from '@/dati/agenzia'
import { SERVIZI } from '@/dati/servizi'
import { DOMANDE } from '@/dati/contenuti'

/** Indirizzo di base, usato da `metadataBase`, sitemap e dati strutturati. */
export const BASE = new URL(DOMINIO)

/** Indirizzo assoluto di una pagina interna. */
export function assoluto(percorso: string): string {
  return new URL(percorso, BASE).toString()
}

/**
 * Dati strutturati della home.
 *
 * Un unico grafo con l'attività, il sito, il catalogo dei servizi e le domande
 * frequenti. Google li usa per la scheda nei risultati di ricerca e per le
 * domande espandibili; sono scritti a partire dagli stessi dati che
 * alimentano le pagine, così non possono divergere dal contenuto visibile —
 * cosa che Google penalizza.
 */
export function datiStrutturati() {
  const idAttivita = `${DOMINIO}/#studio`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': idAttivita,
        name: AGENZIA.nomeCompleto,
        alternateName: AGENZIA.nome,
        description: AGENZIA.descrizione,
        url: DOMINIO,
        email: AGENZIA.email,
        telephone: AGENZIA.telefono,
        foundingDate: String(AGENZIA.fondato),
        priceRange: '€€',
        address: {
          '@type': 'PostalAddress',
          addressLocality: AGENZIA.sede.citta,
          addressRegion: AGENZIA.sede.provincia,
          addressCountry: AGENZIA.sede.nazione,
        },
        areaServed: { '@type': 'Country', name: 'Italia' },
        sameAs: Object.values(AGENZIA.social),
        knowsAbout: SERVIZI.map((servizio) => servizio.titolo),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Realizzazione siti web',
          itemListElement: LISTINO.map((voce) => ({
            '@type': 'Offer',
            name: voce.nome,
            description: voce.descrizione,
            price: voce.da,
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'PriceSpecification',
              minPrice: voce.da,
              priceCurrency: 'EUR',
              valueAddedTaxIncluded: false,
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${DOMINIO}/#sito`,
        url: DOMINIO,
        name: AGENZIA.nomeCompleto,
        inLanguage: 'it-IT',
        publisher: { '@id': idAttivita },
      },
      {
        '@type': 'FAQPage',
        '@id': `${DOMINIO}/#domande`,
        mainEntity: DOMANDE.map((voce) => ({
          '@type': 'Question',
          name: voce.domanda,
          acceptedAnswer: { '@type': 'Answer', text: voce.risposta },
        })),
      },
    ],
  }
}
