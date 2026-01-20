"use client";

import { useEffect } from "react";

interface GoogleTagManagerNoscriptProps {
  gtmId: string;
}

export default function GoogleTagManagerNoscript({
  gtmId,
}: GoogleTagManagerNoscriptProps) {
  useEffect(() => {
    // Inyectar el noscript de GTM justo después de la apertura del body
    const noscript = document.createElement("noscript");
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    noscript.appendChild(iframe);

    // Insertar justo después de la apertura del body
    if (document.body) {
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    // Cleanup
    return () => {
      if (document.body && document.body.contains(noscript)) {
        document.body.removeChild(noscript);
      }
    };
  }, [gtmId]);

  return null;
}
