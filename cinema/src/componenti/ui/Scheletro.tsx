import { classi } from '@/lib/utili'

/**
 * Segnaposto di caricamento.
 *
 * Serve dove il contenuto arriva dopo il primo disegno: la mappa dei posti
 * mentre si interroga la disponibilità, la ricerca mentre si scrive. Le forme
 * hanno le proporzioni del contenuto che sostituiscono, perché uno scheletro
 * che non combacia con quello che arriva produce un salto della pagina —
 * l'esatto contrario di quello per cui esiste.
 */
export function Scheletro({ className }: { className?: string }) {
  return <div className={classi('scheletro rounded-tenue', className)} aria-hidden />
}

/** Griglia di locandine in attesa. */
export function ScheletroLocandine({ quante = 6 }: { quante?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5"
      role="status"
      aria-label="Caricamento dei film in corso"
    >
      {Array.from({ length: quante }, (_, indice) => (
        <div key={indice} className="space-y-3">
          <Scheletro className="locandina w-full rounded-morbido" />
          <Scheletro className="h-4 w-4/5" />
          <Scheletro className="h-3 w-2/5" />
        </div>
      ))}
    </div>
  )
}

/** Righe di testo in attesa. */
export function ScheletroTesto({ righe = 3 }: { righe?: number }) {
  return (
    <div className="space-y-2.5" role="status" aria-label="Caricamento in corso">
      {Array.from({ length: righe }, (_, indice) => (
        <Scheletro
          key={indice}
          className={classi('h-3.5', indice === righe - 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  )
}
