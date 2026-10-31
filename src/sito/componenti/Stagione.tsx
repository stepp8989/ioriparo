import { eGiorniRagnatele, eGiornoDellaZucca, eNatale, stagioneDi } from '../lib/stagione'

/**
 * Dettaglio decorativo dell'apertura, diverso a ogni stagione.
 *
 * È disegnato (SVG) e animato in CSS: nessuna immagine da scaricare, quindi
 * non pesa sul caricamento. Sta dietro al contenuto, non intercetta i clic ed
 * è nascosto ai lettori di schermo — è decorazione, non informazione. Chi ha
 * chiesto animazioni ridotte lo vede fermo (regola in `sito.css`).
 *
 * Le posizioni sono scritte a mano invece che estratte a caso: così la scena
 * è sempre la stessa e resta bilanciata, senza grappoli o zone vuote.
 */

/** Elementi che cadono o salgono: sinistra in %, ritardo e durata in secondi. */
type Fluttuante = { x: number; ritardo: number; durata: number; scala: number }

const FOGLIE: Fluttuante[] = [
  { x: 8, ritardo: 0, durata: 19, scala: 1 },
  { x: 26, ritardo: -7, durata: 24, scala: 0.75 },
  { x: 47, ritardo: -13, durata: 21, scala: 0.9 },
  { x: 68, ritardo: -4, durata: 26, scala: 0.7 },
  { x: 84, ritardo: -17, durata: 22, scala: 1.05 },
]

const FIOCCHI: Fluttuante[] = [
  { x: 6, ritardo: 0, durata: 16, scala: 1 },
  { x: 15, ritardo: -9, durata: 21, scala: 0.6 },
  { x: 29, ritardo: -4, durata: 18, scala: 0.85 },
  { x: 41, ritardo: -14, durata: 23, scala: 0.7 },
  { x: 55, ritardo: -2, durata: 17, scala: 1 },
  { x: 67, ritardo: -11, durata: 20, scala: 0.65 },
  { x: 78, ritardo: -6, durata: 25, scala: 0.9 },
  { x: 91, ritardo: -16, durata: 19, scala: 0.75 },
]

const PETALI: Fluttuante[] = [
  { x: 10, ritardo: 0, durata: 23, scala: 0.9 },
  { x: 31, ritardo: -8, durata: 27, scala: 0.7 },
  { x: 52, ritardo: -15, durata: 21, scala: 1 },
  { x: 73, ritardo: -5, durata: 25, scala: 0.8 },
  { x: 89, ritardo: -19, durata: 29, scala: 0.65 },
]

const stile = (f: Fluttuante) => ({
  left: `${f.x}%`,
  animationDelay: `${f.ritardo}s`,
  animationDuration: `${f.durata}s`,
  transform: `scale(${f.scala})`,
})

/** Foglia stilizzata: una goccia con la nervatura centrale. */
const Foglia = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6 6 3 11 3 15a9 9 0 0 0 18 0c0-4-3-9-9-13Z" />
    <path d="M12 6v13" />
  </svg>
)

const Fiocco = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 2v20M3.4 7l17.2 10M20.6 7 3.4 17" />
  </svg>
)

const Petalo = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 3c5 3 7 7 5 11s-8 5-11 2-2-9 6-13Z" />
  </svg>
)

/** Colori della slitta di Natale. Sono gli unici fissi del sito: rosso e
 *  marrone restano quelli sia in tema chiaro sia in tema scuro. */
const ROSSO = '#cd3a2f'
const ORO = '#e0a63c'
const BIANCO = '#f6f2ea'
const BORDO = '#cabfab'
const INCARNATO = '#f0c49a'
const MANTO = '#8b5e3c'
const MANTO_SCURO = '#6f4728'
const MUSO = '#9c6c46'
const CORNA = '#c49a6c'
const CUOIO = '#b08a55'
const PERGAMENA = '#f4e9cf'
const INCHIOSTRO = '#94764a'

/* ── Giorni delle ragnatele ───────────────────────────────────────────────
   Ragnatele negli angoli in alto e un ragno appeso al filo. Sono forme
   generiche — ragno e ragnatela non sono di nessuno — e restano nel blu del
   sito: niente rosso e blu da costume, niente maschera, nessun nome. Quella
   è roba registrata di altri, e su un sito che vende servizi si chiama uso
   commerciale del marchio. */

/** Angoli dei raggi della tela, dallo spigolo verso l'interno. */
const RAGGI_TELA = [0, 22.5, 45, 67.5, 90]
/** Distanze dallo spigolo a cui passano i fili trasversali. */
const ANELLI_TELA = [34, 62, 92, 124]

const puntoTela = (distanza: number, gradi: number) => {
  const a = (gradi * Math.PI) / 180
  return [+(distanza * Math.cos(a)).toFixed(1), +(distanza * Math.sin(a)).toFixed(1)] as const
}

/**
 * Il disegno della tela d'angolo, costruito invece che scritto a mano: sono
 * quattro raggi e sedici tratti, e a mano sarebbero venti coordinate sbagliate.
 * Si calcola dentro al componente e non a bordo file: una chiamata a livello di
 * modulo conta come effetto e terrebbe in piedi tutto il file anche nella build
 * del gestionale, dove il sito non c'è.
 */
function disegnoTela() {
  const tratti: string[] = []

  // I raggi partono dallo spigolo e sbordano oltre l'ultimo anello.
  for (const g of RAGGI_TELA) {
    const [x, y] = puntoTela(ANELLI_TELA[ANELLI_TELA.length - 1] + 12, g)
    tratti.push(`M0 0L${x} ${y}`)
  }

  // I fili trasversali fanno la pancia verso lo spigolo, come quelli veri.
  for (const r of ANELLI_TELA) {
    for (let i = 0; i < RAGGI_TELA.length - 1; i++) {
      const [x1, y1] = puntoTela(r, RAGGI_TELA[i])
      const [x2, y2] = puntoTela(r, RAGGI_TELA[i + 1])
      const [cx, cy] = puntoTela(r * 0.84, (RAGGI_TELA[i] + RAGGI_TELA[i + 1]) / 2)
      tratti.push(`M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`)
    }
  }

  return tratti.join('')
}

function Ragnatele() {
  const tela = disegnoTela()

  return (
    <div className="stagione stagione--ragno" aria-hidden="true">
      {/* Stesso disegno nei due angoli: quello di destra è specchiato. */}
      <svg className="stagione__tela stagione__tela--sx" viewBox="0 0 150 150" fill="none">
        <path d={tela} />
      </svg>
      <svg className="stagione__tela stagione__tela--dx" viewBox="0 0 150 150" fill="none">
        <path d={tela} />
      </svg>

      {/* Il filo è una riga in CSS sopra al ragno: deve allungarsi fino al
          bordo mentre lui scende, e in SVG avrebbe altezza fissa. */}
      <span className="stagione__ragno">
        <svg viewBox="0 0 28 34" fill="none" strokeLinecap="round">
          <path d="M11 19c-4-1-6-4-7-7M11 21c-4 0-7-1-9-3M11 23c-4 1-6 3-8 6M11 25c-3 2-4 4-4 7" />
          <path d="M17 19c4-1 6-4 7-7M17 21c4 0 7-1 9-3M17 23c4 1 6 3 8 6M17 25c3 2 4 4 4 7" />
          <circle className="stagione__ragno-corpo" cx="14" cy="17.5" r="3.6" />
          <ellipse className="stagione__ragno-corpo" cx="14" cy="25" rx="5.5" ry="6.5" />
        </svg>
      </span>
    </div>
  )
}

/** La decorazione della stagione in corso, senza gli eventi a tempo. */
function Sfondo() {
  const stagione = stagioneDi()
  const natale = eNatale()

  if (stagione === 'estate') {
    return (
      <div className="stagione stagione--estate" aria-hidden="true">
        <svg className="stagione__sole" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="34" className="stagione__disco" />
          <g className="stagione__raggi">
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1="100" y1="46" x2="100" y2="24" transform={`rotate(${i * 30} 100 100)`} />
            ))}
          </g>
        </svg>

        {/* Il mare è il contesto di Tortolì: due onde appena accennate in fondo. */}
        <svg className="stagione__onde" viewBox="0 0 1200 60" preserveAspectRatio="none" fill="none">
          <path d="M0 34c100 0 100-16 200-16s100 16 200 16 100-16 200-16 100 16 200 16 100-16 200-16 100 16 200 16" />
          <path
            className="stagione__onda2"
            d="M0 48c100 0 100-16 200-16s100 16 200 16 100-16 200-16 100 16 200 16 100-16 200-16 100 16 200 16"
          />
        </svg>
      </div>
    )
  }

  if (stagione === 'autunno') {
    return (
      <div className="stagione stagione--autunno" aria-hidden="true">
        {FOGLIE.map((f) => (
          <span className="stagione__cade" key={f.x} style={stile(f)}>
            <Foglia />
          </span>
        ))}
      </div>
    )
  }

  if (stagione === 'primavera') {
    return (
      <div className="stagione stagione--primavera" aria-hidden="true">
        {PETALI.map((p) => (
          <span className="stagione__sale" key={p.x} style={stile(p)}>
            <Petalo />
          </span>
        ))}
      </div>
    )
  }

  // Inverno: nevica sempre, e fra il 1º dicembre e il 6 gennaio si accendono
  // anche le luci. Passata l'Epifania restano solo i fiocchi.
  return (
    <div className="stagione stagione--inverno" aria-hidden="true">
      {natale && (
        <div className="stagione__luci">
          <svg viewBox="0 0 1200 40" preserveAspectRatio="none" fill="none">
            <path d="M0 4c150 26 300 26 450 4s300-22 450 4 150 26 300 4" />
          </svg>
          {[6, 17, 28, 39, 50, 61, 72, 83, 94].map((x, i) => (
            <i key={x} style={{ left: `${x}%`, animationDelay: `${(i % 4) * 0.7}s` }} />
          ))}
        </div>
      )}

      {natale && (
        <div className="stagione__slitta">
          {/* Babbo Natale con le renne e la lista, a colori.
              La slitta attraversa da sinistra a destra: le renne stanno
              davanti, a destra, e tirano; la slitta le segue. I tiranti sono
              spezzati nei due vuoti, perché una riga sola passerebbe da parte
              a parte dei corpi invece di attaccarsi al tiro.
              I colori stanno scritti qui e non nelle variabili del tema:
              il rosso del cappotto e il marrone delle renne sono quelli e
              basta, non cambiano fra tema chiaro e tema scuro. Il bianco
              (barba, pompon, bordo del berretto) ha un filo di contorno
              caldo, altrimenti sparisce sul fondo chiaro della fascia. */}
          <svg viewBox="0 0 260 92" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M84 54h20M152 48h20" stroke={CUOIO} strokeWidth="2.4" />

            <g className="stagione__sacco" transform="translate(14 0)">
              {/* Pattino: la punta ricurva davanti è il segno che dice «slitta». */}
              <path d="M4 76h64M68 76c9 0 12-8 5-12" stroke="#4f5866" strokeWidth="3.6" />
              <path d="M18 76v-6M56 76v-6" stroke="#4f5866" strokeWidth="3" />
              {/* Scocca: schienale alto dietro, fronte che scende verso il tiro. */}
              <path d="M6 70V48h40l16 22Z" fill={ROSSO} />
              <path d="M6 48c-1-10-10-12-13-4-3 8 4 13 9 10l2-5c-3 1-4-1-3-3 1-3 5-2 5 2Z" fill={ROSSO} />
              <path d="M8 62h46" stroke={ORO} strokeWidth="2.4" />

              {/* Babbo Natale: cappotto, cintura, faccia, barba, berretto. */}
              <path d="M20 48c0-8 5-13 11-13s11 5 11 13Z" fill={ROSSO} />
              <path d="M21 44h20" stroke="#33383f" strokeWidth="3.2" />
              <path d="M29 44h5" stroke={ORO} strokeWidth="5" />
              <circle cx="31" cy="31" r="7.5" fill={INCARNATO} />
              <path d="M24 33c0 8 4 11 7 11s8-3 8-10c-2 3-5 4-8 4s-6-2-7-5Z" fill={BIANCO} stroke={BORDO} strokeWidth=".8" />
              <path d="M40 26L18 12c-2-1-4 1-3 3l7 11Z" fill={ROSSO} />
              <path d="M20 26h21" stroke={BIANCO} strokeWidth="4" />
              <circle cx="15" cy="12" r="3.6" fill={BIANCO} stroke={BORDO} strokeWidth=".8" />

              {/* Il braccio regge la lista: va tenuto alto, perché alla stessa
                  inclinazione della fiancata i due tratti si fondevano in uno. */}
              <path d="M40 42l6-9" stroke={ROSSO} strokeWidth="4.5" />
              <rect x="46" y="21" width="16" height="23" fill={PERGAMENA} />
              <rect x="43" y="17" width="22" height="5.5" rx="2.75" fill={CUOIO} />
              <rect x="43" y="42.5" width="22" height="5.5" rx="2.75" fill={CUOIO} />
              <path d="M49 28h10M49 33h10M49 38h7" stroke={INCHIOSTRO} strokeWidth="1.6" />
            </g>

            <g className="stagione__renne">
              {[92, 160].map((dx) => (
                // La renna di testa — quella davanti, a destra — ha il naso rosso.
                <g key={dx} transform={`translate(${dx} 0)`}>
                  <path d="M20 55l-5 17M27 56l-1 16M39 56l2 16M45 54l6 16" stroke={MANTO_SCURO} strokeWidth="3.4" />
                  <ellipse cx="32" cy="46" rx="17" ry="10" fill={MANTO} />
                  <path d="M15 41l-6-5" stroke={MANTO_SCURO} strokeWidth="3" />
                  <path d="M44 45l6-12" stroke={MANTO} strokeWidth="9" />
                  <path d="M47 29c6-4 14-1 14 4 0 4-4 7-8 6l-7-2c-4-1-3-6 1-8Z" fill={MUSO} />
                  <path d="M50 25v-9m0 4l-6-4m6 1l4-6M57 24v-7m0 3l6-5" stroke={CORNA} strokeWidth="2.2" />
                  <circle cx="60" cy="34" r="2.8" fill={dx === 160 ? '#e2453c' : MANTO_SCURO} />
                  {/* Collare con il campanello. */}
                  <path d="M43 38l-2 9" stroke={ROSSO} strokeWidth="2.2" />
                  <circle cx="41" cy="48" r="2.4" fill={ORO} />
                </g>
              ))}
            </g>
          </svg>
        </div>
      )}

      {FIOCCHI.map((f) => (
        <span className="stagione__cade" key={f.x} style={stile(f)}>
          <Fiocco />
        </span>
      ))}
    </div>
  )
}


/* ── La zucca di Halloween ────────────────────────────────────────────────
   Una sera sola. I colori stanno scritti qui come quelli della slitta: una
   zucca e' arancione sia in tema chiaro sia in tema scuro, non segue il
   tema del sito. L'alone caldo dietro fa il lume che trema. */

const BUCCIA = '#d9731f'
const BUCCIA_CHIARA = '#e8893a'
const INTAGLIO = '#3a1a05'
const PICCIOLO = '#5f7a3c'
const LUME = '#ffb340'

function Zucca() {
  return (
    <div className="stagione stagione--zucca" aria-hidden="true">
      <span className="stagione__zucca">
        <svg viewBox="0 0 64 64" fill="none">
          {/* L'alone sta sotto a tutto: e' la luce della candela che esce. */}
          <circle className="stagione__lume" cx="32" cy="40" r="27" fill={LUME} />

          <path d="M32 21c0-6 3-9 8-10" stroke={PICCIOLO} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="32" cy="40" rx="24" ry="20" fill={BUCCIA} />
          {/* Due spicchi piu' chiari: senza, la zucca e' un ovale e basta. */}
          <ellipse cx="21" cy="40" rx="10" ry="19.5" fill={BUCCIA_CHIARA} opacity=".5" />
          <ellipse cx="43" cy="40" rx="10" ry="19.5" fill={BUCCIA_CHIARA} opacity=".5" />

          {/* Occhi, naso e bocca intagliati. */}
          <path d="M19 32h9l-4.5 8z" fill={INTAGLIO} />
          <path d="M36 32h9l-4.5 8z" fill={INTAGLIO} />
          <path d="M32 37l3 5h-6z" fill={INTAGLIO} />
          <path d="M19 46h6l2 4 3-4h4l3 4 2-4h6l-3 8H22z" fill={INTAGLIO} />
        </svg>
      </span>
    </div>
  )
}

/**
 * La stagione, più le decorazioni a tempo che ci si aggiungono sopra.
 * Si sommano invece di sostituirsi: ad agosto restano sole e onde, e le
 * ragnatele stanno negli angoli che il resto lascia liberi.
 */
export function Stagione() {
  return (
    <>
      <Sfondo />
      {eGiorniRagnatele() && <Ragnatele />}
      {eGiornoDellaZucca() && <Zucca />}
    </>
  )
}
