import Image from 'next/image'
import { Rivela } from '@/componenti/animazioni/Rivela'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'

/**
 * Le specialità della casa: tre pilastri della cucina raccontati accanto a una
 * fotografia grande. È una sezione scura, che spezza il ritmo chiaro della
 * pagina e prepara il passaggio alla galleria.
 */
const SPECIALITA: Array<{ icona: NomeIcona; titolo: string; testo: string }> = [
  {
    icona: 'cappello',
    titolo: 'La brace di leccio',
    testo:
      'Il cuore della cucina. Carni frollate quaranta giorni e pesce dell’Adriatico cotti sulla ' +
      'brace viva, con una gestione della temperatura che non ammette distrazioni.',
  },
  {
    icona: 'posate',
    titolo: 'La pasta tirata a mano',
    testo:
      'Tagliolini, pappardelle e ravioli nascono ogni mattina al matterello, con uova di galline ' +
      'allevate a terra e grani antichi macinati a pietra.',
  },
  {
    icona: 'bicchiere',
    titolo: 'La cantina storica',
    testo:
      'Trecento etichette sotto le volte in mattoni del 1780, con una selezione dedicata ai ' +
      'piccoli produttori toscani che lavorano in biologico.',
  },
]

export function Specialita() {
  return (
    <section className="relative overflow-hidden bg-notte text-white">
      {/* Fotografia di fondo, tenuta molto scura per non disturbare la lettura */}
      <Image
        src="/immagini/ambienti/specialita.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-25"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-notte via-notte/85 to-notte" aria-hidden />

      <div className="contenitore relative py-24 sm:py-32 lg:py-36">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Rivela da="nessuna">
              <p className="mb-5 flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-accento-tenue">
                La casa
                <span className="filetto" aria-hidden />
              </p>
            </Rivela>

            <Rivela ritardo={0.05}>
              <h2 className="text-4xl leading-[1.1] sm:text-5xl">
                Tre cose che facciamo <em className="testo-oro not-italic">da sempre</em>
              </h2>
            </Rivela>

            <Rivela ritardo={0.1}>
              <p className="mt-7 text-[1.02rem] leading-relaxed text-white/65">
                Non sono piatti: sono i tre mestieri su cui abbiamo costruito la cucina. Cambiano le
                ricette a ogni stagione, questi restano.
              </p>
            </Rivela>

            <Rivela ritardo={0.15}>
              <div className="mt-10">
                <Bottone href="/menu" variante="chiaro">
                  Scopri la carta
                </Bottone>
              </div>
            </Rivela>
          </div>

          <ul className="lg:col-span-7">
            {SPECIALITA.map((specialita, indice) => (
              <Rivela key={specialita.titolo} da="sinistra" ritardo={indice * 0.1} come="li">
                <div className="flex gap-6 border-b border-white/10 py-8 first:pt-0 last:border-b-0 last:pb-0">
                  <span
                    className="grid size-14 shrink-0 place-items-center rounded-full border border-accento/30 text-accento"
                    aria-hidden
                  >
                    <Icona nome={specialita.icona} className="size-6" />
                  </span>

                  <div>
                    <h3 className="font-titolo text-2xl">{specialita.titolo}</h3>
                    <p className="mt-2.5 leading-relaxed text-white/60">{specialita.testo}</p>
                  </div>
                </div>
              </Rivela>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
