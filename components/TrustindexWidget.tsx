"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

/**
 * Componente TrustindexWidget
 * 
 * IMPORTANTE: Este componente carga el script DESPUÉS de que el elemento
 * esté en el DOM. Esto asegura que Trustindex encuentre el elemento cuando
 * el script se ejecuta.
 * 
 * Flujo:
 * 1. El componente se monta → el div con data-widget-id está en el DOM
 * 2. Se carga el script loader.js
 * 3. Trustindex busca elementos con data-widget-id y los registra
 * 4. Llamamos a renderTrustindexWidgets() para renderizar
 * 
 * IMPORTANTE: El widget solo funcionará si:
 * 1. El dominio está verificado en Trustindex
 * 2. El widget ID es correcto y está activo
 * 3. El widget tiene reseñas para mostrar
 */
export default function TrustindexWidget() {
  const widgetId = "855b5c856aad24344896429404f";
  const widgetRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

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

  // Inicializar el widget cuando el script esté disponible
  useEffect(() => {
    const initializeWidget = () => {
      if (!widgetRef.current) {
        console.warn("⚠️ Elemento del widget no está en el DOM");
        return;
      }

      if (window.renderTrustindexWidgets && typeof window.renderTrustindexWidgets === "function") {
        try {
          window.renderTrustindexWidgets();
        } catch (error) {
          console.warn("⚠️ Error al llamar renderTrustindexWidgets():", error);
        }
      } else if (window.TrustindexLoader && typeof window.TrustindexLoader.load === "function") {
        try {
          window.TrustindexLoader.load();
        } catch (error) {
          console.warn("⚠️ Error al llamar TrustindexLoader.load():", error);
        }
      }
    };

    if (scriptLoaded) {
      initializeWidget();
      return;
    }

    // Si el script ya estaba cargado por caché, intentar igual
    if (
      window.renderTrustindexWidgets ||
      (window.TrustindexLoader && typeof window.TrustindexLoader.load === "function")
    ) {
      initializeWidget();
    }
  }, [scriptLoaded, widgetId]);

  return (
    <>
      <Script
        id={`trustindex-loader-${widgetId}`}
        src="https://cdn.trustindex.io/loader.js"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("❌ Error al cargar script de Trustindex:", e);
        }}
      />

      {/* Elemento del widget - debe estar en el DOM antes de que el script se ejecute */}
      <div
        ref={widgetRef}
        id={`trustindex-widget-${widgetId}`}
        className="trustindex-widget"
        data-widget-id={widgetId}
        suppressHydrationWarning
      />
    </>
  );
}
