import type { Film } from '@/lib/tipi'

/**
 * Catalogo dimostrativo.
 *
 * Tutti i titoli, le trame, i registi e gli interpreti di questo file sono
 * inventati. Non compare nessuna opera reale, nessun nome di persona reale e
 * nessun materiale protetto da copyright: servono a far vedere come si
 * comporta la piattaforma con un listino pieno, e vanno sostituiti con il
 * catalogo vero dal pannello (Film → Aggiungi film).
 *
 * Le locandine e i fondali non sono file: `locandina` e `backdrop` sono vuoti
 * e il sito disegna un manifesto procedurale a partire da `palette`. È il
 * motivo per cui questo progetto non porta con sé un solo megabyte di
 * immagini di repertorio. Appena il pannello carica un'immagine vera —
 * l'indirizzo di un archivio compatibile S3 — quella sostituisce il disegno.
 *
 * Nemmeno i trailer sono precompilati: `riferimento` vuoto significa «non
 * ancora inserito», e il lettore lo dice invece di caricare un video
 * qualsiasi. L'identificativo YouTube o Vimeo si incolla dal pannello.
 */

/** Riempie i campi ripetitivi: nel file restano solo quelli che distinguono. */
function film(dati: Omit<Film, 'creatoIl' | 'locandina' | 'backdrop'>): Film {
  return { ...dati, locandina: '', backdrop: '', creatoIl: '2026-01-08T09:00:00.000Z' }
}

export const FILM_INIZIALI: Film[] = [
  film({
    id: 'fil-maree',
    slug: 'il-respiro-delle-maree',
    titolo: 'Il respiro delle maree',
    titoloOriginale: 'Il respiro delle maree',
    sottotitolo: 'C’è un’ora, ogni giorno, in cui il mare restituisce tutto.',
    sinossi:
      'Una biologa marina torna nel paese che aveva lasciato da ragazza per studiare una laguna che sta scomparendo, e scopre che il suo lavoro tocca le vite di tutti quelli che ci abitano.',
    trama:
      'Elda Marcias misura le maree da vent’anni, in mari che non sono mai stati i suoi. Quando l’istituto la manda a studiare la laguna del paese in cui è cresciuta, accetta convinta di poterci stare due stagioni senza farsi riconoscere.\n\nLa laguna si sta chiudendo: il canale che la teneva viva si è interrato, e con l’acqua se ne va il lavoro di sessanta famiglie. Le misurazioni di Elda dicono una cosa sola, e dirla significa chiudere la pesca per cinque anni.\n\nFra i pescatori c’è chi la ricorda bambina e chi la considera già una funzionaria venuta da fuori. Il film sta in mezzo, e non prende scorciatoie: non c’è un colpevole da indicare, solo un tempo che è passato e una decisione che qualcuno deve firmare.',
    generi: ['Drammatico'],
    durataMinuti: 118,
    anno: 2026,
    classificazione: 'T',
    lingua: 'Italiano',
    paese: 'Italia',
    regista: 'Vera Caltagirone',
    cast: [
      { nome: 'Miriam Doria', ruolo: 'Elda Marcias' },
      { nome: 'Sandro Pilleri', ruolo: 'Nicola' },
      { nome: 'Ada Ferruzzi', ruolo: 'Teresa' },
      { nome: 'Gero Lascari', ruolo: 'Il sindaco' },
    ],
    formati: ['2D', 'Dolby Atmos'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 134 },
    palette: ['#0e3b4c', '#7fd4c1'],
    valutazione: 8.1,
    stato: 'in-sala',
    dataUscita: '2026-09-03',
    inEvidenza: true,
    visibile: true,
  }),

  film({
    id: 'fil-frequenza',
    slug: 'ultima-frequenza',
    titolo: 'Ultima frequenza',
    titoloOriginale: 'The Last Frequency',
    sottotitolo: 'Il segnale è partito quarant’anni fa. Sta tornando indietro.',
    sinossi:
      'In una stazione di ascolto dismessa, due tecnici intercettano una trasmissione che non dovrebbe esistere e che sembra rispondere alle loro domande.',
    trama:
      'La stazione di Monte Aspro doveva essere smantellata nel 2019. È ancora lì, con due persone di turno e un contratto che nessuno ha mai chiuso.\n\nQuando l’antenna capta una sequenza che ripete, con quarant’anni di ritardo, un messaggio spedito da quella stessa stazione, il protocollo prevede di segnalarlo e non toccare nulla. Nessuno dei due segue il protocollo.\n\nIl film rifiuta quasi tutte le comodità del genere: non ci sono creature, non c’è un’agenzia che arriva in elicottero. C’è una stanza, due persone, e una domanda che diventa insopportabile molto prima di trovare una risposta.',
    generi: ['Fantascienza', 'Thriller'],
    durataMinuti: 129,
    anno: 2026,
    classificazione: 'VM14',
    lingua: 'Inglese',
    paese: 'Regno Unito',
    regista: 'Iselin Norwood',
    cast: [
      { nome: 'Callum Harrow', ruolo: 'Peter Vane' },
      { nome: 'Ingrid Sollers', ruolo: 'Dr. Mara Quinn' },
      { nome: 'Teo Brandt', ruolo: 'Il tecnico di notte' },
    ],
    formati: ['2D', 'IMAX', 'Dolby Atmos', 'VO sottotitolato'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 152 },
    palette: ['#1b1140', '#a06bff'],
    valutazione: 7.8,
    stato: 'in-sala',
    dataUscita: '2026-08-27',
    inEvidenza: true,
    visibile: true,
  }),

  film({
    id: 'fil-cenere',
    slug: 'sale-e-cenere',
    titolo: 'Sale e cenere',
    titoloOriginale: 'Sale e cenere',
    sottotitolo: 'Una salina, tre generazioni, un conto che nessuno ha mai chiuso.',
    sinossi:
      'La storia di una famiglia che per novant’anni ha vissuto di sale, raccontata a partire dal giorno in cui l’ultima erede decide di vendere.',
    trama:
      'Le saline di Contrada Vetta hanno dato da mangiare a un paese intero fino agli anni Ottanta. Oggi ne resta un impianto fermo, una casa padronale e un contenzioso.\n\nIl film attraversa tre generazioni senza mai annunciarlo: le epoche si riconoscono dal modo in cui la gente cammina sull’argine e da cosa considera un destino accettabile.\n\nÈ un film sul lavoro più che sulla nostalgia, e sulla domanda che si fa chi eredita qualcosa che non ha scelto.',
    generi: ['Drammatico', 'Storico'],
    durataMinuti: 142,
    anno: 2026,
    classificazione: 'T',
    lingua: 'Italiano',
    paese: 'Italia',
    regista: 'Nunzio Ferrandu',
    cast: [
      { nome: 'Chiara Bellavia', ruolo: 'Assunta' },
      { nome: 'Rocco Vinciguerra', ruolo: 'Don Michele' },
      { nome: 'Lia Marroccu', ruolo: 'Ninetta' },
      { nome: 'Fabio Sanna', ruolo: 'Peppe' },
    ],
    formati: ['2D'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 121 },
    palette: ['#4a2418', '#e8b177'],
    valutazione: 8.4,
    stato: 'in-sala',
    dataUscita: '2026-09-10',
    inEvidenza: false,
    visibile: true,
  }),

  film({
    id: 'fil-nevischio',
    slug: 'nevischio-di-marzo',
    titolo: 'Nevischio di marzo',
    titoloOriginale: 'Nevischio di marzo',
    sottotitolo: 'Due persone, un treno fermo, sei ore.',
    sinossi:
      'Un guasto in linea blocca un regionale fra due stazioni di montagna. Due passeggeri che non si conoscono passano insieme la notte più lunga dell’anno.',
    trama:
      'Non succede quasi nulla, e il film lo sa. Il treno è fermo, la neve non attacca, la carrozza si svuota man mano che qualcuno trova un passaggio.\n\nRestano Nadia, che sta andando a un funerale a cui non vuole arrivare, e Vito, che sta tornando da un colloquio andato male. Parlano perché l’alternativa è il silenzio, e perché nessuno dei due dovrà rivedere l’altro.\n\nUna commedia romantica che si tiene lontana dalle dichiarazioni: quello che i due si dicono conta meno di quello che decidono di non chiedersi.',
    generi: ['Commedia', 'Sentimentale'],
    durataMinuti: 96,
    anno: 2026,
    classificazione: 'T',
    lingua: 'Italiano',
    paese: 'Italia',
    regista: 'Ludovica Trentin',
    cast: [
      { nome: 'Gaia Perlasca', ruolo: 'Nadia' },
      { nome: 'Enrico Bordin', ruolo: 'Vito' },
      { nome: 'Sofia Ranieri', ruolo: 'La capotreno' },
    ],
    formati: ['2D'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 108 },
    palette: ['#2a3350', '#c9d6ff'],
    valutazione: 7.2,
    stato: 'in-sala',
    dataUscita: '2026-09-05',
    inEvidenza: false,
    visibile: true,
  }),

  film({
    id: 'fil-custode',
    slug: 'il-custode-delle-ore',
    titolo: 'Il custode delle ore',
    titoloOriginale: 'The Hour Keeper',
    sottotitolo: 'Ogni torre ha un orologio. Una sola ha un guardiano.',
    sinossi:
      'Una ragazzina scopre che il vecchio orologiaio della piazza tiene in ordine qualcosa di più grande di un meccanismo, e che il posto sta per restare vacante.',
    trama:
      'Il film costruisce la sua regola in dieci minuti e poi la rispetta fino in fondo: nella città di Vàlmeris il tempo va caricato a mano, e se l’orologio della torre si ferma si ferma anche tutto il resto.\n\nMira ha undici anni e un talento per smontare le cose. L’orologiaio ne ha ottanta e nessuno a cui lasciare le chiavi.\n\nUn’avventura per famiglie che non prende in giro i bambini: il pericolo è vero, la fatica è vera, e la ricompensa non è magica ma guadagnata.',
    generi: ['Avventura', 'Fantastico', 'Famiglia'],
    durataMinuti: 112,
    anno: 2026,
    classificazione: 'T',
    lingua: 'Inglese',
    paese: 'Irlanda',
    regista: 'Órla Beckwith',
    cast: [
      { nome: 'Nell Ardagh', ruolo: 'Mira' },
      { nome: 'Desmond Loy', ruolo: 'L’orologiaio' },
      { nome: 'Piera Vantini', ruolo: 'La sindaca' },
    ],
    formati: ['2D', '3D', 'Dolby Atmos'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 145 },
    palette: ['#3d2a0f', '#ffd166'],
    valutazione: 7.9,
    stato: 'in-sala',
    dataUscita: '2026-08-20',
    inEvidenza: true,
    visibile: true,
  }),

  film({
    id: 'fil-corsa',
    slug: 'corsa-cieca',
    titolo: 'Corsa cieca',
    titoloOriginale: 'Blind Run',
    sottotitolo: 'Novanta minuti. Nessuna mappa. Un solo modo per uscirne.',
    sinossi:
      'Un autista di trasporti speciali accetta un ultimo incarico e si ritrova a guidare attraverso una città in blocco totale, senza sapere cosa trasporta.',
    trama:
      'Genere puro, eseguito con precisione: quasi tutto il film si svolge dentro un abitacolo, in tempo reale, con la radio come unico contatto con il mondo.\n\nLa sceneggiatura non concede monologhi e non spiega più di quanto serva a capire la prossima curva. Le informazioni arrivano quando arrivano al protagonista, mai prima.\n\nIl montaggio sonoro è la vera attrazione: in Dolby Atmos la città esiste tutta attorno all’abitacolo, e si capisce da dove arriva il pericolo prima di vederlo.',
    generi: ['Azione', 'Thriller'],
    durataMinuti: 104,
    anno: 2026,
    classificazione: 'VM14',
    lingua: 'Inglese',
    paese: 'Stati Uniti',
    regista: 'Marcus Feld',
    cast: [
      { nome: 'Dorian Vale', ruolo: 'Ray' },
      { nome: 'Nayeli Soto', ruolo: 'La voce alla radio' },
      { nome: 'Kip Tarrant', ruolo: 'Bowen' },
    ],
    formati: ['2D', 'IMAX', '4DX', 'Dolby Atmos', 'VO sottotitolato'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 118 },
    palette: ['#2b0a10', '#ff5252'],
    valutazione: 7.4,
    stato: 'in-sala',
    dataUscita: '2026-09-12',
    inEvidenza: true,
    visibile: true,
  }),

  film({
    id: 'fil-comete',
    slug: 'piccole-comete',
    titolo: 'Piccole comete',
    titoloOriginale: 'Little Comets',
    sottotitolo: 'Tutti brillano. Quasi nessuno lo sa in tempo.',
    sinossi:
      'In un osservatorio di provincia, tre bambini e un astronomo in pensione provano a dare un nome a un puntino che nessuno ha ancora catalogato.',
    trama:
      'Animazione disegnata a mano, con fondali ad acquerello e una tavolozza che cambia con le stagioni.\n\nLa storia è semplice per scelta: per intestarsi la scoperta di una cometa servono tre osservazioni confermate, e ogni notte di nuvole è un pezzo di speranza in meno.\n\nSotto c’è un film sul lutto, raccontato con una delicatezza che non chiede mai al pubblico di piangere a comando.',
    generi: ['Animazione', 'Famiglia'],
    durataMinuti: 88,
    anno: 2026,
    classificazione: 'T',
    lingua: 'Italiano',
    paese: 'Italia',
    regista: 'Tommaso Ghiraldi',
    cast: [
      { nome: 'Bianca Orsatti', ruolo: 'Voce di Nina' },
      { nome: 'Pietro Lascaris', ruolo: 'Voce del professor Bandi' },
      { nome: 'Samir Nedda', ruolo: 'Voce di Ciro' },
    ],
    formati: ['2D', '3D'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 96 },
    palette: ['#13263f', '#79c7ff'],
    valutazione: 8.6,
    stato: 'in-sala',
    dataUscita: '2026-08-14',
    inEvidenza: false,
    visibile: true,
  }),

  film({
    id: 'fil-battiti',
    slug: 'quaranta-battiti',
    titolo: 'Quaranta battiti',
    titoloOriginale: 'Forty Beats',
    sottotitolo: 'Il cuore di un bugiardo non batte come gli altri.',
    sinossi:
      'Una specialista di poligrafi accetta di collaborare a un’indagine interna e si accorge che l’unica persona che le sta mentendo è quella che l’ha assunta.',
    trama:
      'Thriller da camera, tutto costruito su interrogatori e su quello che succede nei corridoi fra un interrogatorio e l’altro.\n\nIl film prende sul serio il mestiere della protagonista: le macchine non rivelano bugie, rivelano stress, e la differenza fra le due cose è il motore di tutta la trama.\n\nIl finale non ribalta il tavolo e non serve: quello che c’è da capire è già tutto in scena da mezz’ora, se si è guardato bene.',
    generi: ['Thriller', 'Drammatico'],
    durataMinuti: 121,
    anno: 2026,
    classificazione: 'VM14',
    lingua: 'Francese',
    paese: 'Francia',
    regista: 'Amandine Rouvier',
    cast: [
      { nome: 'Camille Ferrat', ruolo: 'Hélène Dubois' },
      { nome: 'Yann Dessart', ruolo: 'Il commissario Mahé' },
      { nome: 'Olivier Krenn', ruolo: 'Bastien' },
    ],
    formati: ['2D', 'VO sottotitolato'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 127 },
    palette: ['#1e2a22', '#8fd9a8'],
    valutazione: 7.6,
    stato: 'in-sala',
    dataUscita: '2026-09-17',
    inEvidenza: false,
    visibile: true,
  }),

  film({
    id: 'fil-orto',
    slug: 'l-orto-dei-semplici',
    titolo: 'L’orto dei semplici',
    titoloOriginale: 'L’orto dei semplici',
    sottotitolo: 'Un condominio, sessanta metri quadri di terra e nessun accordo.',
    sinossi:
      'Quando il cortile di un condominio viene trasformato in orto collettivo, la guerra per le zucchine diventa il ritratto esatto di un quartiere.',
    trama:
      'Commedia corale con undici personaggi e nessun protagonista, girata quasi interamente in un cortile.\n\nOgni assemblea condominiale è una scena a sé, e il film le monta come si monterebbe una serie di round: chi entra convinto esce ridimensionato, chi non parla mai decide tutto.\n\nFa ridere davvero, e come tutte le buone commedie italiane di cortile dice sulla convivenza più di quanto direbbe un documentario.',
    generi: ['Commedia'],
    durataMinuti: 101,
    anno: 2026,
    classificazione: 'T',
    lingua: 'Italiano',
    paese: 'Italia',
    regista: 'Salvo Miccichè',
    cast: [
      { nome: 'Renata Pusceddu', ruolo: 'L’amministratrice' },
      { nome: 'Gianni Alberici', ruolo: 'Il ragioniere' },
      { nome: 'Nadia Comes', ruolo: 'Wanda' },
      { nome: 'Youssef Barghi', ruolo: 'Karim' },
    ],
    formati: ['2D'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 103 },
    palette: ['#213a1c', '#b9e06f'],
    valutazione: 7.1,
    stato: 'in-sala',
    dataUscita: '2026-09-11',
    inEvidenza: false,
    visibile: true,
  }),

  film({
    id: 'fil-luce',
    slug: 'il-peso-della-luce',
    titolo: 'Il peso della luce',
    titoloOriginale: 'The Weight of Light',
    sottotitolo: 'Trent’anni di fotografie, una sola mai pubblicata.',
    sinossi:
      'Il ritratto di una fotoreporter che ha documentato sei conflitti e che oggi decide cosa fare dell’unico scatto che non ha mai mostrato a nessuno.',
    trama:
      'Documentario di finzione costruito su materiali d’archivio inventati e ricostruiti, con un rigore che rende difficile ricordarsi che nulla di quello che si vede è realmente accaduto.\n\nLa domanda che attraversa il film è quella che ogni fotografo di guerra si sente fare: perché hai scattato invece di aiutare. La risposta che il film propone non è consolatoria.\n\nPremiato per il montaggio, è anche un piccolo saggio su cosa significa possedere un’immagine.',
    generi: ['Documentario', 'Drammatico'],
    durataMinuti: 107,
    anno: 2026,
    classificazione: 'VM14',
    lingua: 'Inglese',
    paese: 'Danimarca',
    regista: 'Birgitte Holm',
    cast: [
      { nome: 'Astrid Lyng', ruolo: 'Se stessa (interpretata)' },
      { nome: 'Rune Fabricius', ruolo: 'L’archivista' },
    ],
    formati: ['2D', 'VO sottotitolato'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 114 },
    palette: ['#2f2f33', '#d8d2c4'],
    valutazione: 8.2,
    stato: 'in-sala',
    dataUscita: '2026-09-04',
    inEvidenza: false,
    visibile: true,
  }),

  film({
    id: 'fil-radura',
    slug: 'radura-zero',
    titolo: 'Radura zero',
    titoloOriginale: 'Clearing Zero',
    sottotitolo: 'Il bosco è tornato più in fretta di quanto qualcuno sperasse.',
    sinossi:
      'Vent’anni dopo l’abbandono, una squadra di rilevatori entra in una valle chiusa per censire quello che ci è cresciuto dentro.',
    trama:
      'Il primo capitolo di un progetto annunciato in due parti. La valle di Radura è stata evacuata nel 2006 e sigillata: quello che è successo dentro nessuno lo sa, e il censimento è la prima autorizzazione concessa da allora.\n\nIl film sceglie il passo del sopralluogo e non quello dell’avventura: si cammina, si misura, si prende nota. La tensione nasce dall’accumulo di dettagli che non tornano.',
    generi: ['Fantascienza', 'Mistero'],
    durataMinuti: 133,
    anno: 2026,
    classificazione: 'VM14',
    lingua: 'Inglese',
    paese: 'Canada',
    regista: 'Iselin Norwood',
    cast: [
      { nome: 'Ruth Nkemdi', ruolo: 'La caposquadra' },
      { nome: 'Callum Harrow', ruolo: 'Vane' },
      { nome: 'Jonah Pressler', ruolo: 'Il botanico' },
    ],
    formati: ['2D', 'IMAX', 'Dolby Atmos', 'VO sottotitolato'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 149 },
    palette: ['#11271c', '#5fd39a'],
    valutazione: 0,
    stato: 'prossimamente',
    dataUscita: '2026-10-22',
    inEvidenza: true,
    visibile: true,
  }),

  film({
    id: 'fil-oreblu',
    slug: 'le-ore-blu',
    titolo: 'Le ore blu',
    titoloOriginale: 'Les heures bleues',
    sottotitolo: 'Fra il tramonto e la notte c’è un’ora che non appartiene a nessuno.',
    sinossi:
      'Quattro storie che si sfiorano in una città di mare, tutte ambientate nell’ora che precede il buio.',
    trama:
      'Film a episodi legati da un’unica unità di tempo. Le quattro storie non si incastrano in un colpo di scena finale: si limitano a condividere le stesse strade alla stessa luce.\n\nÈ un film di direzione della fotografia prima ancora che di sceneggiatura, girato interamente in luce naturale, con le difficoltà di produzione che questo comporta e che si vedono tutte sullo schermo — in senso buono.',
    generi: ['Drammatico', 'Sentimentale'],
    durataMinuti: 124,
    anno: 2026,
    classificazione: 'T',
    lingua: 'Francese',
    paese: 'Francia',
    regista: 'Amandine Rouvier',
    cast: [
      { nome: 'Camille Ferrat', ruolo: 'Léa' },
      { nome: 'Malik Souhaïl', ruolo: 'Sami' },
      { nome: 'Béatrice Vaugeois', ruolo: 'Madame Roux' },
    ],
    formati: ['2D', 'VO sottotitolato'],
    trailer: { piattaforma: 'youtube', riferimento: '', durataSecondi: 131 },
    palette: ['#142046', '#6d8dff'],
    valutazione: 0,
    stato: 'prossimamente',
    dataUscita: '2026-11-05',
    inEvidenza: false,
    visibile: true,
  }),
]

/** Generi presenti nel catalogo, per i filtri della ricerca. */
export const GENERI = [
  'Animazione',
  'Avventura',
  'Azione',
  'Commedia',
  'Documentario',
  'Drammatico',
  'Famiglia',
  'Fantascienza',
  'Fantastico',
  'Mistero',
  'Sentimentale',
  'Storico',
  'Thriller',
] as const
