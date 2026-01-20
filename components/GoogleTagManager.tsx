"use client";

import { useEffect } from "react";

interface GoogleTagManagerProps {
  gtmId: string;
}

export default function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  useEffect(() => {
    // Verificar si ya existe el script para evitar duplicados
    if (document.getElementById("google-tag-manager-script")) {
      return;
    }

    // Inyectar el script de GTM en el head, lo más arriba posible
    const script = document.createElement("script");
    script.id = "google-tag-manager-script";
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    
    // Insertar al principio del head
    if (document.head.firstChild) {
      document.head.insertBefore(script, document.head.firstChild);
    } else {
      document.head.appendChild(script);
    }
  }, [gtmId]);

  return null;
}
