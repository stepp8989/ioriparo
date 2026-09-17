'use client'

import { useState } from 'react'
import type { CatalogoAcquisto, RispostaConto } from '@/componenti/prenota/tipi'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { Nota } from '@/componenti/ui/Sezione'
import { Campo, Spunta } from '@/componenti/ui/campi'
import { NOMI_METODO_PUBBLICI } from '@/componenti/prenota/metodi'
import type { MetodoPagamento } from '@/lib/tipi'
import { classi, emailValida, prezzo, prezzoPieno } from '@/lib/utili'

/**
 * Ultimo passo: dati di contatto, sconti e pagamento.
 *
 * I dati della carta non compaiono da nessuna parte in questa schermata, e non
 * è una semplificazione: si inseriscono sulla pagina protetta del fornitore, e
 * questo permette di dire in modo verificabile che la piattaforma non li vede e
 * non li conserva.
 *
 * Il pulsante di pagamento mostra sempre l'importo esatto. Un pulsante che dice
 * solo «paga» costringe a risalire con gli occhi al riepilogo per sapere quanto
 * si sta per spendere.
 */

const ICONE_METODO: Partial<Record<MetodoPagamento, NomeIcona>> = {
  carta: 'carta',
  'apple-pay': 'portafoglio',
  'google-pay': 'portafoglio',
  paypal: 'moneta',
  cassa: 'biglietto',
}

export function Pagamento({
  catalogo,
  ospite,
  onOspite,
  promoCodice,
  onPromoCodice,
  giftCardCodice,
  onGiftCardCodice,
  puntiDaUsare,
  onPuntiDaUsare,
  esito,
  invio,
  onConcludi,
}: {
  catalogo: CatalogoAcquisto
  ospite: { nome: string; email: string; telefono: string }
  onOspite: (dati: { nome: string; email: string; telefono: string }) => void
  promoCodice: string
  onPromoCodice: (codice: string) => void
  giftCardCodice: string
  onGiftCardCodice: (codice: string) => void
  puntiDaUsare: number
  onPuntiDaUsare: (punti: number) => void
  esito: RispostaConto | null
  invio: boolean
  onConcludi: (metodo: string) => void
}) {
  const [promoDigitato, setPromoDigitato] = useState(promoCodice)
  const [giftDigitata, setGiftDigitata] = useState(giftCardCodice)
  const [metodo, setMetodo] = useState<MetodoPagamento>(catalogo.metodi[0] ?? 'cassa')
  const [condizioni, setCondizioni] = useState(false)
  const [erroriContatto, setErroriContatto] = useState<Record<string, string>>({})

  const cliente = catalogo.cliente
  const totale = esito?.conto.totale ?? 0
  const puntiDisponibili = cliente?.punti ?? 0
  const valorePunti = catalogo.impostazioni.valorePunto

  function verificaContatti(): boolean {
    if (cliente) return true

    const errori: Record<string, string> = {}
    if (!ospite.nome.trim()) errori.nome = 'Indica il nome per l’intestazione del biglietto.'
    if (!emailValida(ospite.email)) errori.email = 'Serve un indirizzo email valido: lì arriva il biglietto.'

    setErroriContatto(errori)
    return Object.keys(errori).length === 0
  }

  function paga() {
    if (!verificaContatti()) return
    if (!condizioni) return
    onConcludi(metodo)
  }

  return (
    <section>
      <h2 className="font-titolo text-[1.4rem] font-semibold">Ci siamo quasi</h2>

      {/* ── Contatti ─────────────────────────────────────────────────── */}
      {cliente ? (
        <Nota className="mt-5" icona={<Icona nome="utente" className="size-4" />}>
          Acquisto a nome di{' '}
          <strong className="text-testo">
            {cliente.nome} {cliente.cognome}
          </strong>
          . I biglietti finiranno nella tua area personale e a {cliente.email}.
        </Nota>
      ) : (
        <div className="mt-6">
          <h3 className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue">
            Dove mandiamo i biglietti
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo
              etichetta="Nome e cognome"
              richiesto
              value={ospite.nome}
              onChange={(evento) => onOspite({ ...ospite, nome: evento.target.value })}
              errore={erroriContatto.nome}
              autoComplete="name"
            />
            <Campo
              etichetta="Email"
              type="email"
              richiesto
              value={ospite.email}
              onChange={(evento) => onOspite({ ...ospite, email: evento.target.value })}
              errore={erroriContatto.email}
              autoComplete="email"
            />
            <Campo
              etichetta="Telefono"
              type="tel"
              value={ospite.telefono}
              onChange={(evento) => onOspite({ ...ospite, telefono: evento.target.value })}
              aiuto="Facoltativo: ci serve solo se dobbiamo avvisarti di un cambio."
              autoComplete="tel"
              className="sm:col-span-2"
            />
          </div>

          {catalogo.impostazioni.moduli.registrazione && (
            <p className="mt-3 text-[0.82rem] text-tenue">
              Hai un account?{' '}
              <a href="/area-personale" className="text-accento underline">
                Accedi
              </a>{' '}
              per usare punti e coupon.
            </p>
          )}
        </div>
      )}

      {/* ── Sconti ───────────────────────────────────────────────────── */}
      <div className="mt-8">
        <h3 className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue">
          Hai un codice?
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex gap-2">
              <Campo
                etichetta="Codice promo o coupon"
                value={promoDigitato}
                onChange={(evento) => setPromoDigitato(evento.target.value.toUpperCase())}
                placeholder="DUEPOSTI"
                className="flex-1"
              />
              <Bottone
                variante="tenue"
                onClick={() => onPromoCodice(promoDigitato.trim())}
                className="mt-7 shrink-0"
              >
                Applica
              </Bottone>
            </div>
            {esito?.promozione && (
              <p className="mt-2 flex items-center gap-1.5 text-[0.82rem] text-ok">
                <Icona nome="spunta" className="size-3.5" />
                {esito.promozione.titolo}
              </p>
            )}
            {esito?.coupon && (
              <p className="mt-2 flex items-center gap-1.5 text-[0.82rem] text-ok">
                <Icona nome="spunta" className="size-3.5" />
                Coupon {esito.coupon.codice} applicato
              </p>
            )}
          </div>

          {catalogo.impostazioni.moduli.giftCard && (
            <div>
              <div className="flex gap-2">
                <Campo
                  etichetta="Gift card"
                  value={giftDigitata}
                  onChange={(evento) => setGiftDigitata(evento.target.value.toUpperCase())}
                  placeholder="Codice a 12 caratteri"
                  className="flex-1"
                />
                <Bottone
                  variante="tenue"
                  onClick={() => onGiftCardCodice(giftDigitata.trim())}
                  className="mt-7 shrink-0"
                >
                  Applica
                </Bottone>
              </div>
              {esito?.giftCard && (
                <p className="mt-2 flex items-center gap-1.5 text-[0.82rem] text-ok">
                  <Icona nome="spunta" className="size-3.5" />
                  Credito disponibile {prezzoPieno(esito.giftCard.saldo)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Punti ──────────────────────────────────────────────────── */}
        {cliente && catalogo.impostazioni.moduli.loyalty && puntiDisponibili > 0 && (
          <div className="mt-5 rounded-morbido border border-bordo bg-superficie p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-[0.9rem]">
                <Icona nome="trofeo" className="size-4 text-accento" />
                Hai <strong>{puntiDisponibili} punti</strong> ({prezzoPieno(puntiDisponibili * valorePunti)})
              </p>

              <button
                type="button"
                onClick={() =>
                  onPuntiDaUsare(
                    puntiDaUsare > 0
                      ? 0
                      : Math.min(puntiDisponibili, Math.ceil(totale / Math.max(valorePunti, 0.0001))),
                  )
                }
                className={classi(
                  'rounded-tenue border px-4 py-2 text-[0.82rem] font-medium transition-colors',
                  puntiDaUsare > 0
                    ? 'border-accento bg-accento text-white'
                    : 'border-bordo text-tenue hover:border-accento hover:text-accento',
                )}
              >
                {puntiDaUsare > 0 ? 'Non usare i punti' : 'Usa i punti'}
              </button>
            </div>

            {puntiDaUsare > 0 && (
              <label className="mt-4 block">
                <span className="text-[0.8rem] text-tenue">
                  Punti da usare: <strong className="text-testo">{puntiDaUsare}</strong>
                </span>
                <input
                  type="range"
                  min={0}
                  max={puntiDisponibili}
                  step={10}
                  value={puntiDaUsare}
                  onChange={(evento) => onPuntiDaUsare(Number(evento.target.value))}
                  className="mt-2 w-full accent-[var(--accento)]"
                  aria-label="Punti da usare"
                />
              </label>
            )}
          </div>
        )}
      </div>

      {/* ── Metodo ───────────────────────────────────────────────────── */}
      <div className="mt-8">
        <h3 className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue">
          Come vuoi pagare
        </h3>

        {totale === 0 ? (
          <Nota tono="verde" className="mt-4" icona={<Icona nome="spunta" className="size-4" />}>
            Il credito che hai applicato copre l’intero importo: non c’è nulla da pagare. Premendo
            il pulsante qui sotto i biglietti vengono emessi subito.
          </Nota>
        ) : (
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {catalogo.metodi.map((voce) => (
              <button
                key={voce}
                type="button"
                onClick={() => setMetodo(voce)}
                aria-pressed={metodo === voce}
                className={classi(
                  'flex items-center gap-3 rounded-morbido border p-4 text-left transition-all duration-300',
                  metodo === voce
                    ? 'border-accento bg-accento/8'
                    : 'border-bordo bg-superficie hover:border-accento/50',
                )}
              >
                <Icona nome={ICONE_METODO[voce] ?? 'carta'} className="size-5 shrink-0 text-accento" />
                <span className="min-w-0">
                  <span className="block text-[0.92rem] font-medium">
                    {NOMI_METODO_PUBBLICI[voce]}
                  </span>
                  {voce === 'cassa' && (
                    <span className="mt-0.5 block text-[0.78rem] text-tenue">
                      Prenoti ora, paghi allo sportello prima dello spettacolo.
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Conferma ─────────────────────────────────────────────────── */}
      <div className="mt-8 space-y-4">
        <Spunta
          etichetta={
            <>
              Ho letto e accetto i{' '}
              <a href="/termini" target="_blank" className="text-accento underline">
                termini di vendita
              </a>{' '}
              e l’
              <a href="/privacy" target="_blank" className="text-accento underline">
                informativa privacy
              </a>
              .
            </>
          }
          descrizione="I biglietti per uno spettacolo a data fissa non prevedono il diritto di recesso."
          checked={condizioni}
          onChange={(evento) => setCondizioni(evento.target.checked)}
        />

        <Nota icona={<Icona nome="lucchetto" className="size-4" />}>
          I dati della carta si inseriscono sulla pagina protetta del fornitore di pagamento. Non
          passano dai nostri sistemi e non vengono conservati da noi.
        </Nota>

        <Bottone
          misura="grande"
          onClick={paga}
          disabled={invio || !condizioni || !esito}
          className="w-full"
        >
          {invio ? (
            'Un momento…'
          ) : totale === 0 ? (
            <>
              <Icona nome="biglietto" className="size-4" />
              Emetti i biglietti
            </>
          ) : (
            <>
              <Icona nome="lucchetto" className="size-4" />
              Paga {prezzo(totale)}
            </>
          )}
        </Bottone>

        <p className="text-center text-[0.78rem] text-tenue">
          I posti vengono bloccati solo ora, per{' '}
          {catalogo.impostazioni.minutiBloccoPosti} minuti, il tempo di completare il pagamento.
        </p>
      </div>
    </section>
  )
}
