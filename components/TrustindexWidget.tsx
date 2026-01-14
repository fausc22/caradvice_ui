"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function TrustindexWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const initializationAttemptedRef = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);

  // Función para inicializar el widget
  const initializeWidget = () => {
    if (initializationAttemptedRef.current) {
      return false;
    }

    if (!widgetRef.current) {
      return false;
    }

    // Verificar si TrustindexLoader está disponible
    if (window.TrustindexLoader && typeof window.TrustindexLoader.load === 'function') {
      try {
        // Trustindex busca automáticamente elementos con data-widget-id
        // Llamamos a load() para forzar la inicialización
        window.TrustindexLoader.load();
        initializationAttemptedRef.current = true;
        console.log("✅ Trustindex widget inicializado correctamente");
        return true;
      } catch (error) {
        console.error("❌ Error al inicializar Trustindex:", error);
        return false;
      }
    }

    return false;
  };

  // Efecto para verificar periódicamente si TrustindexLoader está disponible
  useEffect(() => {
    if (!scriptReady || initializationAttemptedRef.current) {
      return;
    }

    // Intentar inicializar inmediatamente si ya está disponible
    if (initializeWidget()) {
      return;
    }

    // Si no está disponible, verificar periódicamente
    let attempts = 0;
    const maxAttempts = 20; // 10 segundos máximo (20 * 500ms)

    const checkInterval = setInterval(() => {
      attempts++;
      
      if (initializeWidget()) {
        clearInterval(checkInterval);
      } else if (attempts >= maxAttempts) {
        console.warn("⚠️ TrustindexLoader no está disponible después de varios intentos");
        console.warn("El widget puede renderizarse automáticamente. Verifica en el DOM.");
        clearInterval(checkInterval);
      }
    }, 500); // Verificar cada 500ms

    return () => clearInterval(checkInterval);
  }, [scriptReady]);

  return (
    <>
      {/* Cargar el script de Trustindex usando next/script */}
      <Script
        id="trustindex-loader"
        src="https://cdn.trustindex.io/loader.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("📦 Script de Trustindex cargado");
          // Dar tiempo al script para que inicialice TrustindexLoader
          setTimeout(() => {
            setScriptReady(true);
          }, 200);
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
            Estado: {scriptReady ? "✅ Script listo" : "⏳ Cargando..."} | 
            {initializationAttemptedRef.current ? " ✅ Inicializado" : " ⏳ Esperando TrustindexLoader"}
          </p>
        </div>
      )}
    </>
  );
}
