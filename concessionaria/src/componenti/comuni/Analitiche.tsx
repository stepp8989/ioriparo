'use client'

import Script from 'next/script'
import { useConsenso } from '@/componenti/comuni/Consenso'

/**
 * Google Analytics 4, subordinato al consenso.
 *
 * Lo script non viene inserito nella pagina finché il consenso non è
 * esplicito: è la differenza fra rispettare la scelta dell'utente e limitarsi
 * a dichiararlo. Senza `NEXT_PUBLIC_GA_ID` non si carica mai nulla, e il sito
 * funziona identico.
 */
export function Analitiche() {
  const { stato } = useConsenso()
  const misurazione = process.env.NEXT_PUBLIC_GA_ID

  if (!misurazione || stato !== 'accettato') return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${misurazione}`}
        strategy="afterInteractive"
      />
      <Script id="analitiche" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());gtag('config','${misurazione}',{anonymize_ip:true});`}
      </Script>
    </>
  )
}
