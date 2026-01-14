'use client'

import Script from 'next/script'

/**
 * Componente para cargar el script de Trustindex globalmente
 * Se carga en layout.tsx para que esté disponible en toda la aplicación
 */
export default function TrustindexScript() {
  return (
    <Script
      id="trustindex-loader"
      src="https://cdn.trustindex.io/loader.js"
      strategy="afterInteractive"
      onLoad={() => {
        console.log("📦 Script de Trustindex cargado globalmente");
        // Trustindex busca automáticamente elementos con data-widget-id
        // Si TrustindexLoader está disponible, llamar a load() para forzar renderizado
        setTimeout(() => {
          if (window.TrustindexLoader && typeof window.TrustindexLoader.load === 'function') {
            try {
              window.TrustindexLoader.load();
              console.log("📞 TrustindexLoader.load() ejecutado");
            } catch (error) {
              console.warn("⚠️ Error al ejecutar TrustindexLoader.load():", error);
            }
          }
        }, 500);
      }}
      onError={(e) => {
        console.error("❌ Error al cargar script de Trustindex:", e);
      }}
    />
  )
}

