"use client";

import { useEffect } from "react";

interface MetaPixelNoscriptProps {
  pixelId: string;
}

export default function MetaPixelNoscript({ pixelId }: MetaPixelNoscriptProps) {
  useEffect(() => {
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
  }, [pixelId]);

  return null;
}
