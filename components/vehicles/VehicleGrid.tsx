"use client";

import CarCard from "@/components/CarCard";
import { Car } from "@/types/car";
import { Loader2 } from "lucide-react";
import { useComparisonStore } from "@/store/useComparisonStore";
import { useState, useEffect } from "react";

interface VehicleGridProps {
  vehicles: Car[];
  loading: boolean;
  viewMode: "grid" | "list";
  currency: "ARS" | "USD";
}

export default function VehicleGrid({
  vehicles,
  loading,
  viewMode,
  currency,
}: VehicleGridProps) {
  const { toggleVehicle, isSelected } = useComparisonStore();
  const [isMobile, setIsMobile] = useState(false);
  const [displayedVehicles, setDisplayedVehicles] = useState<Car[]>(vehicles);

  // Detectar si es móvil y limitar vehículos
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640; // sm breakpoint
      setIsMobile(mobile);
      
      // Limitar a 12 vehículos en móvil para reducir scroll
      if (mobile) {
        setDisplayedVehicles(vehicles.slice(0, 12));
      } else {
        setDisplayedVehicles(vehicles);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [vehicles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-600 text-lg">
          No se encontraron vehículos con los filtros seleccionados.
        </p>
      </div>
    );
  }

  const formatPrice = (car: Car): { price: number; currency: "ARS" | "USD" } => {
    // Cada auto tiene precio en USD o ARS, no ambos
    if (car.price_usd && car.price_usd > 0) {
      return { price: car.price_usd, currency: "USD" };
    }
    if (car.price_ars && car.price_ars > 0) {
      return { price: car.price_ars, currency: "ARS" };
    }
    return { price: 0, currency: "ARS" };
  };

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
          : "space-y-4"
      }
    >
      {displayedVehicles.map((vehicle, index) => {
        const priceInfo = formatPrice(vehicle);
        const vehicleSelected = isSelected(vehicle.id);
        
        const handleCompare = () => {
          const wasSelected = vehicleSelected;
          const added = toggleVehicle(vehicle);
          
          // Si no se pudo agregar porque ya alcanzó el límite, mostrar alerta
          if (!added && !wasSelected) {
            alert("Ya has seleccionado el máximo de 5 vehículos para comparar. Quita uno para agregar otro.");
          }
        };
        
        // Priority solo para las primeras 4 imágenes (above the fold)
        const imagePriority = index < 4;
        
        return (
          <CarCard
            key={vehicle.id}
            car={{
              id: String(vehicle.id),
              title: vehicle.title,
              price: priceInfo.price,
              year: vehicle.year || 0,
              condition: vehicle.taxonomies?.condition?.[0] || "N/A",
              kilometers: vehicle.kilometres,
              transmission: vehicle.taxonomies?.transmission?.[0] || "N/A",
              fuel: vehicle.taxonomies?.fuel_type?.[0] || "N/A",
              image: vehicle.featured_image_path?.startsWith("/IMG/static/")
                ? vehicle.featured_image_path
                : vehicle.featured_image_path
                ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/image?path=${encodeURIComponent(vehicle.featured_image_path)}`
                : vehicle.featured_image_url?.startsWith("/IMG/static/")
                ? vehicle.featured_image_url
                : vehicle.featured_image_url,
            }}
            currency={priceInfo.currency}
            onCompare={handleCompare}
            isComparing={vehicleSelected}
            imagePriority={imagePriority}
          />
        );
      })}
    </div>
  );
}
