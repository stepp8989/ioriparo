'use client'

import Link from 'next/link'
import { Caricamento, Errore, Riquadro, Scheda, TestataPagina, useRisorsa } from '@/componenti/admin/comuni'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { prezzo } from '@/lib/utili'

/**
 * Pagina iniziale del pannello.
 *
 * Mostra prima le cose che richiedono un'azione — richieste nuove, messaggi da
 * leggere, appuntamenti da confermare — e solo dopo i numeri di contesto: chi
 * apre il pannello la mattina vuole sapere cosa è arrivato, non quanti veicoli
 * ha in piazzale.
 */

type Statistiche = {
  riepilogo: {
    veicoli: number
    veicoliTotali: number
    auto: number
    moto: number
    inVetrina: number
    venduti: number
    valoreCatalogo: number
    richiesteNuove: number
    richiesteTotali: number
    noleggiAttivi: number
    noleggiTotali: number
    noleggiInCorso: number
    incassoNoleggi: number
    appuntamentiInAttesa: number
    appuntamentiTotali: number
    messaggiDaLeggere: number
    messaggiTotali: number
    clienti: number
    iscrittiNewsletter: number
    recensioni: number
    valutazioneMedia: number
    articoliPubblicati: number
    offerteAttive: number
  }
}

const SCORCIATOIE: Array<{ percorso: string; nome: string; icona: NomeIcona; testo: string }> = [
  { percorso: '/admin/veicoli', nome: 'Aggiungi un veicolo', icona: 'auto', testo: 'Nuova scheda in catalogo' },
  { percorso: '/admin/offerte', nome: 'Crea un’offerta', icona: 'euro', testo: 'Promozione in home' },
  { percorso: '/admin/blog', nome: 'Scrivi un articolo', icona: 'documento', testo: 'Nuovo contenuto per il blog' },
  { percorso: '/admin/orari', nome: 'Cambia gli orari', icona: 'orologio', testo: 'Aperture di salone e officina' },
]

export function Riepilogo() {
  const { dati, caricamento, errore, ricarica } = useRisorsa<Statistiche>('/api/statistiche')

  if (caricamento) return <Caricamento />
  if (errore || !dati) return <Errore testo={errore || 'Dati non disponibili.'} onRiprova={ricarica} />

  const r = dati.riepilogo

  return (
    <>
      <TestataPagina
        titolo="Riepilogo"
        descrizione="Cosa è arrivato e come sta andando la concessionaria."
      />

      {/* Da fare */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Riquadro
          etichetta="Richieste nuove"
          valore={r.richiesteNuove}
          nota={`${r.richiesteTotali} in tutto`}
          icona="chat"
          tono={r.richiesteNuove > 0 ? 'accento' : 'neutro'}
        />
        <Riquadro
          etichetta="Messaggi da leggere"
          valore={r.messaggiDaLeggere}
          nota={`${r.messaggiTotali} in tutto`}
          icona="posta"
          tono={r.messaggiDaLeggere > 0 ? 'ambra' : 'neutro'}
        />
        <Riquadro
          etichetta="Appuntamenti da confermare"
          valore={r.appuntamentiInAttesa}
          nota={`${r.appuntamentiTotali} in tutto`}
          icona="calendario"
          tono={r.appuntamentiInAttesa > 0 ? 'ambra' : 'neutro'}
        />
        <Riquadro
          etichetta="Noleggi in corso"
          valore={r.noleggiInCorso}
          nota={`${r.noleggiAttivi} attivi`}
          icona="chiave"
          tono={r.noleggiInCorso > 0 ? 'verde' : 'neutro'}
        />
      </div>

      {/* Numeri di contesto */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Riquadro
          etichetta="Veicoli in catalogo"
          valore={r.veicoli}
          nota={`${r.auto} auto · ${r.moto} moto`}
          icona="auto"
        />
        <Riquadro
          etichetta="Valore del piazzale"
          valore={prezzo(r.valoreCatalogo)}
          nota={`${r.venduti} già venduti`}
          icona="euro"
        />
        <Riquadro
          etichetta="Incasso noleggi"
          valore={prezzo(r.incassoNoleggi)}
          nota={`${r.noleggiTotali} prenotazioni`}
          icona="grafico"
        />
        <Riquadro
          etichetta="Valutazione media"
          valore={r.valutazioneMedia.toLocaleString('it-IT')}
          nota={`${r.recensioni} recensioni pubblicate`}
          icona="stella"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Scheda titolo="Scorciatoie" descrizione="Le operazioni che si fanno più spesso.">
          <div className="grid gap-3 sm:grid-cols-2">
            {SCORCIATOIE.map((voce) => (
              <Link
                key={voce.percorso}
                href={voce.percorso}
                className="group flex items-start gap-3 rounded-morbido border border-bordo p-4 transition-colors duration-300 hover:border-accento/50"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accento/10 text-accento transition-colors group-hover:bg-accento group-hover:text-white">
                  <Icona nome={voce.icona} className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.9rem] font-semibold">{voce.nome}</span>
                  <span className="mt-0.5 block text-[0.78rem] text-tenue">{voce.testo}</span>
                </span>
              </Link>
            ))}
          </div>
        </Scheda>

        <Scheda titolo="Stato del sito" descrizione="Cosa è pubblicato in questo momento.">
          <dl className="space-y-3">
            {[
              { voce: 'Veicoli in vetrina in home', valore: `${r.inVetrina}` },
              { voce: 'Veicoli nascosti', valore: `${r.veicoliTotali - r.veicoli}` },
              { voce: 'Offerte attive', valore: `${r.offerteAttive}` },
              { voce: 'Articoli pubblicati', valore: `${r.articoliPubblicati}` },
              { voce: 'Clienti registrati', valore: `${r.clienti}` },
              { voce: 'Iscritti alla newsletter', valore: `${r.iscrittiNewsletter}` },
            ].map((riga) => (
              <div
                key={riga.voce}
                className="flex items-baseline justify-between gap-4 border-b border-bordo pb-3 last:border-0 last:pb-0"
              >
                <dt className="text-[0.9rem] text-tenue">{riga.voce}</dt>
                <dd className="font-semibold tabellare">{riga.valore}</dd>
              </div>
            ))}
          </dl>
        </Scheda>
      </div>
    </>
  )
}
