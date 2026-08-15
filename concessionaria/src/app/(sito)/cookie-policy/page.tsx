import type { Metadata } from 'next'
import { RiapriConsenso } from '@/componenti/comuni/RiapriConsenso'
import { Documento } from '@/componenti/ui/Documento'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Sezione } from '@/componenti/ui/Sezione'
import { AZIENDA } from '@/dati/azienda'
import { metadatiPagina } from '@/lib/seo'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Cookie Policy',
  descrizione: `Quali cookie usa il sito di ${AZIENDA.nomeCompleto}, a cosa servono e come cambiare la vostra scelta.`,
  percorso: '/cookie-policy',
})

export default function PaginaCookie() {
  return (
    <>
      <Intestazione
        soprattitolo="Informativa"
        titolo="Cookie Policy"
        sottotitolo="Quali cookie usiamo, a cosa servono e come cambiare idea in qualsiasi momento."
        briciole={[{ nome: 'Cookie Policy', percorso: '/cookie-policy' }]}
      />

      <Sezione className="bg-sfondo" ampiezza="stretta">
        <Documento aggiornamento="1 agosto 2026">
          <h2>Che cosa sono i cookie</h2>
          <p>
            Sono piccoli file di testo che un sito deposita nel browser di chi lo visita. Servono a
            far funzionare alcune parti del sito e, in altri casi, a raccogliere informazioni su
            come viene usato.
          </p>

          <h2>Cookie tecnici — sempre attivi</h2>
          <p>
            Sono indispensabili al funzionamento e non richiedono consenso. Senza di questi il sito
            non funziona.
          </p>
          <ul>
            <li>
              <strong>aurora_pannello</strong> — mantiene aperta la sessione dello staff nel
              pannello di amministrazione. Durata: dodici ore.
            </li>
            <li>
              <strong>aurora_cliente</strong> — mantiene aperta la sessione nell’area clienti.
              Durata: quattordici giorni.
            </li>
          </ul>
          <p>
            Entrambi contengono soltanto un identificativo e una scadenza, firmati
            crittograficamente: non contengono dati personali e non possono essere alterati.
          </p>

          <h3>Memoria locale del browser</h3>
          <p>
            Non sono cookie in senso stretto — non viaggiano a ogni richiesta — ma restano sul
            vostro dispositivo:
          </p>
          <ul>
            <li>
              <strong>tema</strong> — ricorda se preferite l’aspetto chiaro o scuro.
            </li>
            <li>
              <strong>consenso-cookie</strong> — ricorda la scelta fatta nel banner, così non ve la
              chiediamo a ogni visita.
            </li>
          </ul>

          <h2>Cookie di terze parti — solo con il vostro consenso</h2>
          <p>
            Vengono attivati soltanto se scegliete «Accetta tutti» nel banner. Finché non lo fate,
            i relativi script non vengono nemmeno inseriti nella pagina.
          </p>
          <ul>
            <li>
              <strong>Google Analytics 4</strong> — statistiche di navigazione anonime, con
              indirizzo IP mascherato. Ci dice quali pagine funzionano e quali no. Durata: fino a
              quattordici mesi.
            </li>
            <li>
              <strong>Google Maps</strong> — la mappa incorporata nella pagina Contatti. Senza
              consenso al suo posto trovate un segnaposto con il collegamento alle indicazioni, che
              funziona ugualmente.
            </li>
          </ul>

          <h2>Come cambiare la vostra scelta</h2>
          <p>
            Potete rivedere la decisione quando volete con il pulsante qui sotto, oppure cancellando
            i dati del sito dalle impostazioni del browser.
          </p>

          <RiapriConsenso />

          <h2>Cosa non facciamo</h2>
          <p>
            Non usiamo cookie di profilazione pubblicitaria, non installiamo pixel di piattaforme
            social e non condividiamo dati di navigazione con reti pubblicitarie. I caratteri
            tipografici sono serviti dal nostro dominio, non da servizi esterni.
          </p>
        </Documento>
      </Sezione>
    </>
  )
}
