"use client";

import { useEffect, useRef } from "react";

/**
 * Componente TrustindexWidget
 * 
 * El script de Trustindex se carga globalmente en layout.tsx.
 * Este componente solo renderiza el div con data-widget-id.
 * Trustindex busca automáticamente estos elementos y los renderiza.
 * 
 * IMPORTANTE: El widget solo funcionará si:
 * 1. El dominio está verificado en Trustindex
 * 2. El widget ID es correcto y está activo
 * 3. El script se carga correctamente (en layout.tsx)
 */
export default function TrustindexWidget() {
  const widgetId = "855b5c856aad24344896429404f";
  const widgetRef = useRef<HTMLDivElement>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar si el widget se renderizó
  const checkWidgetRendered = () => {
    if (!widgetRef.current) {
      return false;
    }

    const element = widgetRef.current;
    
    // Verificar si Trustindex renderizó contenido
    // Trustindex agrega contenido dentro del div con data-widget-id
    const hasContent = 
      element.children.length > 0 ||
      element.innerHTML.trim().length > 0 ||
      element.querySelector('[class*="ti-"]') !== null ||
      element.querySelector('[class*="trustindex"]') !== null ||
      element.querySelector('iframe') !== null ||
      element.querySelector('[id*="ti-"]') !== null;

    if (hasContent) {
      console.log("✅ Trustindex widget renderizado correctamente");
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return true;
    }

    return false;
  };

  // Efecto para verificar el widget y forzar renderizado si es necesario
  useEffect(() => {
    const initializeWidget = () => {
      // Si TrustindexLoader está disponible, intentar forzar carga
      if (window.TrustindexLoader && typeof window.TrustindexLoader.load === 'function') {
        try {
          window.TrustindexLoader.load();
          console.log("📞 TrustindexLoader.load() llamado desde widget");
        } catch (error) {
          console.warn("⚠️ Error al llamar TrustindexLoader.load():", error);
        }
      }

      // Verificar si el widget se renderizó
      if (checkWidgetRendered()) {
        return;
      }

      // Si no se renderizó, verificar periódicamente
      if (!checkIntervalRef.current) {
        let attempts = 0;
        const maxAttempts = 40; // 20 segundos (40 * 500ms)

        checkIntervalRef.current = setInterval(() => {
          attempts++;
          
          // Intentar forzar carga cada 5 segundos
          if (attempts % 10 === 0 && window.TrustindexLoader && typeof window.TrustindexLoader.load === 'function') {
            try {
              window.TrustindexLoader.load();
            } catch (error) {
              // Ignorar errores en reintentos
            }
          }
          
          if (checkWidgetRendered()) {
            return;
          }

          if (attempts >= maxAttempts) {
            console.warn("⚠️ Trustindex widget no se renderizó después de 20 segundos");
            console.warn("Verifica:");
            console.warn("1. Dominio verificado en Trustindex");
            console.warn("2. Widget ID correcto y activo:", widgetId);
            console.warn("3. Elemento en DOM:", widgetRef.current);
            
            // Mostrar información del elemento
            if (widgetRef.current) {
              console.warn("Elemento HTML:", widgetRef.current.outerHTML.substring(0, 200));
              console.warn("Script cargado:", !!document.getElementById("trustindex-loader"));
              console.warn("TrustindexLoader disponible:", !!window.TrustindexLoader);
            }
            
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              checkIntervalRef.current = null;
            }
          }
        }, 500);
      }
    };

    // Verificar inmediatamente si el script ya está cargado
    if (document.getElementById("trustindex-loader")) {
      // Script ya cargado, esperar un momento y verificar
      setTimeout(initializeWidget, 500);
    } else {
      // Script aún no cargado, esperar a que cargue
      const checkScript = setInterval(() => {
        if (document.getElementById("trustindex-loader")) {
          clearInterval(checkScript);
          setTimeout(initializeWidget, 500);
        }
      }, 100);

      // Limpiar después de 10 segundos si el script no carga
      setTimeout(() => {
        clearInterval(checkScript);
      }, 10000);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={widgetRef}
      id={`trustindex-widget-${widgetId}`}
      className="trustindex-widget"
      data-widget-id={widgetId}
      suppressHydrationWarning
    />
  );
}
