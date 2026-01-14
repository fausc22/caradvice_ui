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
        
        // Verificar TrustindexLoader en múltiples momentos
        const checkTrustindexLoader = (attempt: number, maxAttempts: number = 10) => {
          if (window.TrustindexLoader) {
            console.log(`✅ TrustindexLoader disponible después de ${attempt} intentos`);
            try {
              if (typeof window.TrustindexLoader.load === 'function') {
                window.TrustindexLoader.load();
                console.log("📞 TrustindexLoader.load() ejecutado");
              } else {
                console.warn("⚠️ TrustindexLoader existe pero no tiene método load()");
                console.warn("TrustindexLoader:", window.TrustindexLoader);
              }
            } catch (error) {
              console.error("❌ Error al ejecutar TrustindexLoader.load():", error);
            }
            return;
          }
          
          if (attempt < maxAttempts) {
            setTimeout(() => checkTrustindexLoader(attempt + 1, maxAttempts), 500);
          } else {
            console.error("❌ TrustindexLoader NO está disponible después de", maxAttempts, "intentos");
            console.error("Posibles causas:");
            console.error("1. El dominio no está verificado en Trustindex");
            console.error("2. El script tiene un error que impide la inicialización");
            console.error("3. Hay un problema de CORS o seguridad");
            console.error("4. El widget ID no es válido o el widget no está activo");
            
            // Verificar si hay errores en la consola relacionados
            console.error("Verifica la pestaña Network para ver si hay errores al cargar el script");
            console.error("Verifica la pestaña Console para ver si hay errores de JavaScript");
            
            // Verificar el objeto window para ver qué se creó
            console.log("Objetos en window relacionados con Trustindex:", 
              Object.keys(window).filter(key => key.toLowerCase().includes('trust')));
          }
        };
        
        // Empezar a verificar después de un pequeño delay
        setTimeout(() => checkTrustindexLoader(1), 500);
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

