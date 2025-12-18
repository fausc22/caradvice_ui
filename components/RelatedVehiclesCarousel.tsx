"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import CarCard from "./CarCard";

interface RelatedVehicle {
  id: string | number;
  title: string;
  price: number;
  price_usd?: number | null;
  price_ars?: number | null;
  year: number;
  condition: string;
  kilometers: number;
  transmission: string;
  fuel: string;
  image?: string;
}

interface RelatedVehiclesCarouselProps {
  vehicles: RelatedVehicle[];
}

export default function RelatedVehiclesCarousel({ vehicles }: RelatedVehiclesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 4;
  
  // Calcular el máximo índice posible (para mostrar siempre 4 cards)
  const maxIndex = Math.max(0, vehicles.length - cardsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Obtener los vehículos visibles (siempre 4, o menos si no hay suficientes)
  const getVisibleVehicles = () => {
    return vehicles.slice(currentIndex, currentIndex + cardsPerView);
  };

  const visibleVehicles = getVisibleVehicles();
  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  if (vehicles.length === 0) {
    return (
      <p className="text-gray-600 text-center py-8">
        No hay vehículos relacionados disponibles.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Contenedor del carrusel */}
      <div className="overflow-hidden px-12">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
            const currency = vehicle.price_usd && vehicle.price_usd > 0 ? "USD" : "ARS";
            
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
                    price: vehicle.price,
                    year: vehicle.year,
                    condition: vehicle.condition,
                    kilometers: vehicle.kilometers,
                    transmission: vehicle.transmission,
                    fuel: vehicle.fuel,
                    image: vehicle.image,
                  }}
                  currency={currency}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Controles de navegación */}
      {vehicles.length > cardsPerView && (
        <>
          {/* Botón anterior */}
          <button
            onClick={prevSlide}
            disabled={!canGoPrev}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110 active:scale-95 ${
              canGoPrev
                ? "hover:bg-gray-100 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            aria-label="Anterior"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>

          {/* Botón siguiente */}
          <button
            onClick={nextSlide}
            disabled={!canGoNext}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110 active:scale-95 ${
              canGoNext
                ? "hover:bg-gray-100 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            aria-label="Siguiente"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>
        </>
      )}
    </div>
  );
}
