"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/meta-pixel";

interface MetaPixelViewContentProps {
  vehicleId: string;
}

/**
 * Dispara ViewContent al montar (ficha de vehículo) para coincidencia con el catálogo de Meta.
 */
export default function MetaPixelViewContent({ vehicleId }: MetaPixelViewContentProps) {
  useEffect(() => {
    trackViewContent(vehicleId);
  }, [vehicleId]);

  return null;
}
