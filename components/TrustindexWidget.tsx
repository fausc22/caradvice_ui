"use client";

import { useEffect, useRef } from "react";

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

  // Efecto para inicializar el widget cuando el script global esté disponible
  useEffect(() => {
    const initializeWidget = () => {
      if (!widgetRef.current) {
        console.warn("⚠️ Elemento del widget no está en el DOM");
        return;
      }

      console.log("✅ Elemento del widget está en el DOM, inicializando...");

      if (window.renderTrustindexWidgets && typeof window.renderTrustindexWidgets === "function") {
        try {
          window.renderTrustindexWidgets();
          console.log("📞 renderTrustindexWidgets() ejecutado");
        } catch (error) {
          console.warn("⚠️ Error al llamar renderTrustindexWidgets():", error);
        }
      } else if (window.TrustindexLoader && typeof window.TrustindexLoader.load === "function") {
        try {
          window.TrustindexLoader.load();
          console.log("📞 TrustindexLoader.load() ejecutado");
        } catch (error) {
          console.warn("⚠️ Error al llamar TrustindexLoader.load():", error);
        }
      } else {
        console.warn("⚠️ Ninguna API de Trustindex está disponible todavía");
      }

      if (checkWidgetRendered()) {
        return;
      }
    };

    // Intentar inicializar inmediatamente y luego reintentar
    initializeWidget();

    if (!checkIntervalRef.current) {
      let attempts = 0;
      const maxAttempts = 40; // 20 segundos (40 * 500ms)

      checkIntervalRef.current = setInterval(() => {
        attempts++;

        initializeWidget();

        if (checkWidgetRendered()) {
          return;
        }

        if (attempts >= maxAttempts) {
          console.warn("⚠️ Trustindex widget no se renderizó después de 20 segundos");
          console.warn("Verifica:");
          console.warn("1. Dominio verificado en Trustindex");
          console.warn("2. Widget ID correcto y activo:", widgetId);
          console.warn("3. Widget tiene reseñas para mostrar");

          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
          }
        }
      }, 500);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [widgetId]);

  return (
    <>
      {/* Elemento del widget - debe estar en el DOM antes de que el script se ejecute */}
      <div
        ref={widgetRef}
        id={`trustindex-widget-${widgetId}`}
        className="trustindex-widget"
        data-widget-id={widgetId}
        data-lazyload="true"
        suppressHydrationWarning
      />
    </>
  );
}
