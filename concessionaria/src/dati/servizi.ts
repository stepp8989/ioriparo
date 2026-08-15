import type { NomeIcona } from '@/componenti/ui/Icona'

/**
 * I servizi della concessionaria.
 *
 * Sono contenuti fissi, non gestiti dal pannello: cambiano di rado e vengono
 * riusati in home, nella pagina Servizi, nel piè di pagina e nei dati
 * strutturati. L'ordine dell'elenco è quello con cui compaiono a video.
 */

export type Servizio = {
  id: string
  nome: string
  /** Riga breve mostrata sotto il nome nella griglia. */
  sommario: string
  descrizione: string
  icona: NomeIcona
  immagine: string
  /** Dove porta la scheda: una pagina dedicata o un'ancora. */
  link: string
}

export const SERVIZI: Servizio[] = [
  {
    id: 'vendita-auto',
    nome: 'Vendita Auto',
    sommario: 'Nuove, km 0 e usate garantite',
    descrizione:
      'Ogni vettura passa da un controllo in centoventi punti prima di entrare in salone: meccanica, ' +
      'elettronica, carrozzeria e storia manutentiva. Chilometraggio certificato, garanzia minima di ' +
      'ventiquattro mesi e possibilità di estenderla fino a quarantotto.',
    icona: 'auto',
    immagine: '/immagini/servizi/vendita-auto.jpg',
    link: '/catalogo?tipo=auto',
  },
  {
    id: 'vendita-moto',
    nome: 'Vendita Moto',
    sommario: 'Naked, sportive, enduro e scooter',
    descrizione:
      'Selezione di moto nuove e usate scelte una a una, con tagliandi verificati e revisione completa ' +
      'della ciclistica. Prepariamo la moto in officina e la consegniamo pronta, con gomme e freni ' +
      'controllati e targa già intestata.',
    icona: 'moto',
    immagine: '/immagini/servizi/vendita-moto.jpg',
    link: '/catalogo?tipo=moto',
  },
  {
    id: 'noleggio-auto',
    nome: 'Noleggio Auto',
    sommario: 'Da un giorno a un anno',
    descrizione:
      'Flotta recente con assicurazione kasko inclusa, soccorso stradale ventiquattro ore e vettura ' +
      'sostitutiva in caso di fermo. Tariffe giornaliere, settimanali e mensili, con consegna a domicilio ' +
      'in tutta l’Ogliastra.',
    icona: 'chiave',
    immagine: '/immagini/servizi/noleggio-auto.jpg',
    link: '/noleggio?tipo=auto',
  },
  {
    id: 'noleggio-moto',
    nome: 'Noleggio Moto',
    sommario: 'Scooter, naked e maxi enduro',
    descrizione:
      'Moto e scooter pronti al ritiro con casco, bauletto e assicurazione compresi nel prezzo. Formula ' +
      'ideale per il turista che vuole scoprire le strade della costa e per chi resta senza mezzo durante ' +
      'una riparazione.',
    icona: 'casco',
    immagine: '/immagini/servizi/noleggio-moto.jpg',
    link: '/noleggio?tipo=moto',
  },
  {
    id: 'detailing',
    nome: 'Car Detailing',
    sommario: 'Il veicolo come il primo giorno',
    descrizione:
      'Trattamento completo di carrozzeria e interni eseguito a mano, con prodotti professionali e tempi ' +
      'di lavorazione veri. Non è un autolavaggio veloce: è il recupero estetico del veicolo, documentato ' +
      'con fotografie prima e dopo.',
    icona: 'brillante',
    immagine: '/immagini/servizi/detailing.jpg',
    link: '/detailing',
  },
  {
    id: 'lavaggio',
    nome: 'Lavaggio Professionale',
    sommario: 'A mano, senza spazzole',
    descrizione:
      'Lavaggio con metodo a due secchi, guanto in microfibra e asciugatura ad aria compressa: nessuna ' +
      'spazzola rotante, nessun graffio a ragnatela. Cerchi, passaruota e sottoporta trattati a parte.',
    icona: 'goccia',
    immagine: '/immagini/servizi/lavaggio.jpg',
    link: '/detailing#trattamenti',
  },
  {
    id: 'sanificazione',
    nome: 'Sanificazione Interni',
    sommario: 'Ozono e vapore certificati',
    descrizione:
      'Ciclo all’ozono sull’abitacolo e sull’impianto di climatizzazione, con igienizzazione a vapore di ' +
      'sedili, cielo e bocchette. Elimina odori, muffe e batteri nell’impianto di ventilazione; rilasciamo ' +
      'attestato di avvenuta sanificazione.',
    icona: 'scudo',
    immagine: '/immagini/servizi/sanificazione.jpg',
    link: '/detailing#trattamenti',
  },
  {
    id: 'lucidatura',
    nome: 'Lucidatura Carrozzeria',
    sommario: 'Correzione dei difetti in tre passaggi',
    descrizione:
      'Levigatura correttiva a più passaggi con pad e paste di grana decrescente, misurando lo spessore ' +
      'del film di vernice prima di iniziare. Toglie graffi leggeri, aloni e opacizzazioni da lavaggio.',
    icona: 'lucido',
    immagine: '/immagini/servizi/lucidatura.jpg',
    link: '/detailing#trattamenti',
  },
  {
    id: 'ceramica',
    nome: 'Protezione Ceramica',
    sommario: 'Fino a cinque anni di protezione',
    descrizione:
      'Rivestimento nanoceramico al quarzo applicato in cabina dopo la correzione della vernice. Rende la ' +
      'superficie idrorepellente, resistente ai raggi ultravioletti e molto più semplice da lavare. ' +
      'Garanzia scritta e controllo annuale incluso.',
    icona: 'diamante',
    immagine: '/immagini/servizi/ceramica.jpg',
    link: '/detailing#trattamenti',
  },
  {
    id: 'finanziamenti',
    nome: 'Finanziamenti',
    sommario: 'Rate su misura, risposta in 24 ore',
    descrizione:
      'Lavoriamo con più istituti di credito e confrontiamo le proposte al posto vostro: rata fissa, ' +
      'maxirata finale o leasing per le partite IVA. Simulate la rata online e ricevete il preventivo ' +
      'firmato senza impegno.',
    icona: 'calcolatrice',
    immagine: '/immagini/servizi/finanziamenti.jpg',
    link: '/finanziamenti',
  },
  {
    id: 'permuta',
    nome: 'Permuta',
    sommario: 'Valutazione gratuita in 48 ore',
    descrizione:
      'Ritiriamo il vostro veicolo in conto vendita o in permuta, occupandoci del passaggio di proprietà ' +
      'e della cancellazione di eventuali finanziamenti in corso. Valutazione basata sulle quotazioni di ' +
      'mercato, non su tabelle interne.',
    icona: 'scambio',
    immagine: '/immagini/servizi/permuta.jpg',
    link: '/finanziamenti#permuta',
  },
  {
    id: 'assistenza',
    nome: 'Assistenza Post Vendita',
    sommario: 'Officina interna e ricambi originali',
    descrizione:
      'Tagliandi, revisioni, gomme, diagnosi elettronica e riparazioni in officina interna, senza perdere ' +
      'la garanzia della casa madre. Vettura sostitutiva su richiesta e preventivo sempre approvato prima ' +
      'di mettere le mani sul veicolo.',
    icona: 'chiaveInglese',
    immagine: '/immagini/servizi/assistenza.jpg',
    link: '/contatti',
  },
]

/* ── Trattamenti di detailing ────────────────────────────────────────────── */

export type Trattamento = {
  id: string
  nome: string
  descrizione: string
  /** Prezzo di partenza: varia con la dimensione e lo stato del veicolo. */
  prezzoDa: number
  /** Durata indicativa della lavorazione, in ore. */
  ore: number
  comprende: string[]
  icona: NomeIcona
  immagine: string
  /** Coppia di fotografie per il confronto prima/dopo, quando disponibile. */
  confronto: { prima: string; dopo: string } | null
}

export const TRATTAMENTI: Trattamento[] = [
  {
    id: 'lavaggio-premium',
    nome: 'Lavaggio Premium',
    descrizione:
      'Lavaggio esterno completo eseguito a mano con metodo a due secchi, decontaminazione chimica del ' +
      'ferro e asciugatura senza contatto.',
    prezzoDa: 39,
    ore: 2,
    comprende: [
      'Prelavaggio con schiuma attiva',
      'Lavaggio a due secchi con guanto in microfibra',
      'Decontaminazione ferrosa di carrozzeria e cerchi',
      'Pulizia passaruota e sottoporta',
      'Asciugatura ad aria compressa',
      'Cera spray di finitura',
    ],
    icona: 'goccia',
    immagine: '/immagini/detailing/lavaggio-premium.jpg',
    confronto: null,
  },
  {
    id: 'lavaggio-interni',
    nome: 'Lavaggio Interni',
    descrizione:
      'Pulizia profonda dell’abitacolo: aspirazione, estrazione dello sporco dai tessuti e trattamento di ' +
      'tutte le plastiche con protettivo antistatico.',
    prezzoDa: 49,
    ore: 3,
    comprende: [
      'Aspirazione completa, bagagliaio incluso',
      'Estrazione a iniezione su tappeti e moquette',
      'Pulizia plastiche e protettivo opaco',
      'Vetri interni senza aloni',
      'Pulizia bocchette e vani portaoggetti',
    ],
    icona: 'sedile',
    immagine: '/immagini/detailing/lavaggio-interni.jpg',
    confronto: {
      prima: '/immagini/detailing/interni-prima.jpg',
      dopo: '/immagini/detailing/interni-dopo.jpg',
    },
  },
  {
    id: 'sanificazione-ozono',
    nome: 'Sanificazione Ozono',
    descrizione:
      'Ciclo all’ozono sull’abitacolo e sull’impianto di climatizzazione, con igienizzazione a vapore ' +
      'delle superfici di contatto.',
    prezzoDa: 59,
    ore: 2,
    comprende: [
      'Ciclo all’ozono di sessanta minuti',
      'Sanificazione dell’impianto di climatizzazione',
      'Vapore su sedili, cielo e cinture',
      'Sostituzione del filtro abitacolo',
      'Attestato di avvenuta sanificazione',
    ],
    icona: 'scudo',
    immagine: '/immagini/detailing/sanificazione.jpg',
    confronto: null,
  },
  {
    id: 'lucidatura',
    nome: 'Lucidatura Correttiva',
    descrizione:
      'Correzione della vernice in tre passaggi per togliere graffi leggeri, aloni e micrograffi da ' +
      'lavaggio, con misurazione dello spessore prima di intervenire.',
    prezzoDa: 249,
    ore: 10,
    comprende: [
      'Misurazione dello spessore vernice',
      'Decontaminazione con clay bar',
      'Levigatura correttiva a tre passaggi',
      'Rifinitura con pasta antiologramma',
      'Sigillante di protezione a sei mesi',
      'Documentazione fotografica prima e dopo',
    ],
    icona: 'lucido',
    immagine: '/immagini/detailing/lucidatura.jpg',
    confronto: {
      prima: '/immagini/detailing/lucidatura-prima.jpg',
      dopo: '/immagini/detailing/lucidatura-dopo.jpg',
    },
  },
  {
    id: 'nano-ceramic',
    nome: 'Nano Ceramic Coating',
    descrizione:
      'Rivestimento nanoceramico al quarzo con durata dichiarata fino a cinque anni, applicato in cabina ' +
      'dopo la correzione completa della vernice.',
    prezzoDa: 690,
    ore: 16,
    comprende: [
      'Correzione preliminare della vernice',
      'Sgrassaggio con alcol isopropilico',
      'Applicazione ceramica in cabina illuminata',
      'Polimerizzazione a lampada infrarossi',
      'Trattamento di vetri e cerchi',
      'Garanzia scritta e controllo annuale',
    ],
    icona: 'diamante',
    immagine: '/immagini/detailing/ceramica.jpg',
    confronto: {
      prima: '/immagini/detailing/ceramica-prima.jpg',
      dopo: '/immagini/detailing/ceramica-dopo.jpg',
    },
  },
  {
    id: 'protezione-vernice',
    nome: 'Protezione Vernice',
    descrizione:
      'Pellicola trasparente autorigenerante applicata sulle zone più esposte: cofano, paraurti, ' +
      'specchietti e montanti.',
    prezzoDa: 390,
    ore: 8,
    comprende: [
      'Pellicola PPF autorigenerante',
      'Applicazione su cofano e paraurti anteriore',
      'Bordi risvoltati, non a vista',
      'Protezione dai sassi e dagli insetti',
      'Garanzia sulla pellicola di dieci anni',
    ],
    icona: 'scudo',
    immagine: '/immagini/detailing/protezione-vernice.jpg',
    confronto: null,
  },
  {
    id: 'wrapping',
    nome: 'Wrapping',
    descrizione:
      'Cambio colore totale o parziale con pellicole in vinile di alta gamma: reversibile, e nel ' +
      'frattempo protegge la vernice originale.',
    prezzoDa: 1_200,
    ore: 32,
    comprende: [
      'Smontaggio di maniglie e guarnizioni',
      'Pellicola in vinile colato',
      'Finiture lucide, opache o satinate',
      'Personalizzazioni e loghi aziendali',
      'Garanzia di cinque anni sulla pellicola',
    ],
    icona: 'pellicola',
    immagine: '/immagini/detailing/wrapping.jpg',
    confronto: {
      prima: '/immagini/detailing/wrapping-prima.jpg',
      dopo: '/immagini/detailing/wrapping-dopo.jpg',
    },
  },
  {
    id: 'ripristino-fari',
    nome: 'Ripristino Fari',
    descrizione:
      'Recupero dei fari ingialliti o opacizzati con levigatura progressiva e protezione finale ai raggi ' +
      'ultravioletti. Torna la luce, e con essa la revisione superata.',
    prezzoDa: 89,
    ore: 2,
    comprende: [
      'Levigatura a grane progressive',
      'Lucidatura del policarbonato',
      'Protettivo anti UV',
      'Controllo dell’allineamento del fascio',
      'Garanzia di dodici mesi',
    ],
    icona: 'faro',
    immagine: '/immagini/detailing/ripristino-fari.jpg',
    confronto: {
      prima: '/immagini/detailing/fari-prima.jpg',
      dopo: '/immagini/detailing/fari-dopo.jpg',
    },
  },
  {
    id: 'pulizia-pelle',
    nome: 'Pulizia Pelle',
    descrizione:
      'Pulizia e nutrimento degli interni in pelle con prodotti a pH neutro, seguiti da una crema ' +
      'protettiva che previene le screpolature.',
    prezzoDa: 99,
    ore: 4,
    comprende: [
      'Pulizia a pH neutro con spazzola morbida',
      'Rimozione dello scolorimento da jeans',
      'Crema nutriente e protettiva',
      'Trattamento di volante e cuffia del cambio',
      'Finitura opaca naturale',
    ],
    icona: 'sedile',
    immagine: '/immagini/detailing/pulizia-pelle.jpg',
    confronto: null,
  },
  {
    id: 'pulizia-tessuti',
    nome: 'Pulizia Tessuti',
    descrizione:
      'Estrazione a iniezione su sedili, moquette e cielo per togliere macchie e odori radicati, con ' +
      'asciugatura forzata prima della riconsegna.',
    prezzoDa: 79,
    ore: 4,
    comprende: [
      'Pretrattamento delle macchie',
      'Estrazione a iniezione ad acqua calda',
      'Trattamento del cielo dell’abitacolo',
      'Neutralizzazione degli odori',
      'Asciugatura forzata',
    ],
    icona: 'sedile',
    immagine: '/immagini/detailing/pulizia-tessuti.jpg',
    confronto: null,
  },
]

/** Quanto costa e quanto dura un trattamento, in forma leggibile. */
export function durataTrattamento(ore: number): string {
  if (ore <= 4) return `${ore} ore`
  if (ore <= 8) return 'una giornata'
  if (ore <= 16) return 'due giornate'
  return `${Math.ceil(ore / 8)} giornate`
}
