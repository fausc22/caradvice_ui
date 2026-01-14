"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export default function TrustindexWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const initializationAttemptedRef = useRef(false);

  // Función para inicializar el widget
  const initializeWidget = () => {
    if (initializationAttemptedRef.current) {
      return;
    }

    if (!widgetRef.current) {
      return;
    }

    // Verificar si TrustindexLoader está disponible
    if (window.TrustindexLoader) {
      try {
        // Trustindex busca automáticamente elementos con data-widget-id
        // pero también podemos llamar a load() explícitamente
        window.TrustindexLoader.load();
        initializationAttemptedRef.current = true;
        console.log("Trustindex widget inicializado correctamente");
      } catch (error) {
        console.error("Error al inicializar Trustindex:", error);
      }
    } else {
      console.warn("TrustindexLoader no está disponible aún");
    }
  };

  // Efecto para intentar inicializar cuando el componente se monta
  // y el script ya está cargado
  useEffect(() => {
    // Si el script ya está cargado, intentar inicializar inmediatamente
    if (window.TrustindexLoader) {
      initializeWidget();
    }

    // También intentar después de un pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      if (window.TrustindexLoader && !initializationAttemptedRef.current) {
        initializeWidget();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Cargar el script de Trustindex usando next/script */}
      <Script
        id="trustindex-loader"
        src="https://cdn.trustindex.io/loader.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Script de Trustindex cargado");
          // Intentar inicializar después de que el script cargue
          setTimeout(() => {
            initializeWidget();
          }, 100);
        }}
        onError={(e) => {
          console.error("Error al cargar el script de Trustindex:", e);
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
        </div>
      )}
    </>
  );
}
