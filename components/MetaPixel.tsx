'use client'

import Script from 'next/script'

/**
 * Componente Meta Pixel (Facebook Pixel)
 * 
 * Detecta automáticamente si estamos en Vestri y carga el pixel correspondiente:
 * - Pixel de VESTRI (1601853571182218) para:
 *   - Rutas que empiezan con /vestri
 *   - Subdominio vestri.caradvice.com.ar
 * - Pixel de CAR ADVICE (1505816897053043) para el resto de las páginas
 * 
 * La detección se hace en el script del navegador para evitar problemas de hidratación
 */
export default function MetaPixel() {
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Detectar si estamos en Vestri por subdominio O por pathname
              var isVestri = window.location.hostname.startsWith('vestri.') || 
                             window.location.pathname.startsWith('/vestri');
              
              // Seleccionar el pixel ID correspondiente
              var pixelId = isVestri 
                ? '1601853571182218'   // VESTRI
                : '1505816897053043';  // CAR ADVICE
              
              // Cargar Meta Pixel
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              fbq('init', pixelId);
              fbq('track', 'PageView');
              
              // Guardar el pixelId para el noscript fallback (opcional, para debugging)
              window.__metaPixelId = pixelId;
            })();
          `
        }}
      />
      {/* 
        Noscript fallback - usa el pixel de CAR ADVICE por defecto
        ya que sin JS no podemos detectar el subdominio dinámicamente.
        En la práctica, casi todos los usuarios tienen JS habilitado.
      */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=1505816897053043&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </>
  )
}

