"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/meta-pixel";

interface MetaPixelViewContentProps {
  /** ID del vehículo (debe coincidir con el ID en el catálogo de Meta) */
  vehicleId: string;
}

/**
 * Dispara el evento ViewContent del Meta Pixel al cargar la página de detalle del vehículo.
 * Necesario para que Meta calcule la proporción de coincidencias del catálogo.
 */
export default function MetaPixelViewContent({ vehicleId }: MetaPixelViewContentProps) {
  useEffect(() => {
    if (vehicleId) {
      trackViewContent(vehicleId);
    }
  }, [vehicleId]);

  return null;
}
