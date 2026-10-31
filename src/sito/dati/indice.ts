import type { NomeIcona } from '../componenti/Icona'
import { ARTICOLI } from './blog'
import { FAQ } from './contenuti'
import { SERVIZI } from './servizi'

export interface VoceIndice {
  titolo: string
  nota: string
  percorso: string
  icona: NomeIcona
  /** Parole aggiuntive considerate dalla ricerca */
  chiavi: string
}

const PAGINE: VoceIndice[] = [
  { titolo: 'Stato riparazione', nota: 'Traccia la pratica con il codice', percorso: '/stato-riparazione', icona: 'search', chiavi: 'tracking codice pratica dove riparazione avanzamento' },
  { titolo: 'Preventivo online', nota: 'Stima immediata in tre passaggi', percorso: '/preventivo', icona: 'euro', chiavi: 'costo prezzo quanto costa stima' },
  { titolo: 'Prenota un appuntamento', nota: 'Scegli giorno e orario', percorso: '/prenota', icona: 'calendar', chiavi: 'appuntamento prenotazione ritiro' },
  { titolo: 'Tessera fedeltà', nota: 'Punti, buoni sconto e Porta un amico', percorso: '/tessera', icona: 'star', chiavi: 'punti fedelta sconto buono premio amico invito codice app' },
  { titolo: 'Area clienti', nota: 'Pratiche, preventivi e documenti', percorso: '/area-clienti', icona: 'user', chiavi: 'login accesso fatture garanzia documenti' },
  { titolo: 'Contatti e orari', nota: 'Telefono, WhatsApp, indirizzo', percorso: '/contatti', icona: 'pin', chiavi: 'dove siamo orari telefono mappa email whatsapp' },
  { titolo: 'Chi siamo', nota: 'Storia, valori e team', percorso: '/chi-siamo', icona: 'shield', chiavi: 'azienda storia missione laboratorio' },
  { titolo: 'Galleria lavori', nota: 'Laboratorio e impianti', percorso: '/galleria', icona: 'box', chiavi: 'foto lavori immagini interventi' },
  { titolo: 'Blog', nota: 'Guide e consigli dei tecnici', percorso: '/blog', icona: 'doc', chiavi: 'articoli guide notizie' },
  { titolo: 'Privacy Policy', nota: 'Informativa GDPR', percorso: '/privacy', icona: 'lock', chiavi: 'privacy dati gdpr trattamento' },
  { titolo: 'Cookie Policy', nota: 'Cookie e preferenze', percorso: '/cookie-policy', icona: 'lock', chiavi: 'cookie consenso banner' },
]

/** Parole con cui i clienti descrivono il guasto, per servizio. */
const SINTOMI: Record<string, string> = {
  'riparazione-smartphone': 'display rotto schermo caduto batteria non si accende acqua ossido ricarica microfono',
  'riparazione-tablet': 'vetro rotto touch non funziona batteria gonfia ricarica',
  'riparazione-computer': 'lento lentezza si spegne non si avvia virus malware formattazione windows blocco',
  'assistenza-notebook': 'lento surriscalda ventola rumorosa cerniera rotta tastiera ssd ram batteria',
  'riparazione-console': 'playstation ps4 ps5 xbox nintendo switch joypad controller drifting ventola rumorosa hdmi lettore',
  'recupero-dati': 'hard disk non riconosciuto file persi foto cancellate formattato ripristino backup',
  videosorveglianza: 'telecamere allarme furto negozio casa registratore nvr visione da remoto',
  'impianti-wifi': 'internet lento non prende segnale copertura router modem fibra ripetitore',
  'reti-aziendali': 'server vlan firewall vpn lavoro da remoto sicurezza rete ufficio',
  'access-point': 'segnale camere hotel copertura ripetitore mesh roaming',
  'cablaggio-rete': 'cavi lan presa rete armadio rack fibra ottica certificazione',
  'assistenza-aziende': 'contratto manutenzione sla hotel bnb negozio ufficio ristorante assistenza continuativa',
}

export const INDICE: VoceIndice[] = [
  ...SERVIZI.map<VoceIndice>((s) => ({
    titolo: s.titolo,
    nota: `Servizio · ${s.prezzo}`,
    percorso: `/servizi/${s.id}`,
    icona: s.icona,
    chiavi: `${s.tag.join(' ')} ${s.descrizione} ${SINTOMI[s.id] ?? ''}`,
  })),
  ...ARTICOLI.map<VoceIndice>((a) => ({
    titolo: a.titolo,
    nota: `Blog · ${a.categoria}`,
    percorso: `/blog/${a.slug}`,
    icona: 'doc',
    chiavi: a.sommario,
  })),
  ...FAQ.map<VoceIndice>((f) => ({
    titolo: f.domanda,
    nota: 'Domanda frequente',
    percorso: '/servizi#domande',
    icona: 'chat',
    chiavi: f.risposta,
  })),
  ...PAGINE,
]

/**
 * Riduce testo e query alla stessa forma: minuscole, senza accenti e senza
 * punteggiatura. Così "Wi-Fi", "wifi" e "WI FI" trovano gli stessi risultati.
 */
const normalizza = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Parole con cui i clienti cercano un servizio senza usarne il nome esatto. */
const SINONIMI: Record<string, string> = {
  telecamere: 'videosorveglianza',
  telecamera: 'videosorveglianza',
  allarme: 'videosorveglianza',
  pc: 'computer',
  portatile: 'notebook',
  cellulare: 'smartphone',
  telefono: 'smartphone',
  schermo: 'display',
  vetro: 'display',
  costo: 'prezzo',
  preventivi: 'preventivo',
  orario: 'orari',
}

/** Forma senza spazi: rende equivalenti "Wi-Fi" e "wifi". */
const compatta = (v: string) => normalizza(v).replace(/ /g, '')

export function cerca(query: string, massimo = 8): VoceIndice[] {
  const q = normalizza(query)
  if (!q) return PAGINE.slice(0, 6)

  const parole = q.split(' ')
  const cercate = parole.flatMap((p) => [p, SINONIMI[p]].filter(Boolean) as string[])

  return INDICE.filter((v) => {
    const testo = compatta(`${v.titolo} ${v.nota} ${v.chiavi}`)
    return parole.every((p) => testo.includes(p) || (SINONIMI[p] && testo.includes(SINONIMI[p])))
  })
    .sort((a, b) => punteggio(b, cercate) - punteggio(a, cercate))
    .slice(0, massimo)
}

/** I risultati con la parola cercata nel titolo vengono prima. */
const punteggio = (v: VoceIndice, parole: string[]) => {
  const titolo = compatta(v.titolo)
  return parole.reduce((somma, p) => somma + (titolo.includes(p) ? 2 : 0), 0)
}
