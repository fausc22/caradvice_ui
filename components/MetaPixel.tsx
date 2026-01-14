'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

/**
 * Componente Meta Pixel (Facebook Pixel)
 * 
 * Detecta automáticamente la ruta actual y carga el pixel correspondiente:
 * - Pixel de VESTRI (1601853571182218) para rutas que empiezan con /vestri
 * - Pixel de CAR ADVICE (1505816897053043) para el resto de las páginas
 */
export default function MetaPixel() {
  const pathname = usePathname()
  const isVestri = pathname?.startsWith('/vestri')
  
  const pixelId = isVestri 
    ? '1601853571182218'  // VESTRI
    : '1505816897053043'  // CAR ADVICE
  
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

