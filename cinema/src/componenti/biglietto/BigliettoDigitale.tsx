import { Icona } from '@/componenti/ui/Icona'
import { Qr } from '@/componenti/ui/Qr'
import { Etichetta } from '@/componenti/ui/Sezione'
import type { Cinema, Film, Impostazioni, PostoPrenotato, Prenotazione } from '@/lib/tipi'
import { classi, dataEstesa, etichettaPosto, prezzoPieno } from '@/lib/utili'

/**
 * Biglietto digitale.
 *
 * Un biglietto per posto, ciascuno con il proprio QR. La forma richiama quella
 * di un tagliando cartaceo — le due tacche laterali sono l'unica concessione
 * decorativa — perché è la forma che tutti riconoscono all'ingresso senza
 * doverci pensare.
 *
 * Accanto al QR c'è sempre il codice in chiaro. Serve a chi non può
 * fotografarlo, a chi ha lo schermo rotto, e alla maschera quando il lettore
 * non aggancia: un biglietto che esiste solo come immagine è un biglietto che
 * ogni tanto non funziona.
 */
export function BigliettoDigitale({
  prenotazione,
  posto,
  contenutoQr,
  film,
  cinema,
  salaNome,
  impostazioni,
  indice,
  totale,
}: {
  prenotazione: Prenotazione
  posto: PostoPrenotato
  contenutoQr: string
  film: Film | undefined
  cinema: Cinema | undefined
  salaNome: string
  impostazioni: Impostazioni
  indice: number
  totale: number
}) {
  const usato = Boolean(posto.utilizzatoIl)

  return (
    <article
      className={classi(
        'relative overflow-hidden rounded-ampio border bg-superficie',
        usato ? 'border-bordo opacity-70' : 'border-bordo',
      )}
    >
      {/* Intestazione con il colore del film */}
      <div
        className="relative px-6 py-5 text-white"
        style={{
          backgroundImage: `linear-gradient(120deg, ${film?.palette[0] ?? '#1b1140'}, ${film?.palette[1] ?? '#9d6bff'})`,
        }}
      >
        <div className="grana pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.28em] opacity-85">
              {impostazioni.marchio.nome}
            </p>
            <h2 className="mt-1.5 truncate font-titolo text-[1.25rem] font-semibold">
              {film?.titolo ?? 'Spettacolo'}
            </h2>
          </div>

          {totale > 1 && (
            <span className="shrink-0 rounded-tenue bg-black/25 px-3 py-1 text-[0.7rem] font-semibold">
              {indice} di {totale}
            </span>
          )}
        </div>
      </div>

      {/* Tacche laterali: il segno che lo fa leggere come un biglietto. */}
      <div
        className="pointer-events-none absolute left-0 top-[6.2rem] size-6 -translate-x-1/2 rounded-full bg-sfondo"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-[6.2rem] size-6 translate-x-1/2 rounded-full bg-sfondo"
        aria-hidden
      />

      <div className="grid gap-6 border-t border-dashed border-bordo p-6 sm:grid-cols-[1fr_auto]">
        <dl className="space-y-3 text-[0.9rem]">
          {[
            ['Cinema', cinema ? `${impostazioni.marchio.nome} ${cinema.nome}` : '—'],
            ['Indirizzo', cinema ? `${cinema.indirizzo}, ${cinema.citta}` : '—'],
            ['Data', dataEstesa(prenotazione.data)],
            ['Ora', prenotazione.ora],
            ['Sala', salaNome || '—'],
          ].map(([etichetta, valore]) => (
            <div key={etichetta} className="flex justify-between gap-4">
              <dt className="text-tenue">{etichetta}</dt>
              <dd className="text-right font-medium">{valore}</dd>
            </div>
          ))}

          <div className="flex items-center justify-between gap-4 border-t border-bordo pt-3">
            <dt className="text-tenue">Posto</dt>
            <dd className="text-right">
              <span className="font-titolo text-[1.5rem] font-bold text-accento">
                {etichettaPosto(posto.fila, posto.numero)}
              </span>
              <span className="ml-2 text-[0.8rem] text-tenue">
                fila {posto.fila}, posto {posto.numero}
              </span>
            </dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-tenue">Tipologia</dt>
            <dd className="text-right font-medium">
              {posto.tipologiaNome}
              <span className="ml-2 tabellare text-tenue">{prezzoPieno(posto.prezzo)}</span>
            </dd>
          </div>
        </dl>

        <div className="flex flex-col items-center justify-center gap-3 sm:border-l sm:border-dashed sm:border-bordo sm:pl-6">
          <div
            className={classi(
              'rounded-tenue bg-white p-2.5',
              usato && 'grayscale',
            )}
          >
            <Qr
              contenuto={contenutoQr}
              colore="#000000"
              sfondo="#ffffff"
              className="size-36"
              etichetta={`Codice QR del posto ${etichettaPosto(posto.fila, posto.numero)}`}
            />
          </div>

          <p className="tabellare text-center text-[0.68rem] leading-snug text-tenue">
            {posto.codiceBiglietto}
          </p>

          {usato ? (
            <Etichetta tono="neutro">Già utilizzato</Etichetta>
          ) : prenotazione.stato === 'in-attesa' ? (
            <Etichetta tono="ambra">Da pagare</Etichetta>
          ) : (
            <Etichetta tono="verde">Valido</Etichetta>
          )}
        </div>
      </div>

      {usato && (
        <p className="border-t border-bordo bg-superficie-alt px-6 py-3 text-[0.8rem] text-tenue">
          <Icona nome="spunta" className="mr-1.5 inline size-3.5" />
          Ingresso registrato il {dataEstesa(posto.utilizzatoIl ?? '')}.
        </p>
      )}
    </article>
  )
}
