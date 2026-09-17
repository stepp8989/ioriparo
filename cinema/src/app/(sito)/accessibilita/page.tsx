import type { Metadata } from 'next'
import { Documento } from '@/componenti/ui/Documento'
import { metadatiPagina } from '@/lib/seo'
import { datiSito } from '@/lib/sito'

/**
 * Dichiarazione di accessibilità.
 *
 * Dichiara quello che il sito fa davvero e, soprattutto, quello che non fa
 * ancora: una dichiarazione che promette conformità piena senza un audit è
 * peggio che non averla, perché sposta su chi legge il costo di scoprire che
 * non è vero.
 */
export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Accessibilità',
    descrizione:
      'Come abbiamo costruito il sito perché sia utilizzabile da tastiera, con screen reader e con contrasto adeguato. E cosa manca ancora.',
    percorso: '/accessibilita',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaAccessibilita() {
  const { impostazioni } = await datiSito()

  return (
    <Documento titolo="Accessibilità" aggiornamento="settembre 2026">
      <p>
        Il sito è progettato seguendo le linee guida WCAG 2.2 con obiettivo di livello AA. Questa
        pagina dice cosa è stato fatto, cosa resta aperto e a chi scrivere quando qualcosa non
        funziona.
      </p>

      <h2>Cosa abbiamo fatto</h2>
      <ul>
        <li>
          <strong>Navigazione da tastiera completa.</strong> Ogni funzione, mappa dei posti
          compresa, si usa con Tab, frecce, Invio ed Esc. Il contorno di messa a fuoco è sempre
          visibile e non è stato rimosso da nessuna parte. Un collegamento «salta al contenuto» è
          il primo elemento raggiungibile di ogni pagina.
        </li>
        <li>
          <strong>Struttura semantica.</strong> Titoli in ordine gerarchico, elenchi veri, tabelle
          con intestazioni dichiarate, moduli con etichette collegate ai campi. Le schede a
          linguetta e la casella di ricerca seguono i modelli ARIA completi, frecce comprese.
        </li>
        <li>
          <strong>Contrasto.</strong> Le tonalità dell’accento cambiano fra tema chiaro e scuro
          proprio per mantenere il rapporto di contrasto minimo di 4,5:1 sul testo. Nessuna
          informazione è affidata al solo colore: gli stati dei posti hanno forma e legenda, gli
          errori dei moduli hanno un’icona e un testo.
        </li>
        <li>
          <strong>Movimento.</strong> Chi ha attivato la riduzione delle animazioni nel proprio
          sistema operativo vede il sito fermo: le transizioni si annullano e le rotazioni
          automatiche non partono.
        </li>
        <li>
          <strong>Testi alternativi.</strong> Le immagini decorative sono nascoste alle tecnologie
          assistive; i codici QR dei biglietti hanno una descrizione testuale, e il codice di
          prenotazione è sempre disponibile in chiaro accanto al QR per chi non può fotografarlo.
        </li>
      </ul>

      <h2>Cosa manca ancora</h2>
      <p>
        Non abbiamo ancora svolto un audit indipendente con utenti di tecnologie assistive: finché
        non sarà fatto, questa resta una dichiarazione di intenti verificata internamente, non una
        certificazione di conformità.
      </p>
      <ul>
        <li>
          La mappa della sala su schermi molto piccoli richiede lo zoom: stiamo lavorando a una
          modalità a elenco, fila per fila, che non richieda di ingrandire nulla.
        </li>
        <li>
          I trailer dipendono dai sottotitoli forniti dalla casa di distribuzione: dove mancano non
          possiamo aggiungerli.
        </li>
      </ul>

      <h2>In sala</h2>
      <p>
        Ogni sala ha posti riservati a chi usa la sedia a rotelle, con il posto
        dell’accompagnatore accanto e senza supplemento, prenotabili online come tutti gli altri. I
        servizi disponibili — accesso in piano, servizi igienici attrezzati, impianto per apparecchi
        acustici dove presente — sono indicati nella scheda di ciascun cinema.
      </p>

      <h2>Segnalazioni</h2>
      <p>
        Se incontri una barriera, scrivi a{' '}
        <a href={`mailto:${impostazioni.marchio.email}`}>{impostazioni.marchio.email}</a>{' '}
        descrivendo la pagina e cosa stavi cercando di fare. Rispondiamo entro dieci giorni
        lavorativi e, quando il problema blocca un acquisto, completiamo noi la prenotazione al
        telefono nel frattempo.
      </p>
    </Documento>
  )
}
