import type { Metadata } from 'next'
import { FiglioRivelato, GruppoRivelato } from '@/componenti/animazioni/Rivela'
import { Simulatore } from '@/componenti/finanziamenti/Simulatore'
import { Invito } from '@/componenti/home/Offerte'
import { ModuloRichiesta } from '@/componenti/moduli/ModuloRichiesta'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { AZIENDA } from '@/dati/azienda'
import { metadatiPagina, schemaBriciole } from '@/lib/seo'
import { percentuale } from '@/lib/utili'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Finanziamenti e permuta',
  descrizione:
    'Simulatore di rata online, finanziamenti a tasso fisso con più istituti di credito, leasing ' +
    'per partite IVA e valutazione gratuita del vostro usato in permuta entro quarantotto ore.',
  percorso: '/finanziamenti',
})

const FORMULE: Array<{ icona: NomeIcona; titolo: string; testo: string; punti: string[] }> = [
  {
    icona: 'calcolatrice',
    titolo: 'Rata fissa classica',
    testo:
      'La formula più semplice: rata costante per tutta la durata, alla fine il veicolo è vostro senza altri passaggi.',
    punti: ['Da 24 a 84 mesi', 'Tasso fisso, rata invariabile', 'Estinzione anticipata sempre possibile'],
  },
  {
    icona: 'euro',
    titolo: 'Maxirata finale',
    testo:
      'Rate mensili più basse e un importo maggiore all’ultima scadenza, che potete pagare, rifinanziare o coprire restituendo il veicolo.',
    punti: ['Rate fino al 40% più basse', 'Tre strade alla scadenza', 'Ideale su nuovo e km 0'],
  },
  {
    icona: 'documento',
    titolo: 'Leasing per partite IVA',
    testo:
      'Canoni deducibili e IVA detraibile secondo la normativa vigente, con riscatto finale concordato all’inizio.',
    punti: ['Vantaggi fiscali per l’impresa', 'Anticipo e riscatto su misura', 'Anche su veicoli commerciali'],
  },
]

const PASSAGGI_PERMUTA = [
  {
    numero: '01',
    titolo: 'Ci mandate i dati',
    testo: 'Marca, modello, anno, chilometri e qualche fotografia. Bastano cinque minuti.',
  },
  {
    numero: '02',
    titolo: 'Valutiamo',
    testo:
      'Confrontiamo le quotazioni di mercato reali, non tabelle interne. Rispondiamo entro quarantotto ore.',
  },
  {
    numero: '03',
    titolo: 'Confermiamo dal vivo',
    testo:
      'Un controllo in officina conferma la valutazione. Se il veicolo è come descritto, la cifra non cambia.',
  },
  {
    numero: '04',
    titolo: 'Ci occupiamo di tutto',
    testo:
      'Passaggio di proprietà, radiazione dell’eventuale finanziamento in corso e pratiche: le facciamo noi.',
  },
]

export default function PaginaFinanziamenti() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            schemaBriciole([{ nome: 'Finanziamenti', percorso: '/finanziamenti' }]),
          ),
        }}
      />

      <Intestazione
        soprattitolo="Finanziamenti e permuta"
        titolo={
          <>
            La rata giusta,
            <br />
            <span className="testo-accento">non la prima che capita</span>
          </>
        }
        sottotitolo="Lavoriamo con più istituti di credito e confrontiamo le proposte al posto vostro. Simulate la rata qui sotto e ricevete il preventivo firmato entro ventiquattro ore."
        immagine="/immagini/servizi/finanziamenti.jpg"
        briciole={[{ nome: 'Finanziamenti', percorso: '/finanziamenti' }]}
      />

      {/* Simulatore */}
      <Sezione id="simulatore" className="bg-sfondo">
        <TitoloSezione
          soprattitolo="Simulatore"
          titolo={
            <>
              Calcolate la <span className="testo-accento">vostra rata</span>
            </>
          }
          sottotitolo={`TAN fisso ${percentuale(AZIENDA.finanziamento.tanPredefinito)}, TAEG ${percentuale(AZIENDA.finanziamento.taegPredefinito)}. Muovete i cursori: il risultato si aggiorna mentre scegliete.`}
        />

        <div className="mt-14">
          <Simulatore />
        </div>
      </Sezione>

      {/* Formule */}
      <Sezione className="border-y border-bordo bg-sfondo-alt">
        <TitoloSezione
          soprattitolo="Le formule"
          titolo="Tre modi di finanziare"
          sottotitolo="Quale conviene dipende da quanto tenete il veicolo, da quanti chilometri fate e da come è intestato."
        />

        <GruppoRivelato className="mt-14 grid gap-6 lg:grid-cols-3">
          {FORMULE.map((formula) => (
            <FiglioRivelato
              key={formula.titolo}
              className="flex h-full flex-col rounded-ampio border border-bordo bg-superficie p-7 shadow-morbida"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accento/10 text-accento">
                <Icona nome={formula.icona} className="size-5" />
              </span>
              <h3 className="mt-5 font-titolo text-[1.2rem] font-semibold">{formula.titolo}</h3>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-tenue">{formula.testo}</p>
              <ul className="mt-5 space-y-2.5 border-t border-bordo pt-5 text-[0.88rem]">
                {formula.punti.map((punto) => (
                  <li key={punto} className="flex items-start gap-2.5">
                    <Icona nome="spunta" className="mt-0.5 size-3.5 shrink-0 text-accento" />
                    {punto}
                  </li>
                ))}
              </ul>
            </FiglioRivelato>
          ))}
        </GruppoRivelato>
      </Sezione>

      {/* Permuta */}
      <Sezione id="permuta" className="relative overflow-hidden bg-notte text-white">
        <div className="griglia-tecnica absolute inset-0" aria-hidden />

        <div className="relative grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <TitoloSezione
              soprattitolo="Permuta"
              titolo={
                <>
                  Quanto vale
                  <br />
                  <span className="testo-accento">il vostro usato</span>
                </>
              }
              sottotitolo="Valutazione gratuita entro quarantotto ore, basata sulle quotazioni di mercato. Ritiriamo anche in conto vendita, se preferite aspettare l’offerta giusta."
              allineamento="sinistra"
              chiaro
            />

            <GruppoRivelato className="mt-12 space-y-8">
              {PASSAGGI_PERMUTA.map((passaggio) => (
                <FiglioRivelato key={passaggio.numero} className="flex gap-6">
                  <span className="font-titolo text-[1.5rem] leading-none font-semibold text-accento tabellare">
                    {passaggio.numero}
                  </span>
                  <div className="border-l border-white/10 pl-6">
                    <h3 className="font-titolo text-[1.05rem] font-semibold">{passaggio.titolo}</h3>
                    <p className="mt-1.5 text-[0.9rem] leading-relaxed text-white/60">
                      {passaggio.testo}
                    </p>
                  </div>
                </FiglioRivelato>
              ))}
            </GruppoRivelato>
          </div>

          <div className="rounded-ampio border border-white/10 bg-white/5 p-7 backdrop-blur-sm sm:p-9">
            <h3 className="font-titolo text-[1.35rem] font-semibold">Richiedete la valutazione</h3>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-white/60">
              È gratuita e non impegna. Se la cifra vi convince, il resto lo facciamo noi.
            </p>

            <div className="mt-7 [&_label]:text-white/55 [&_input]:border-white/15 [&_input]:bg-white/5 [&_textarea]:border-white/15 [&_textarea]:bg-white/5 [&_select]:border-white/15 [&_select]:bg-white/5">
              <ModuloRichiesta tipo="permuta" conIntestazione={false} />
            </div>
          </div>
        </div>
      </Sezione>

      <Invito
        titolo="Documenti pronti, pratica veloce"
        testo="Carta d’identità, codice fiscale, patente e ultima busta paga o dichiarazione dei redditi: con questi in mano chiudiamo la pratica in due giorni."
      />
    </>
  )
}
