'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useConsenso } from '@/componenti/comuni/Consenso'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...argomenti: unknown[]) => void
  }
}

const MISURAZIONE = process.env.NEXT_PUBLIC_GA_ID

/**
 * Google Analytics 4, caricato solo dopo il consenso.
 *
 * Lo script non viene inserito nel documento finché la categoria «statistiche»
 * non è stata accettata: prima di allora non parte nessuna richiesta verso
 * Google e non viene scritto alcun cookie. Il cambio di pagina viene notificato
 * a mano perché con il router di Next non c'è un caricamento completo.
 */
export function Analitiche() {
  const { consenso } = useConsenso()
  const percorso = usePathname()
  const attivo = Boolean(MISURAZIONE) && consenso.statistiche

  useEffect(() => {
    if (!attivo || typeof window.gtag !== 'function') return
    window.gtag('config', MISURAZIONE as string, { page_path: percorso })
  }, [attivo, percorso])

  if (!attivo) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MISURAZIONE}`}
        strategy="afterInteractive"
      />
      <Script id="ga-configurazione" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
window.gtag=gtag;
gtag('js', new Date());
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
gtag('config','${MISURAZIONE}',{anonymize_ip:true});`}
      </Script>
    </>
  )
}
