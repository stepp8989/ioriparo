'use client'

import { useEffect, useState } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Nota } from '@/componenti/ui/Sezione'
import { useAvvisi } from '@/componenti/ui/Avviso'
import { Area, Campo, Interruttore } from '@/componenti/ui/campi'
import { FORMATI, type Impostazioni } from '@/lib/tipi'
import { prezzo } from '@/lib/utili'

/**
 * Impostazioni generali.
 *
 * È la pagina che rende la piattaforma utilizzabile da un marchio diverso:
 * cambiando il nome qui cambiano l'intestazione, il piè di pagina, i biglietti,
 * le email e i titoli delle pagine, perché nessun altro file scrive il nome in
 * chiaro.
 *
 * I moduli si spengono singolarmente. Un cinema che non ha un banco
 * alimentari, o che non vuole un programma fedeltà, non deve trovarsi la voce
 * nel menu e il passo nel flusso d'acquisto: spegnendola sparisce ovunque,
 * senza toccare il codice.
 */
export default function PaginaImpostazioniAdmin() {
  const { mostra } = useAvvisi()

  const [dati, setDati] = useState<Impostazioni | null>(null)
  const [salvataggio, setSalvataggio] = useState(false)

  useEffect(() => {
    fetch('/api/admin/impostazioni', { cache: 'no-store' })
      .then((risposta) => risposta.json())
      .then((esito) => setDati(esito.impostazioni as Impostazioni))
      .catch(() => mostra('Non riusciamo a leggere le impostazioni.', 'errore'))
  }, [mostra])

  async function salva() {
    if (!dati) return
    setSalvataggio(true)

    try {
      const risposta = await fetch('/api/admin/impostazioni', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dati),
      })

      const esito = await risposta.json()

      if (!risposta.ok) {
        mostra(esito.errore ?? 'Salvataggio non riuscito.', 'errore')
        return
      }

      setDati(esito.impostazioni as Impostazioni)
      mostra('Impostazioni salvate. Il sito si aggiorna entro un paio di minuti.', 'ok')
    } finally {
      setSalvataggio(false)
    }
  }

  if (!dati) {
    return (
      <div className="space-y-4">
        <Scheletro className="h-10 w-64" />
        <Scheletro className="h-64 w-full rounded-ampio" />
      </div>
    )
  }

  const aggiorna = (parziale: Partial<Impostazioni>) => setDati({ ...dati, ...parziale })

  return (
    <div className="max-w-3xl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-titolo text-[1.8rem] font-semibold">Impostazioni</h1>
          <p className="mt-1.5 text-[0.9rem] text-tenue">
            Marchio, commissioni, supplementi e moduli attivi.
          </p>
        </div>

        <Bottone onClick={() => void salva()} disabled={salvataggio}>
          {salvataggio ? 'Salvataggio…' : 'Salva tutto'}
        </Bottone>
      </header>

      <div className="mt-8 space-y-8">
        {/* ── Marchio ───────────────────────────────────────────────────── */}
        <section className="rounded-ampio border border-bordo bg-superficie p-6">
          <h2 className="font-titolo text-[1.15rem] font-semibold">Marchio</h2>
          <p className="mt-1.5 text-[0.85rem] text-tenue">
            Il nome compare ovunque: intestazione, biglietti, email, titoli delle pagine.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Campo
              etichetta="Nome"
              value={dati.marchio.nome}
              onChange={(evento) =>
                aggiorna({ marchio: { ...dati.marchio, nome: evento.target.value } })
              }
            />
            <Campo
              etichetta="Claim"
              value={dati.marchio.claim}
              onChange={(evento) =>
                aggiorna({ marchio: { ...dati.marchio, claim: evento.target.value } })
              }
            />
            <Area
              etichetta="Descrizione"
              value={dati.marchio.descrizione}
              onChange={(evento) =>
                aggiorna({ marchio: { ...dati.marchio, descrizione: evento.target.value } })
              }
              aiuto="Usata nei metadati e nella condivisione sui social."
              rows={3}
            />
            <Campo
              etichetta="Dominio"
              value={dati.marchio.dominio}
              onChange={(evento) =>
                aggiorna({ marchio: { ...dati.marchio, dominio: evento.target.value } })
              }
              aiuto="Serve ai collegamenti nelle email e nella mappa del sito."
            />
            <Campo
              etichetta="Email pubblica"
              type="email"
              value={dati.marchio.email}
              onChange={(evento) =>
                aggiorna({ marchio: { ...dati.marchio, email: evento.target.value } })
              }
            />
            <Campo
              etichetta="Telefono"
              value={dati.marchio.telefono}
              onChange={(evento) =>
                aggiorna({ marchio: { ...dati.marchio, telefono: evento.target.value } })
              }
            />
          </div>
        </section>

        {/* ── Vendita ───────────────────────────────────────────────────── */}
        <section className="rounded-ampio border border-bordo bg-superficie p-6">
          <h2 className="font-titolo text-[1.15rem] font-semibold">Vendita</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Campo
              etichetta="Commissione per ordine (€)"
              type="number"
              step="0.1"
              min={0}
              max={20}
              value={dati.commissioneServizio}
              onChange={(evento) => aggiorna({ commissioneServizio: Number(evento.target.value) })}
              aiuto="Addebitata una volta sola, non per biglietto."
            />
            <Campo
              etichetta="Commissione per biglietto (€)"
              type="number"
              step="0.1"
              min={0}
              max={20}
              value={dati.commissionePerBiglietto}
              onChange={(evento) =>
                aggiorna({ commissionePerBiglietto: Number(evento.target.value) })
              }
              aiuto="Lasciala a zero se preferisci la commissione unica."
            />
            <Campo
              etichetta="Minuti di blocco dei posti"
              type="number"
              min={3}
              max={60}
              value={dati.minutiBloccoPosti}
              onChange={(evento) => aggiorna({ minutiBloccoPosti: Number(evento.target.value) })}
              aiuto="Quanto restano riservati i posti durante il pagamento."
            />
            <Campo
              etichetta="Chiusura vendita (minuti prima)"
              type="number"
              min={0}
              max={240}
              value={dati.chiusuraVenditaMinuti}
              onChange={(evento) => aggiorna({ chiusuraVenditaMinuti: Number(evento.target.value) })}
              aiuto="Dopo, i posti restano acquistabili solo in cassa."
            />
            <Campo
              etichetta="Posti massimi per ordine"
              type="number"
              min={1}
              max={50}
              value={dati.postiMassimiPerOrdine}
              onChange={(evento) => aggiorna({ postiMassimiPerOrdine: Number(evento.target.value) })}
            />
          </div>
        </section>

        {/* ── Supplementi ───────────────────────────────────────────────── */}
        <section className="rounded-ampio border border-bordo bg-superficie p-6">
          <h2 className="font-titolo text-[1.15rem] font-semibold">Supplementi</h2>
          <p className="mt-1.5 text-[0.85rem] text-tenue">
            Si sommano al prezzo base dello spettacolo. I posti riservati e quelli
            dell’accompagnatore restano senza supplemento: farli pagare sarebbe discriminatorio.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {FORMATI.map((formato) => (
              <Campo
                key={formato}
                etichetta={formato}
                type="number"
                step="0.5"
                min={0}
                max={50}
                value={dati.supplementiFormato[formato]}
                onChange={(evento) =>
                  aggiorna({
                    supplementiFormato: {
                      ...dati.supplementiFormato,
                      [formato]: Number(evento.target.value),
                    },
                  })
                }
              />
            ))}

            <Campo
              etichetta="Poltrona premium"
              type="number"
              step="0.5"
              min={0}
              max={50}
              value={dati.supplementiPosto.premium}
              onChange={(evento) =>
                aggiorna({
                  supplementiPosto: {
                    ...dati.supplementiPosto,
                    premium: Number(evento.target.value),
                  },
                })
              }
            />
          </div>
        </section>

        {/* ── Programma fedeltà ─────────────────────────────────────────── */}
        <section className="rounded-ampio border border-bordo bg-superficie p-6">
          <h2 className="font-titolo text-[1.15rem] font-semibold">Programma fedeltà</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Campo
              etichetta="Punti per euro speso"
              type="number"
              step="1"
              min={0}
              value={dati.puntiPerEuro}
              onChange={(evento) => aggiorna({ puntiPerEuro: Number(evento.target.value) })}
            />
            <Campo
              etichetta="Valore di un punto (€)"
              type="number"
              step="0.001"
              min={0}
              value={dati.valorePunto}
              onChange={(evento) => aggiorna({ valorePunto: Number(evento.target.value) })}
            />
          </div>

          <Nota className="mt-5" icona={<Icona nome="info" className="size-4" />}>
            Con questi valori, una spesa di {prezzo(10)} genera{' '}
            <strong className="text-testo">{Math.floor(10 * dati.puntiPerEuro)} punti</strong>, che
            valgono <strong className="text-testo">{prezzo(10 * dati.puntiPerEuro * dati.valorePunto)}</strong>{' '}
            — un ritorno del{' '}
            {((dati.puntiPerEuro * dati.valorePunto) * 100).toLocaleString('it-IT', {
              maximumFractionDigits: 1,
            })}
            % sul venduto. Tienilo presente: è un costo, non un’etichetta.
          </Nota>
        </section>

        {/* ── Moduli ────────────────────────────────────────────────────── */}
        <section className="rounded-ampio border border-bordo bg-superficie p-6">
          <h2 className="font-titolo text-[1.15rem] font-semibold">Moduli attivi</h2>
          <p className="mt-1.5 text-[0.85rem] text-tenue">
            Spegnendo un modulo spariscono la voce di menu, la pagina pubblica e il passo
            corrispondente nel flusso d’acquisto.
          </p>

          <div className="mt-5 space-y-2.5">
            {(
              [
                ['loyalty', 'Programma CLUB', 'Punti, livelli e premi.'],
                ['abbonamenti', 'Abbonamenti', 'Piani mensili e annuali.'],
                ['food', 'Food & Drink', 'Banco alimentari durante l’acquisto.'],
                ['giftCard', 'Gift card', 'Acquisto e utilizzo delle gift card.'],
                [
                  'registrazione',
                  'Registrazione clienti',
                  'Spegnendola resta possibile comprare come ospite.',
                ],
              ] as const
            ).map(([chiave, etichetta, descrizione]) => (
              <Interruttore
                key={chiave}
                etichetta={etichetta}
                descrizione={descrizione}
                attivo={dati.moduli[chiave]}
                onCambia={(valore) =>
                  aggiorna({ moduli: { ...dati.moduli, [chiave]: valore } })
                }
              />
            ))}
          </div>
        </section>

        {/* ── Social ────────────────────────────────────────────────────── */}
        <section className="rounded-ampio border border-bordo bg-superficie p-6">
          <h2 className="font-titolo text-[1.15rem] font-semibold">Profili social</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(['instagram', 'facebook', 'tiktok', 'youtube'] as const).map((rete) => (
              <Campo
                key={rete}
                etichetta={rete.charAt(0).toUpperCase() + rete.slice(1)}
                value={dati.social[rete]}
                onChange={(evento) =>
                  aggiorna({ social: { ...dati.social, [rete]: evento.target.value } })
                }
                aiuto="Lascia vuoto per non mostrarlo."
              />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 flex justify-end">
        <Bottone onClick={() => void salva()} disabled={salvataggio} misura="grande">
          {salvataggio ? 'Salvataggio…' : 'Salva tutto'}
        </Bottone>
      </div>
    </div>
  )
}
