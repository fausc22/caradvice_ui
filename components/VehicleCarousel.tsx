"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import CarCard from "./CarCard";
import { Car } from "@/types/car";

interface VehicleCarouselProps {
  vehicles: Car[];
  currency: "ARS" | "USD";
}

export default function VehicleCarousel({ vehicles, currency }: VehicleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(2); // Por defecto mobile (2 cards)
  
  // Detectar tamaño de pantalla y ajustar cards por vista
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth >= 1024) {
        // lg: 4 cards
        setCardsPerView(4);
      } else if (window.innerWidth >= 640) {
        // sm: 2 cards (tablet)
        setCardsPerView(2);
      } else {
        // mobile: 2 cards
        setCardsPerView(2);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);
  
  // Calcular el máximo índice posible
  const maxIndex = Math.max(0, vehicles.length - cardsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Obtener los vehículos visibles
  const getVisibleVehicles = () => {
    return vehicles.slice(currentIndex, currentIndex + cardsPerView);
  };

  const visibleVehicles = getVisibleVehicles();
  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;
  
  // Resetear índice si cambia el número de cards por vista
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [cardsPerView, maxIndex, currentIndex]);

  if (vehicles.length === 0) {
    return (
      <p className="text-gray-600 text-center py-8">
        No hay vehículos disponibles.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Contenedor del carrusel */}
      <div className="overflow-hidden px-4 sm:px-12">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
          animate={{
            x: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          {visibleVehicles.map((vehicle, index) => {
            const vehiclePrice = currency === "USD" 
              ? (vehicle.price_usd || 0)
              : (vehicle.price_ars || 0);
            
            return (
              <motion.div
                key={`${vehicle.id}-${currentIndex + index}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CarCard
                  car={{
                    id: String(vehicle.id),
                    title: vehicle.title,
                    price: vehiclePrice,
                    year: vehicle.year || 0,
                    condition: vehicle.taxonomies?.condition?.[0] || "N/A",
                    kilometers: vehicle.kilometres || 0,
                    transmission: vehicle.taxonomies?.transmission?.[0] || "N/A",
                    fuel: vehicle.taxonomies?.fuel_type?.[0] || "N/A",
                    image: vehicle.featured_image_path?.startsWith("/IMG/static/")
                      ? vehicle.featured_image_path
                      : vehicle.featured_image_path
                      ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/image?path=${encodeURIComponent(vehicle.featured_image_path)}`
                      : vehicle.featured_image_url?.startsWith("/IMG/static/")
                      ? vehicle.featured_image_url
                      : vehicle.featured_image_url,
                  }}
                  currency={currency}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Controles de navegación - Siempre visibles si hay más vehículos que cards por vista */}
      {vehicles.length > cardsPerView && (
        <>
          {/* Botón anterior */}
          <button
            onClick={prevSlide}
            disabled={!canGoPrev}
            className={`absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-2.5 shadow-lg transition-all hover:scale-110 active:scale-95 ${
              canGoPrev
                ? "hover:bg-gray-100 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            aria-label="Anterior"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6 text-gray-700" />
          </button>

          {/* Botón siguiente */}
          <button
            onClick={nextSlide}
            disabled={!canGoNext}
            className={`absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-2.5 shadow-lg transition-all hover:scale-110 active:scale-95 ${
              canGoNext
                ? "hover:bg-gray-100 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            aria-label="Siguiente"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6 text-gray-700" />
          </button>
        </>
      )}
    </div>
  );
}

