"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Extender el tipo Window para incluir fbq
declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, any>
    ) => void;
  }
}

export default function MetaPixelRouter() {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // Verificar que fbq esté disponible
    if (typeof window === "undefined" || !window.fbq) {
      return;
    }

    // Solo disparar PageView si la ruta cambió (no en la carga inicial)
    // La carga inicial ya dispara PageView automáticamente desde el script base
    if (previousPathnameRef.current !== null && previousPathnameRef.current !== pathname) {
      // Pequeño delay para asegurar que el pixel esté completamente cargado
      const timer = setTimeout(() => {
        if (window.fbq) {
          window.fbq("track", "PageView");
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    // Actualizar la referencia del pathname anterior
    previousPathnameRef.current = pathname;
  }, [pathname]);

  return null;
}
