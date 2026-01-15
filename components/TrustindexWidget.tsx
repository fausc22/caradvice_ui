"use client";

import { useEffect, useRef } from "react";

/**
 * Componente TrustindexWidget - Versión oficial
 * 
 * Usa un script nativo para asegurar que el widget se inyecte
 * exactamente donde está el componente, no al final del body.
 */
export default function TrustindexWidget() {
  const widgetId = "855b5c856aad24344896429404f";
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Evitar cargar el script múltiples veces
    if (scriptLoadedRef.current || !containerRef.current) return;
    
    // Verificar si el script ya existe
    const existingScript = document.getElementById(`trustindex-script-${widgetId}`);
    if (existingScript) {
      scriptLoadedRef.current = true;
      return;
    }

    // Crear el script y agregarlo al contenedor
    const script = document.createElement("script");
    script.id = `trustindex-script-${widgetId}`;
    script.src = `https://cdn.trustindex.io/loader.js?${widgetId}`;
    script.defer = true;
    script.async = true;
    
    containerRef.current.appendChild(script);
    scriptLoadedRef.current = true;

    return () => {
      // Cleanup: no removemos el script porque Trustindex ya inyectó el contenido
    };
  }, [widgetId]);

  return (
    <div 
      ref={containerRef}
      className="trustindex-widget-container w-full overflow-hidden"
    />
  );
}
