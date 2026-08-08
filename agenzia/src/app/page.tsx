import { datiStrutturati } from '@/lib/seo'
import { Apertura } from '@/componenti/sezioni/Apertura'
import { Esperienze } from '@/componenti/sezioni/Esperienze'
import { Servizi } from '@/componenti/sezioni/Servizi'
import { Trasformazione } from '@/componenti/sezioni/Trasformazione'
import { Vetrina } from '@/componenti/sezioni/Vetrina'
import { PrimaDopo } from '@/componenti/sezioni/PrimaDopo'
import { Numeri } from '@/componenti/sezioni/Numeri'
import { Processo } from '@/componenti/sezioni/Processo'
import { ChiSono } from '@/componenti/sezioni/ChiSono'
import { Invito } from '@/componenti/sezioni/Invito'

/**
 * La home, che è tutto il sito.
 *
 * L'ordine delle sezioni è il ragionamento della vendita: si apre con una
 * promessa, si spiega perché un sito non è una brochure, si dice cosa si fa e
 * quanto costa, si mostra come nasce, si fa vedere il risultato, si mette a
 * confronto con quello che c'era prima, si dà una ragione per fidarsi, si
 * spiega come si lavora, ci si presenta e infine si chiede.
 *
 * Le sezioni sono componenti separati e indipendenti: toglierne una, o
 * scambiare due righe qui sotto, non rompe nulla.
 */
export default function Home() {
  return (
    <>
      {/* Dati strutturati: attività, servizi, listino e domande frequenti. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datiStrutturati()) }}
      />

      <Apertura />
      <Esperienze />
      <Servizi />
      <Trasformazione />
      <Vetrina />
      <PrimaDopo />
      <Numeri />
      <Processo />
      <ChiSono />
      <Invito />
    </>
  )
}
