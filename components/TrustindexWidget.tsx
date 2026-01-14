"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function TrustindexWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [widgetRendered, setWidgetRendered] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Verificar si el widget se ha renderizado en el DOM
  const checkWidgetRendered = () => {
    if (!widgetRef.current) {
      return false;
    }

    // Trustindex renderiza el contenido dentro del div con data-widget-id
    // Verificamos si hay contenido renderizado (no solo el div vacío)
    const hasContent = 
      widgetRef.current.children.length > 0 || 
      widgetRef.current.innerHTML.trim().length > 0 ||
      widgetRef.current.querySelector('[class*="trustindex"]') !== null ||
      widgetRef.current.querySelector('[class*="ti-widget"]') !== null;

    if (hasContent && !widgetRendered) {
      setWidgetRendered(true);
      console.log("✅ Trustindex widget renderizado correctamente en el DOM");
      return true;
    }

    return hasContent;
  };

  // Efecto para verificar periódicamente si el widget se renderizó
  useEffect(() => {
    if (!scriptLoaded) {
      return;
    }

    // Trustindex renderiza automáticamente, pero puede tardar un poco
    // Verificamos periódicamente si el contenido apareció
    let attempts = 0;
    const maxAttempts = 30; // 15 segundos máximo (30 * 500ms)

    const checkInterval = setInterval(() => {
      attempts++;
      
      if (checkWidgetRendered()) {
        clearInterval(checkInterval);
      } else if (attempts >= maxAttempts) {
        console.warn("⚠️ Trustindex widget no se ha renderizado después de 15 segundos");
        console.warn("Posibles causas:");
        console.warn("1. El dominio no está verificado en Trustindex");
        console.warn("2. El widget ID es incorrecto o el widget no está activo");
        console.warn("3. El widget está bloqueado por políticas de seguridad");
        console.warn("Verifica el elemento en el DOM:", widgetRef.current);
        clearInterval(checkInterval);
      }
    }, 500); // Verificar cada 500ms

    // También intentar llamar a load() si TrustindexLoader está disponible
    const tryLoad = () => {
      if (window.TrustindexLoader && typeof window.TrustindexLoader.load === 'function') {
        try {
          window.TrustindexLoader.load();
          console.log("📞 Llamada a TrustindexLoader.load() ejecutada");
        } catch (error) {
          console.warn("⚠️ Error al llamar TrustindexLoader.load():", error);
        }
      }
    };

    // Intentar después de que el script cargue
    setTimeout(tryLoad, 500);
    setTimeout(tryLoad, 2000);
    setTimeout(tryLoad, 5000);

    return () => clearInterval(checkInterval);
  }, [scriptLoaded, widgetRendered]);

  return (
    <>
      {/* Cargar el script de Trustindex usando next/script */}
      <Script
        id="trustindex-loader"
        src="https://cdn.trustindex.io/loader.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("📦 Script de Trustindex cargado");
          setScriptLoaded(true);
          // Trustindex debería renderizar automáticamente elementos con data-widget-id
          // Dar un momento para que procese
          setTimeout(() => {
            checkWidgetRendered();
          }, 1000);
        }}
        onError={(e) => {
          console.error("❌ Error al cargar el script de Trustindex:", e);
        }}
      />
      
      {/* Contenedor del widget */}
      <div
        ref={widgetRef}
        className="trustindex-widget"
        data-widget-id="855b5c856aad24344896429404f"
        suppressHydrationWarning
      />
      
      {/* Mensaje de debug solo en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
          <p>⚠️ Trustindex requiere dominio verificado</p>
          <p>En localhost puede no funcionar. Verifica en producción (caradvice.com.ar)</p>
          <p>Widget ID: 855b5c856aad24344896429404f</p>
          <p className="mt-1">
            Script: {scriptLoaded ? "✅ Cargado" : "⏳ Cargando..."} | 
            Widget: {widgetRendered ? "✅ Renderizado" : "⏳ Esperando..."}
          </p>
        </div>
      )}
    </>
  );
}
