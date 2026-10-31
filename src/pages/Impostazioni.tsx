import { useRef, useState } from 'react'
import { Check, Save, Trash2, Upload } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox, Campo, Input } from '@/components/ui/Form'
import { useIntestazione } from '@/components/layout/intestazione'
import { useGestionale } from '@/data/store'
import { regoleFedelta } from '@/lib/fedelta'
import { ImmagineNonValida, marchioRidotto } from '@/lib/immagine'
import type { Azienda, RegoleFedelta } from '@/types'

/**
 * Caricamento del marchio.
 *
 * Le due anteprime non sono un vezzo: il marchio compare sulla barra laterale,
 * che è scura, e sui documenti, che si stampano su carta bianca. Un logo con
 * le scritte scure sparisce nella prima, uno con le scritte bianche sparisce
 * nei secondi. Vedendoli affiancati ci si accorge subito di quale versione del
 * proprio marchio serve caricare.
 */
function CampoMarchio({
  logo,
  fondo,
  nota,
  ripiego,
  onCambia,
}: {
  logo?: string
  /** Su cosa verra' appoggiato: decide il colore dell'anteprima. */
  fondo: 'chiaro' | 'scuro'
  nota: string
  /** Marchio usato al posto di questo finche' non ne viene caricato uno. */
  ripiego?: string
  onCambia: (logo: string | undefined) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [errore, setErrore] = useState('')
  const mostrato = logo ?? ripiego

  async function scegli(files: FileList | null) {
    if (!files?.length) return
    setErrore('')
    try {
      onCambia(await marchioRidotto(files[0]))
    } catch (e) {
      setErrore(e instanceof ImmagineNonValida ? e.message : 'Non riesco a usare questa immagine.')
    }
  }

  return (
    <div>
      {mostrato ? (
        <div>
          <div
            className={`flex h-24 items-center justify-center rounded-card border border-line p-3 ${
              fondo === 'scuro' ? 'bg-[#12151b]' : 'bg-white'
            }`}
          >
            <img
              src={mostrato}
              alt="Marchio caricato"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <p className="mt-1 text-[11px] text-ink-faint">
            {logo ? nota : `${nota} — al momento si usa il marchio principale.`}
          </p>
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-line-soft bg-surface-2 px-4 py-6 text-center text-xs text-ink-faint">
          Nessun marchio caricato. I documenti stampati riportano il nome dell’attività scritto.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => input.current?.click()}>
          <Upload size={15} />
          {logo ? 'Sostituisci' : 'Carica marchio'}
        </Button>
        {logo && (
          <Button variante="fantasma" onClick={() => onCambia(undefined)}>
            <Trash2 size={15} />
            Rimuovi
          </Button>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void scegli(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {errore && (
        <p role="alert" className="mt-2 text-xs text-rose-400">
          {errore}
        </p>
      )}
      <p className="mt-2 text-[11px] text-ink-faint">
        PNG con lo sfondo trasparente è la scelta migliore. L’immagine viene rimpicciolita e salvata
        nel tuo archivio: ricordati di premere «Salva impostazioni».
      </p>
    </div>
  )
}

export function Impostazioni() {
  useIntestazione({
    titolo: 'Impostazioni',
    sottotitolo: 'Dati dell’attività e valori predefiniti dei documenti',
  })

  const { db, aggiornaAzienda } = useGestionale()
  const [form, setForm] = useState<Azienda>(db.azienda)
  const [salvato, setSalvato] = useState(false)

  const fedelta = regoleFedelta(form.fedelta)
  const cambiaFedelta = (modifiche: Partial<RegoleFedelta>) =>
    setForm({ ...form, fedelta: { ...fedelta, ...modifiche } })

  function salva() {
    aggiornaAzienda({
      ...form,
      fedelta: {
        ...fedelta,
        // Zero o vuoto non hanno senso come divisori: si torna a 1.
        euroPerPunto: Number(fedelta.euroPerPunto) > 0 ? Number(fedelta.euroPerPunto) : 1,
        puntiPremio: Number(fedelta.puntiPremio) > 0 ? Math.round(Number(fedelta.puntiPremio)) : 1,
        valorePremio: Math.max(0, Number(fedelta.valorePremio) || 0),
        scontoAmico: Math.max(0, Number(fedelta.scontoAmico) || 0),
        puntiPresentatore: Math.max(0, Math.round(Number(fedelta.puntiPresentatore) || 0)),
      },
      ivaPredefinita: Number(form.ivaPredefinita) || 0,
      giorniValiditaPreventivo: Number(form.giorniValiditaPreventivo) || 0,
    })
    setSalvato(true)
    window.setTimeout(() => setSalvato(false), 2500)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            titolo="Dati aziendali"
            sottotitolo="Compaiono su schede di accettazione, preventivi e fatture"
          />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo etichetta="Denominazione" className="sm:col-span-2">
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </Campo>
            <Campo etichetta="Claim" className="sm:col-span-2">
              <Input
                value={form.claim}
                onChange={(e) => setForm({ ...form, claim: e.target.value })}
              />
            </Campo>
            <Campo etichetta="Indirizzo">
              <Input
                value={form.indirizzo}
                onChange={(e) => setForm({ ...form, indirizzo: e.target.value })}
              />
            </Campo>
            <Campo etichetta="CAP e città">
              <Input
                value={form.citta}
                onChange={(e) => setForm({ ...form, citta: e.target.value })}
              />
            </Campo>
            <Campo etichetta="Telefono">
              <Input
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </Campo>
            <Campo etichetta="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Campo>
            {/* Due marchi e non uno: quello dei documenti finisce su carta
                bianca, quello del menu su fondo scuro. Con la sola versione
                scura, nel menu si vedeva un rettangolo bianco. */}
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Marchio</span>
              <CampoMarchio
                logo={form.logo}
                fondo="chiaro"
                nota="Sui documenti stampati"
                onCambia={(logo) => setForm({ ...form, logo })}
              />
            </div>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">
                Marchio per sfondi scuri
              </span>
              <CampoMarchio
                logo={form.logoChiaro}
                fondo="scuro"
                nota="Nel menu del gestionale"
                ripiego={form.logo}
                onCambia={(logoChiaro) => setForm({ ...form, logoChiaro })}
              />
            </div>
            <Campo etichetta="Partita IVA" className="sm:col-span-2">
              <Input
                value={form.partitaIva}
                onChange={(e) => setForm({ ...form, partitaIva: e.target.value })}
              />
            </Campo>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader titolo="Documenti" sottotitolo="Valori applicati ai nuovi documenti" />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo etichetta="IVA predefinita (%)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.ivaPredefinita}
                  onChange={(e) =>
                    setForm({ ...form, ivaPredefinita: Number(e.target.value) })
                  }
                />
              </Campo>
              <Campo etichetta="Validità preventivi (giorni)">
                <Input
                  type="number"
                  min={0}
                  value={form.giorniValiditaPreventivo}
                  onChange={(e) =>
                    setForm({ ...form, giorniValiditaPreventivo: Number(e.target.value) })
                  }
                />
              </Campo>
              <Campo
                etichetta="Prefisso codice riparazione"
                aiuto="Usato per numerare le accettazioni, es. #24-0001"
                className="sm:col-span-2"
              >
                <Input
                  value={form.prefissoCodice}
                  onChange={(e) => setForm({ ...form, prefissoCodice: e.target.value })}
                />
              </Campo>
            </div>
          </Card>

          <Card>
            <CardHeader
              titolo="Tessera fedeltà e «Porta un amico»"
              sottotitolo="Valgono per tutti i clienti: i saldi si ricalcolano con le regole in vigore"
            />
            <div className="mt-4">
              <Checkbox
                etichetta="Programma attivo sul sito e nel gestionale"
                checked={fedelta.attivo}
                onChange={(e) => cambiaFedelta({ attivo: e.target.checked })}
              />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo etichetta="Euro spesi per 1 punto" aiuto="Sulle riparazioni consegnate">
                <Input
                  type="number"
                  min={0.01}
                  step="any"
                  value={fedelta.euroPerPunto}
                  onChange={(e) => cambiaFedelta({ euroPerPunto: Number(e.target.value) })}
                />
              </Campo>
              <Campo etichetta="Punti per un buono">
                <Input
                  type="number"
                  min={1}
                  value={fedelta.puntiPremio}
                  onChange={(e) => cambiaFedelta({ puntiPremio: Number(e.target.value) })}
                />
              </Campo>
              <Campo etichetta="Valore del buono (€)">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={fedelta.valorePremio}
                  onChange={(e) => cambiaFedelta({ valorePremio: Number(e.target.value) })}
                />
              </Campo>
              <Campo etichetta="Sconto all’amico invitato (€)" aiuto="Sulla sua prima riparazione">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={fedelta.scontoAmico}
                  onChange={(e) => cambiaFedelta({ scontoAmico: Number(e.target.value) })}
                />
              </Campo>
              <Campo
                etichetta="Punti a chi invita"
                aiuto="Quando l’amico ritira la sua prima riparazione"
                className="sm:col-span-2"
              >
                <Input
                  type="number"
                  min={0}
                  value={fedelta.puntiPresentatore}
                  onChange={(e) => cambiaFedelta({ puntiPresentatore: Number(e.target.value) })}
                />
              </Campo>
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              Con queste regole il cliente recupera il{' '}
              {((fedelta.valorePremio / Math.max(1, fedelta.puntiPremio * (fedelta.euroPerPunto || 1))) * 100).toLocaleString('it-IT', { maximumFractionDigits: 1 })}
              % di quanto spende.
            </p>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {salvato && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <Check size={16} />
            Impostazioni salvate
          </span>
        )}
        <Button variante="primario" onClick={salva}>
          <Save size={15} />
          Salva impostazioni
        </Button>
      </div>

    </div>
  )
}
