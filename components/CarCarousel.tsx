"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CarCard from "./CarCard";
import { Car } from "@/types/car";

interface CarCarouselProps {
  cars: Car[];
  currency: "ARS" | "USD";
}

// Función helper para convertir Car a el formato que espera CarCard
const mapCarToCarCard = (car: Car, currency: "ARS" | "USD") => {
  const price = currency === "USD" 
    ? (car.price_usd ?? 0) 
    : (car.price_ars ?? car.price_usd ?? 0);
  
  const condition = car.taxonomies?.condition?.[0] || "";
  const transmission = car.taxonomies?.transmission?.[0] || "";
  const fuel = car.taxonomies?.fuel_type?.[0] || "";
  const image = car.featured_image_path 
    ? `/api/image?path=${encodeURIComponent(car.featured_image_path)}`
    : car.featured_image_url || undefined;

  return {
    id: String(car.id),
    title: car.title,
    price,
    year: car.year ?? 0,
    condition,
    kilometers: car.kilometres ?? 0,
    transmission,
    fuel,
    image,
  };
};

export default function CarCarousel({ cars, currency }: CarCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);

  // Ajustar cantidad de cards según el tamaño de pantalla
  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth < 768) {
        setCardsToShow(1);
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }
    };
    updateCardsToShow();
    window.addEventListener("resize", updateCardsToShow);
    return () => window.removeEventListener("resize", updateCardsToShow);
  }, []);

  const totalSlides = Math.ceil(cars.length / cardsToShow);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getVisibleCars = () => {
    const start = currentIndex * cardsToShow;
    return cars.slice(start, start + cardsToShow).map(car => mapCarToCarCard(car, currency));
  };

  const visibleCars = getVisibleCars();

  return (
    <div className="relative py-4 sm:py-8">
      {/* Flecha izquierda */}
      {totalSlides > 1 && (
        <button
          onClick={prevSlide}
          className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:bg-gray-100 transition-all hover:scale-110 active:scale-95"
          aria-label="Anterior"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6 text-gray-700" />
        </button>
      )}

      {/* Contenedor del carrusel */}
      <div className="overflow-hidden px-8 sm:px-12 md:px-16">
        <div
          className={`grid gap-4 sm:gap-6 ${
            cardsToShow === 1
              ? "grid-cols-1"
              : cardsToShow === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {visibleCars.map((car) => (
            <CarCard key={car.id} car={car} currency={currency} />
          ))}
        </div>
      </div>

      {/* Flecha derecha */}
      {totalSlides > 1 && (
        <button
          onClick={nextSlide}
          className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:bg-gray-100 transition-all hover:scale-110 active:scale-95"
          aria-label="Siguiente"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6 text-gray-700" />
        </button>
      )}

      {/* Indicadores de página */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === index
                  ? "w-8 bg-red-600"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Ir a página ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

