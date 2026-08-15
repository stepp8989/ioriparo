import type { Metadata } from 'next'
import { Apertura } from '@/componenti/home/Apertura'
import { FasciaDetailing, FasciaNoleggio, Traguardi } from '@/componenti/home/Fasce'
import { Marche } from '@/componenti/home/Marche'
import { Invito, Offerte } from '@/componenti/home/Offerte'
import { Recensioni } from '@/componenti/home/Recensioni'
import { Servizi } from '@/componenti/home/Servizi'
import { Vetrina } from '@/componenti/home/Vetrina'
import { AZIENDA } from '@/dati/azienda'
import { leggi } from '@/lib/archivio'
import { videoApertura } from '@/lib/risorse'
import { metadatiPagina, schemaFaq } from '@/lib/seo'

export const metadata: Metadata = metadatiPagina({
  titolo: `Concessionaria a ${AZIENDA.indirizzo.citta} — auto, moto, noleggio e detailing`,
  descrizione: AZIENDA.descrizione,
  percorso: '/',
})

export default async function Home() {
  const { veicoli, recensioni, offerte } = await leggi()

  return (
    <>
      {/* Le domande frequenti sono in fondo alla pagina Contatti, ma i dati
          strutturati stanno in home perché è la pagina che Google indicizza per
          prima e da cui costruisce la scheda dell'attività. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaq()) }}
      />

      <Apertura video={videoApertura()} />
      <Marche veicoli={veicoli} />
      <Servizi />
      <Vetrina veicoli={veicoli} />
      <FasciaNoleggio veicoli={veicoli} />
      <FasciaDetailing />
      <Traguardi />
      <Offerte offerte={offerte} />
      <Recensioni recensioni={recensioni} />
      <Invito />
    </>
  )
}
