"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface MetaPixelNoscriptProps {
  pixelId: string;
  isVestri?: boolean; // Prop opcional para indicar si es Vestri (solo para pixel de Car Advice)
}

export default function MetaPixelNoscript({ pixelId, isVestri }: MetaPixelNoscriptProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Solo verificar Vestri si el pixelId es el de Car Advice (1505816897053043)
    // Si el pixelId es el de Vestri (1601853571182218), siempre inyectar
    const isCarAdvicePixel = pixelId === "1505816897053043";
    
    if (isCarAdvicePixel) {
      // Verificar que NO estemos en Vestri para el pixel de Car Advice
      if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        const isVestriSubdomain = hostname.startsWith("vestri.");
        const isVestriRoute = pathname.startsWith("/vestri");
        
        // Si es Vestri (por prop, subdominio o ruta), no hacer nada
        if (isVestri || isVestriSubdomain || isVestriRoute) {
          return;
        }
      }
    }

    // Inyectar el noscript en el head
    const noscript = document.createElement("noscript");
    const img = document.createElement("img");
    img.height = 1;
    img.width = 1;
    img.style.display = "none";
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.head.appendChild(noscript);

    // Cleanup
    return () => {
      if (document.head.contains(noscript)) {
        document.head.removeChild(noscript);
      }
    };
  }, [pixelId, isVestri, pathname]);

  return null;
}
