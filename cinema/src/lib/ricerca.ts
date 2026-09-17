import type { Archivio, Cinema, Film } from '@/lib/tipi'
import { inSlug } from '@/lib/utili'

/**
 * Ricerca nel catalogo.
 *
 * Una sola funzione serve sia ai suggerimenti dell'intestazione sia alla
 * pagina dei risultati: due implementazioni divergerebbero al primo
 * aggiustamento, e il menu a tendina finirebbe per proporre qualcosa che la
 * pagina poi non trova.
 *
 * Il confronto avviene su testo normalizzato (`inSlug`): senza accenti, senza
 * maiuscole e senza punteggiatura. Chi cerca «nevischio» deve trovare
 * «Nevischio di marzo», e chi scrive «l orto» deve trovare «L’orto dei
 * semplici» con l'apostrofo tipografico.
 *
 * Non c'è ricerca fonetica né tolleranza agli errori di battitura: su un
 * catalogo di qualche decina di titoli non servirebbe a nulla se non a
 * produrre risultati sbagliati. Diventerà sensata quando il catalogo storico
 * arriverà a qualche migliaio di film, e allora il posto giusto sarà
 * l'indice del database, non questa funzione.
 */

export type Persona = { nome: string; ruolo: string; film: string[] }

export type EsitoRicerca = {
  film: Film[]
  persone: Persona[]
  cinema: Cinema[]
  generi: string[]
}

export function cercaNellArchivio(
  archivio: Archivio,
  termine: string,
  massimoPerTipo = 8,
): EsitoRicerca {
  const chiave = inSlug(termine.trim())
  if (chiave.length < 2) return { film: [], persone: [], cinema: [], generi: [] }

  const visibili = archivio.film.filter((film) => film.visibile && film.stato !== 'archivio')

  /* ── Film ────────────────────────────────────────────────────────────── */
  const film = visibili
    .map((voce) => {
      const titolo = inSlug(voce.titolo)
      const originale = inSlug(voce.titoloOriginale)

      // Il punteggio fa emergere la corrispondenza migliore: un titolo che
      // inizia con quello che si è scritto viene prima di uno che lo contiene
      // a metà, e un titolo prima di una corrispondenza nella trama.
      let punteggio = 0
      if (titolo === chiave || originale === chiave) punteggio = 100
      else if (titolo.startsWith(chiave) || originale.startsWith(chiave)) punteggio = 80
      else if (titolo.includes(chiave) || originale.includes(chiave)) punteggio = 60
      else if (inSlug(voce.regista).includes(chiave)) punteggio = 45
      else if (voce.cast.some((attore) => inSlug(attore.nome).includes(chiave))) punteggio = 40
      else if (voce.generi.some((genere) => inSlug(genere).includes(chiave))) punteggio = 30
      else if (inSlug(voce.sinossi).includes(chiave)) punteggio = 12

      // A parità di punteggio vince quello ancora in sala: è quello che si può
      // andare a vedere stasera.
      if (punteggio > 0 && voce.stato === 'in-sala') punteggio += 5

      return { voce, punteggio }
    })
    .filter((riga) => riga.punteggio > 0)
    .sort((a, b) => b.punteggio - a.punteggio)
    .slice(0, massimoPerTipo)
    .map((riga) => riga.voce)

  /* ── Persone ─────────────────────────────────────────────────────────── */
  const indice = new Map<string, Persona>()

  const aggiungi = (nome: string, ruolo: string, titolo: string) => {
    if (!inSlug(nome).includes(chiave)) return
    const esistente = indice.get(nome)
    if (esistente) {
      if (!esistente.film.includes(titolo)) esistente.film.push(titolo)
      return
    }
    indice.set(nome, { nome, ruolo, film: [titolo] })
  }

  for (const voce of visibili) {
    aggiungi(voce.regista, 'Regia', voce.titolo)
    for (const attore of voce.cast) aggiungi(attore.nome, 'Interprete', voce.titolo)
  }

  /* ── Cinema e generi ─────────────────────────────────────────────────── */
  const cinema = archivio.cinema
    .filter((voce) => {
      if (!voce.visibile) return false
      const campi = inSlug(`${voce.nome} ${voce.citta} ${voce.provincia} ${voce.cap} ${voce.indirizzo}`)
      return campi.includes(chiave)
    })
    .slice(0, massimoPerTipo)

  const generi = [...new Set(visibili.flatMap((voce) => voce.generi))]
    .filter((genere) => inSlug(genere).includes(chiave))
    .slice(0, 4)

  return {
    film,
    persone: [...indice.values()].slice(0, massimoPerTipo),
    cinema,
    generi,
  }
}
