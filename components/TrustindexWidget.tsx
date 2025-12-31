"use client";

import { useEffect, useRef } from "react";

export default function TrustindexWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verificar si el script ya existe
    if (document.getElementById("trustindex-loader")) {
      return;
    }

    // Esperar a que el div esté en el DOM
    if (!widgetRef.current) {
      return;
    }

    // Cargar el script de Trustindex
    const script = document.createElement("script");
    script.id = "trustindex-loader";
    script.src = "https://cdn.trustindex.io/loader.js";
    script.async = true;
    script.charset = "utf-8";
    
    script.onload = () => {
      // Forzar inicialización después de que el script cargue
      if (window.TrustindexLoader) {
        window.TrustindexLoader.load();
      }
    };
    
    document.body.appendChild(script);
  }, []);

  return (
    <div
      ref={widgetRef}
      className="trustindex-widget"
      data-widget-id="855b5c856aad24344896429404f"
      suppressHydrationWarning
    />
  );
}
