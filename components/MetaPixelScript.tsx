"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

interface MetaPixelScriptProps {
  pixelId: string;
}

export default function MetaPixelScript({ pixelId }: MetaPixelScriptProps) {
  const pathname = usePathname();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Verificar en el cliente que NO estemos en Vestri
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isVestriSubdomain = hostname.startsWith("vestri.");
      const isVestriRoute = pathname.startsWith("/vestri");
      
      // Solo cargar si NO es Vestri
      if (!isVestriSubdomain && !isVestriRoute) {
        setShouldLoad(true);
      }
    }
  }, [pathname]);

  // No renderizar nada si es Vestri
  if (!shouldLoad) {
    return null;
  }

  return (
    <Script
      id="meta-pixel-caradvice"
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
        `,
      }}
    />
  );
}
