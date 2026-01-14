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
        
        // Verificar si el script realmente se ejecutó
        const scriptElement = document.getElementById("trustindex-loader") as HTMLScriptElement;
        if (scriptElement) {
          console.log("✅ Elemento script encontrado en DOM");
          console.log("Script src:", scriptElement.src);
          console.log("Script ejecutado:", scriptElement.textContent?.length > 0 || scriptElement.innerHTML?.length > 0);
        }
        
        // Verificar API de Trustindex en múltiples momentos
        const checkTrustindexAPI = (attempt: number, maxAttempts: number = 10) => {
          // Verificar si renderTrustindexWidgets está disponible (API nueva)
          if (window.renderTrustindexWidgets && typeof window.renderTrustindexWidgets === 'function') {
            console.log(`✅ renderTrustindexWidgets disponible después de ${attempt} intentos`);
            try {
              window.renderTrustindexWidgets();
              console.log("📞 renderTrustindexWidgets() ejecutado");
              return;
            } catch (error) {
              console.error("❌ Error al ejecutar renderTrustindexWidgets():", error);
            }
          }
          
          // Verificar si TrustindexLoader está disponible (API antigua)
          if (window.TrustindexLoader && typeof window.TrustindexLoader.load === 'function') {
            console.log(`✅ TrustindexLoader disponible después de ${attempt} intentos`);
            try {
              window.TrustindexLoader.load();
              console.log("📞 TrustindexLoader.load() ejecutado");
              return;
            } catch (error) {
              console.error("❌ Error al ejecutar TrustindexLoader.load():", error);
            }
          }
          
          if (attempt < maxAttempts) {
            setTimeout(() => checkTrustindexAPI(attempt + 1, maxAttempts), 500);
          } else {
            // Verificar qué objetos de Trustindex están disponibles
            const trustindexObjects = Object.keys(window).filter(key => 
              key.toLowerCase().includes('trust') && key !== 'trustedTypes'
            );
            
            if (trustindexObjects.length > 0) {
              console.warn("⚠️ Trustindex API no está disponible, pero se encontraron estos objetos:", trustindexObjects);
              console.warn("El widget puede renderizarse automáticamente sin necesidad de llamar a ninguna función");
              console.warn("Trustindex busca automáticamente elementos con data-widget-id y los renderiza");
            } else {
              console.error("❌ No se encontraron objetos de Trustindex después de", maxAttempts, "intentos");
              console.error("Posibles causas:");
              console.error("1. El dominio no está verificado en Trustindex");
              console.error("2. El script tiene un error que impide la inicialización");
              console.error("3. Hay un problema de CORS o seguridad");
              console.error("4. El widget ID no es válido o el widget no está activo");
              console.error("Verifica la pestaña Network para ver si hay errores al cargar el script");
              console.error("Verifica la pestaña Console para ver si hay errores de JavaScript");
            }
          }
        };
        
        // Empezar a verificar después de un pequeño delay
        setTimeout(() => checkTrustindexAPI(1), 500);
      }}
      onError={(e) => {
        console.error("❌ Error al cargar script de Trustindex:", e);
        console.error("Esto puede indicar:");
        console.error("1. Problema de red");
        console.error("2. Bloqueador de anuncios");
        console.error("3. Problema de CORS");
      }}
    />
  )
}

