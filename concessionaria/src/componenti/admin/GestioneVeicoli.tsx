'use client'

import Image from 'next/image'
import { useMemo, useState, type FormEvent } from 'react'
import {
  Azione,
  Caricamento,
  conferma,
  Errore,
  esportaCsv,
  invia,
  TestataPagina,
  useRisorsa,
  Vuoto,
} from '@/componenti/admin/comuni'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Area, Campo, Esito, Scelta, Spunta } from '@/componenti/ui/campi'
import { Etichetta } from '@/componenti/ui/Sezione'
import {
  ALIMENTAZIONI,
  CAMBI,
  CONDIZIONI,
  NOMI_ALIMENTAZIONE,
  NOMI_CAMBIO,
  NOMI_CONDIZIONE,
  NOMI_STATO_VEICOLO,
  NOMI_TIPOLOGIA,
  STATI_VEICOLO,
  TIPI_VEICOLO,
  TIPOLOGIE_AUTO,
  TIPOLOGIE_MOTO,
  type Veicolo,
} from '@/lib/tipi'
import { chilometri, classi, numero, prezzo, titoloVeicolo } from '@/lib/utili'

/**
 * Gestione del catalogo.
 *
 * L'elenco mostra tutto — anche i veicoli nascosti — perché è il posto in cui
 * si va a ripescare una scheda tolta dal sito. Visibilità, vetrina e stato si
 * cambiano direttamente dalla riga, senza aprire la scheda: sono le tre
 * modifiche che si fanno dieci volte al giorno.
 */
export function GestioneVeicoli() {
  const { dati, caricamento, errore, ricarica } = useRisorsa<{ veicoli: Veicolo[] }>('/api/veicoli')
  const [inModifica, setInModifica] = useState<Veicolo | 'nuovo' | null>(null)
  const [filtro, setFiltro] = useState('')
  const [avviso, setAvviso] = useState('')

  const veicoli = useMemo(() => {
    const elenco = dati?.veicoli ?? []
    const cerca = filtro.trim().toLowerCase()
    if (!cerca) return elenco
    return elenco.filter((veicolo) =>
      `${veicolo.marca} ${veicolo.modello} ${veicolo.allestimento} ${veicolo.anno}`
        .toLowerCase()
        .includes(cerca),
    )
  }, [dati, filtro])

  async function alterna(veicolo: Veicolo, modifica: Partial<Veicolo>) {
    const esito = await invia('/api/veicoli', 'PATCH', { id: veicolo.id, ...modifica })
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  async function elimina(veicolo: Veicolo) {
    if (!conferma(`Eliminare definitivamente «${titoloVeicolo(veicolo)}»?`)) return
    const esito = await invia(`/api/veicoli?id=${encodeURIComponent(veicolo.id)}`, 'DELETE')
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  if (caricamento) return <Caricamento />

  return (
    <>
      <TestataPagina
        titolo="Veicoli"
        descrizione="Auto e moto in catalogo, comprese quelle nascoste dal sito."
        azione={
          <div className="flex flex-wrap gap-2">
            <Bottone
              variante="contorno"
              misura="piccola"
              onClick={() =>
                esportaCsv(
                  'veicoli',
                  (dati?.veicoli ?? []).map((veicolo) => ({
                    marca: veicolo.marca,
                    modello: veicolo.modello,
                    allestimento: veicolo.allestimento,
                    anno: veicolo.anno,
                    km: veicolo.chilometri,
                    prezzo: veicolo.prezzo,
                    condizione: veicolo.condizione,
                    stato: veicolo.stato,
                    visibile: veicolo.visibile ? 'sì' : 'no',
                  })),
                )
              }
            >
              <Icona nome="scarica" className="size-4" />
              Esporta CSV
            </Bottone>

            <Bottone misura="piccola" onClick={() => setInModifica('nuovo')}>
              <Icona nome="piu" className="size-4" />
              Nuovo veicolo
            </Bottone>
          </div>
        }
      />

      <Errore testo={errore || avviso} onRiprova={ricarica} />

      <div className="mb-5 relative max-w-sm">
        <Icona
          nome="cerca"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-tenue"
        />
        <input
          type="search"
          value={filtro}
          onChange={(evento) => setFiltro(evento.target.value)}
          placeholder="Cerca marca o modello…"
          aria-label="Cerca fra i veicoli"
          className="w-full rounded-full border border-bordo bg-superficie py-2.5 pr-4 pl-11 text-[0.9rem] focus:border-accento focus:outline-none"
        />
      </div>

      {veicoli.length === 0 ? (
        <Vuoto testo="Nessun veicolo corrisponde alla ricerca." />
      ) : (
        <div className="space-y-3">
          {veicoli.map((veicolo) => (
            <article
              key={veicolo.id}
              className={classi(
                'flex flex-wrap items-center gap-4 rounded-ampio border border-bordo bg-superficie p-4',
                !veicolo.visibile && 'opacity-60',
              )}
            >
              <div className="relative aspect-[3/2] w-28 shrink-0 overflow-hidden rounded-tenue bg-antracite">
                {veicolo.immagini[0] && (
                  <Image
                    src={veicolo.immagini[0]}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-[12rem] flex-1">
                <p className="text-[0.72rem] tracking-[0.14em] text-accento uppercase">
                  {veicolo.marca}
                </p>
                <p className="font-semibold">
                  {veicolo.modello} {veicolo.allestimento}
                </p>
                <p className="mt-1 text-[0.82rem] text-tenue tabellare">
                  {veicolo.anno} · {chilometri(veicolo.chilometri)} ·{' '}
                  {NOMI_ALIMENTAZIONE[veicolo.alimentazione]} · {veicolo.potenzaCv} CV
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Etichetta>{NOMI_CONDIZIONE[veicolo.condizione]}</Etichetta>
                <Etichetta
                  tono={
                    veicolo.stato === 'disponibile'
                      ? 'verde'
                      : veicolo.stato === 'prenotato'
                        ? 'ambra'
                        : 'rosso'
                  }
                >
                  {NOMI_STATO_VEICOLO[veicolo.stato]}
                </Etichetta>
                {veicolo.noleggio && <Etichetta tono="accento">Noleggio</Etichetta>}
              </div>

              <p className="w-28 text-right font-titolo text-[1.15rem] font-semibold tabellare">
                {prezzo(veicolo.prezzo)}
              </p>

              <div className="flex gap-2">
                <Azione
                  icona={veicolo.visibile ? 'occhio' : 'occhioBarrato'}
                  etichetta={veicolo.visibile ? 'Nascondi dal sito' : 'Mostra sul sito'}
                  onClick={() => alterna(veicolo, { visibile: !veicolo.visibile })}
                />
                <Azione
                  icona="stella"
                  etichetta={veicolo.inVetrina ? 'Togli dalla vetrina' : 'Metti in vetrina'}
                  attivo={veicolo.inVetrina}
                  onClick={() => alterna(veicolo, { inVetrina: !veicolo.inVetrina })}
                />
                <Azione
                  icona="matita"
                  etichetta="Modifica"
                  tono="accento"
                  onClick={() => setInModifica(veicolo)}
                />
                <Azione
                  icona="cestino"
                  etichetta="Elimina"
                  tono="rosso"
                  onClick={() => elimina(veicolo)}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <Finestra
        aperta={inModifica !== null}
        onChiudi={() => setInModifica(null)}
        titolo={inModifica === 'nuovo' ? 'Nuovo veicolo' : 'Modifica veicolo'}
      >
        {inModifica && (
          <ModuloVeicolo
            veicolo={inModifica === 'nuovo' ? null : inModifica}
            onSalvato={async () => {
              setInModifica(null)
              await ricarica()
            }}
          />
        )}
      </Finestra>
    </>
  )
}

/* ── Modulo di modifica ──────────────────────────────────────────────────── */

function ModuloVeicolo({
  veicolo,
  onSalvato,
}: {
  veicolo: Veicolo | null
  onSalvato: () => void | Promise<void>
}) {
  const [tipo, setTipo] = useState(veicolo?.tipo ?? 'auto')
  const [conNoleggio, setConNoleggio] = useState(Boolean(veicolo?.noleggio))
  const [messaggio, setMessaggio] = useState('')
  const [salvataggio, setSalvataggio] = useState(false)

  const tipologie = tipo === 'moto' ? TIPOLOGIE_MOTO : TIPOLOGIE_AUTO

  async function salva(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvataggio) return

    const modulo = new FormData(evento.currentTarget)
    const testo = (nome: string) => String(modulo.get(nome) ?? '').trim()
    const num = (nome: string) => Number(modulo.get(nome) ?? 0)

    const corpo = {
      id: veicolo?.id,
      tipo,
      marca: testo('marca'),
      modello: testo('modello'),
      allestimento: testo('allestimento'),
      anno: num('anno'),
      chilometri: num('chilometri'),
      prezzo: num('prezzo'),
      prezzoPrecedente: testo('prezzoPrecedente') ? num('prezzoPrecedente') : null,
      condizione: testo('condizione'),
      alimentazione: testo('alimentazione'),
      cambio: testo('cambio'),
      tipologia: testo('tipologia'),
      potenzaCv: num('potenzaCv'),
      potenzaKw: num('potenzaKw'),
      cilindrata: num('cilindrata'),
      posti: num('posti'),
      porte: num('porte'),
      colore: testo('colore'),
      consumoMisto: num('consumoMisto'),
      emissioniCo2: num('emissioniCo2'),
      classeEmissioni: testo('classeEmissioni'),
      autonomiaKm: testo('autonomiaKm') ? num('autonomiaKm') : null,
      garanziaMesi: num('garanziaMesi'),
      descrizione: testo('descrizione'),
      // Dotazioni e immagini si scrivono una per riga: è il modo più rapido di
      // incollare un elenco arrivato per email.
      dotazioni: testo('dotazioni').split('\n').map((riga) => riga.trim()).filter(Boolean),
      immagini: testo('immagini').split('\n').map((riga) => riga.trim()).filter(Boolean),
      video: testo('video') || null,
      stato: testo('stato'),
      inVetrina: modulo.get('inVetrina') === 'on',
      visibile: modulo.get('visibile') === 'on',
      noleggio: conNoleggio
        ? {
            giornaliera: num('giornaliera'),
            settimanale: num('settimanale'),
            mensile: num('mensile'),
            cauzione: num('cauzione'),
            kmInclusiGiorno: num('kmInclusiGiorno'),
            etaMinima: num('etaMinima'),
            consegnaDomicilio: modulo.get('consegnaDomicilio') === 'on',
          }
        : null,
    }

    setSalvataggio(true)
    setMessaggio('')

    const esito = await invia('/api/veicoli', veicolo ? 'PUT' : 'POST', corpo)
    setSalvataggio(false)

    if (!esito.ok) {
      setMessaggio(esito.errore)
      return
    }

    await onSalvato()
  }

  return (
    <form onSubmit={salva} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Scelta
          etichetta="Tipo"
          name="tipo"
          value={tipo}
          onChange={(evento) => setTipo(evento.target.value as 'auto' | 'moto')}
        >
          {TIPI_VEICOLO.map((voce) => (
            <option key={voce} value={voce}>
              {voce === 'auto' ? 'Auto' : 'Moto'}
            </option>
          ))}
        </Scelta>

        <Scelta etichetta="Tipologia" name="tipologia" defaultValue={veicolo?.tipologia}>
          {tipologie.map((voce) => (
            <option key={voce} value={voce}>
              {NOMI_TIPOLOGIA[voce]}
            </option>
          ))}
        </Scelta>

        <Campo etichetta="Marca" name="marca" required defaultValue={veicolo?.marca} />
        <Campo etichetta="Modello" name="modello" required defaultValue={veicolo?.modello} />
        <Campo
          etichetta="Allestimento"
          name="allestimento"
          defaultValue={veicolo?.allestimento}
          className="sm:col-span-2"
        />

        <Campo
          etichetta="Anno"
          name="anno"
          type="number"
          min={1950}
          max={new Date().getFullYear() + 2}
          required
          defaultValue={veicolo?.anno ?? new Date().getFullYear()}
        />
        <Campo
          etichetta="Chilometri"
          name="chilometri"
          type="number"
          min={0}
          required
          defaultValue={veicolo?.chilometri ?? 0}
        />

        <Campo
          etichetta="Prezzo (€)"
          name="prezzo"
          type="number"
          min={0}
          step={50}
          required
          defaultValue={veicolo?.prezzo ?? 0}
        />
        <Campo
          etichetta="Prezzo precedente (€)"
          name="prezzoPrecedente"
          type="number"
          min={0}
          step={50}
          defaultValue={veicolo?.prezzoPrecedente ?? ''}
          nota="Lasciate vuoto se non è in promozione."
        />

        <Scelta etichetta="Condizione" name="condizione" defaultValue={veicolo?.condizione}>
          {CONDIZIONI.map((voce) => (
            <option key={voce} value={voce}>
              {NOMI_CONDIZIONE[voce]}
            </option>
          ))}
        </Scelta>
        <Scelta etichetta="Stato" name="stato" defaultValue={veicolo?.stato}>
          {STATI_VEICOLO.map((voce) => (
            <option key={voce} value={voce}>
              {NOMI_STATO_VEICOLO[voce]}
            </option>
          ))}
        </Scelta>

        <Scelta etichetta="Alimentazione" name="alimentazione" defaultValue={veicolo?.alimentazione}>
          {ALIMENTAZIONI.map((voce) => (
            <option key={voce} value={voce}>
              {NOMI_ALIMENTAZIONE[voce]}
            </option>
          ))}
        </Scelta>
        <Scelta etichetta="Cambio" name="cambio" defaultValue={veicolo?.cambio}>
          {CAMBI.map((voce) => (
            <option key={voce} value={voce}>
              {NOMI_CAMBIO[voce]}
            </option>
          ))}
        </Scelta>

        <Campo
          etichetta="Potenza (CV)"
          name="potenzaCv"
          type="number"
          min={0}
          defaultValue={veicolo?.potenzaCv ?? 0}
        />
        <Campo
          etichetta="Potenza (kW)"
          name="potenzaKw"
          type="number"
          min={0}
          step={0.5}
          defaultValue={veicolo?.potenzaKw ?? 0}
        />
        <Campo
          etichetta="Cilindrata (cm³)"
          name="cilindrata"
          type="number"
          min={0}
          defaultValue={veicolo?.cilindrata ?? 0}
        />
        <Campo etichetta="Colore" name="colore" defaultValue={veicolo?.colore} />

        <Campo
          etichetta="Posti"
          name="posti"
          type="number"
          min={1}
          max={9}
          defaultValue={veicolo?.posti ?? (tipo === 'moto' ? 2 : 5)}
        />
        <Campo
          etichetta="Porte"
          name="porte"
          type="number"
          min={0}
          max={7}
          defaultValue={veicolo?.porte ?? (tipo === 'moto' ? 0 : 5)}
        />

        <Campo
          etichetta="Consumo misto"
          name="consumoMisto"
          type="number"
          min={0}
          step={0.1}
          defaultValue={veicolo?.consumoMisto ?? 0}
          nota="l/100 km, oppure kWh/100 km sulle elettriche."
        />
        <Campo
          etichetta="Emissioni CO₂ (g/km)"
          name="emissioniCo2"
          type="number"
          min={0}
          defaultValue={veicolo?.emissioniCo2 ?? 0}
        />
        <Campo
          etichetta="Classe emissioni"
          name="classeEmissioni"
          defaultValue={veicolo?.classeEmissioni ?? 'Euro 6'}
        />
        <Campo
          etichetta="Autonomia elettrica (km)"
          name="autonomiaKm"
          type="number"
          min={0}
          defaultValue={veicolo?.autonomiaKm ?? ''}
          nota="Solo elettriche e ibride plug-in."
        />
        <Campo
          etichetta="Garanzia (mesi)"
          name="garanziaMesi"
          type="number"
          min={0}
          max={120}
          defaultValue={veicolo?.garanziaMesi ?? 24}
        />
      </div>

      <Area
        etichetta="Descrizione"
        name="descrizione"
        rows={5}
        defaultValue={veicolo?.descrizione}
      />

      <Area
        etichetta="Dotazioni"
        name="dotazioni"
        rows={6}
        defaultValue={veicolo?.dotazioni.join('\n')}
        nota="Una per riga."
      />

      <Area
        etichetta="Immagini"
        name="immagini"
        rows={4}
        defaultValue={veicolo?.immagini.join('\n')}
        nota="Un percorso per riga, es. /immagini/veicoli/audi-a4-1.jpg. La prima è la copertina."
      />

      <Campo etichetta="Video" name="video" defaultValue={veicolo?.video ?? ''} nota="Facoltativo." />

      <div className="space-y-3 rounded-morbido border border-bordo p-5">
        <Spunta
          name="visibile"
          etichetta="Visibile sul sito"
          defaultChecked={veicolo ? veicolo.visibile : true}
        />
        <Spunta
          name="inVetrina"
          etichetta="In vetrina nella home"
          defaultChecked={veicolo?.inVetrina ?? false}
        />
        <Spunta
          etichetta="Disponibile anche a noleggio"
          checked={conNoleggio}
          onChange={(evento) => setConNoleggio(evento.target.checked)}
        />
      </div>

      {conNoleggio && (
        <div className="grid gap-4 rounded-morbido border border-bordo p-5 sm:grid-cols-2">
          <Campo
            etichetta="Tariffa giornaliera (€)"
            name="giornaliera"
            type="number"
            min={0}
            defaultValue={veicolo?.noleggio?.giornaliera ?? 0}
          />
          <Campo
            etichetta="Tariffa settimanale (€)"
            name="settimanale"
            type="number"
            min={0}
            defaultValue={veicolo?.noleggio?.settimanale ?? 0}
          />
          <Campo
            etichetta="Tariffa mensile (€)"
            name="mensile"
            type="number"
            min={0}
            defaultValue={veicolo?.noleggio?.mensile ?? 0}
          />
          <Campo
            etichetta="Cauzione (€)"
            name="cauzione"
            type="number"
            min={0}
            defaultValue={veicolo?.noleggio?.cauzione ?? 0}
          />
          <Campo
            etichetta="Km inclusi al giorno"
            name="kmInclusiGiorno"
            type="number"
            min={0}
            defaultValue={veicolo?.noleggio?.kmInclusiGiorno ?? 150}
          />
          <Campo
            etichetta="Età minima"
            name="etaMinima"
            type="number"
            min={18}
            max={80}
            defaultValue={veicolo?.noleggio?.etaMinima ?? 21}
          />
          <Spunta
            name="consegnaDomicilio"
            etichetta="Consegna a domicilio disponibile"
            defaultChecked={veicolo?.noleggio?.consegnaDomicilio ?? true}
            className="sm:col-span-2"
          />
        </div>
      )}

      <Esito testo={messaggio} tipo="errore" />

      <div className="flex justify-end gap-3">
        <Bottone type="submit" disabled={salvataggio}>
          {salvataggio ? 'Salvataggio…' : veicolo ? 'Salva le modifiche' : 'Crea il veicolo'}
        </Bottone>
      </div>

      {veicolo && (
        <p className="text-[0.78rem] text-tenue">
          Indirizzo pubblico: <span className="font-medium">/catalogo/{veicolo.slug}</span> —
          resta invariato anche cambiando marca o modello, per non rompere i collegamenti già
          condivisi. Prezzo attuale in catalogo: {numero(veicolo.prezzo)} €.
        </p>
      )}
    </form>
  )
}
