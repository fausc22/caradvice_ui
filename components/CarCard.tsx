"use client";

import { Car } from "@/types/car";
import { GitCompare, Check } from "lucide-react";
import Image from "next/image";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";

interface CarCardProps {
  car: {
    id: string;
    title: string;
    price: number;
    year: number;
    condition: string;
    kilometers: number;
    transmission: string;
    fuel: string;
    image?: string;
  };
  onCompare?: (car: any) => void;
  isComparing?: boolean;
  currency: "ARS" | "USD";
}

export default function CarCard({
  car,
  onCompare,
  isComparing = false,
  currency,
}: CarCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const formatPrice = (price: number) => {
    // Convertir a entero para quitar decimales (.00)
    const integerPrice = Math.floor(price);
    // Formatear con puntos cada 3 dígitos, sin decimales
    const formatted = integerPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (currency === "USD") {
      return `U$${formatted}`;
    }
    return `$${formatted}`;
  };

  const formatKilometers = (km: number) => {
    return km.toLocaleString("es-AR", { maximumFractionDigits: 0 });
  };

  const imageUrl = car.image || "/IMG/logo_transparente.png";
  // Reconocer imágenes locales: API, uploads, o rutas estáticas
  const isLocalImage = car.image?.startsWith("/api/image") || 
                       car.image?.includes("uploads") || 
                       car.image?.startsWith("/IMG/static/");
  // Rutas estáticas pueden usar Image de Next.js directamente
  const isStaticImage = car.image?.startsWith("/IMG/static/");

  const isActive = isHovered || isPressed;

  const handleClick = () => {
    window.location.href = `/autos/${car.id}`;
  };

  return (
    <motion.div
      className={clsx(
        "font-antenna bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[560px] sm:h-[600px] w-full cursor-pointer select-none relative",
        "hover:shadow-xl transition-shadow duration-300",
        isActive && "ring-2 ring-orange-500",
        isComparing && "ring-2 ring-orange-500"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onClick={handleClick}
      whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ duration: 0.2 }}
    >
      {/* Sección de Imagen - Más grande y destacada */}
      <div className="relative h-[320px] sm:h-[360px] bg-gray-200 flex-shrink-0 overflow-hidden">
        <motion.div
          className="w-full h-full"
          animate={{
            scale: isActive ? 1.03 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          {isStaticImage ? (
            // Imágenes estáticas: usar img directamente (están en public/)
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={car.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 55%" }}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/IMG/logo_transparente.png";
              }}
            />
          ) : isLocalImage ? (
            // Imágenes locales (API o uploads): usar img con fallback
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={car.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 55%" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/IMG/logo_transparente.png";
              }}
            />
          ) : imageUrl.startsWith("http") ? (
            // URLs externas: usar img con fallback
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={car.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 55%" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/IMG/logo_transparente.png";
              }}
            />
          ) : (
            // Otras rutas locales: usar Image de Next.js
            <Image
              src={imageUrl}
              alt={car.title}
              fill
              className="object-cover"
              style={{ objectPosition: "center 60%" }}
              onError={() => {
                // Fallback handled by Next.js Image
              }}
            />
          )}
        </motion.div>

        {/* Checkbox de comparación */}
        {onCompare && (
          <div
            className="absolute top-2 right-2 z-10"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompare(car);
              }}
              className={clsx(
                "p-2.5 rounded-full transition-all shadow-lg hover:scale-110 active:scale-95",
                isComparing
                  ? "bg-orange-500 text-white ring-2 ring-orange-300 ring-offset-2"
                  : "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white"
              )}
              aria-label={isComparing ? "Quitar de comparación" : "Agregar a comparación"}
            >
              {isComparing ? (
                <Check size={20} className="font-bold" />
              ) : (
                <GitCompare size={18} />
              )}
            </button>
          </div>
        )}
        
        {/* Overlay cuando está seleccionado */}
        {isComparing && (
          <div className="absolute inset-0 bg-orange-500/10 border-2 border-orange-500 rounded-lg pointer-events-none z-0" />
        )}
      </div>

      {/* Sección de Información Textual - Espacio suficiente para todo */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow min-h-0">
        {/* Título - 3 líneas reservadas */}
        <h3 className="font-bold text-sm sm:text-base text-gray-800 mb-2.5 sm:mb-3 leading-tight h-[4rem] sm:h-[4.5rem] overflow-hidden line-clamp-3">
          {car.title}
        </h3>

        {/* Precio - Siempre visible */}
        <div className="mb-2.5 sm:mb-3 h-[2.25rem] sm:h-[2.75rem] flex items-center">
          <span className="text-xl sm:text-2xl font-bold text-gray-800 break-words leading-tight">
            {formatPrice(car.price)}
          </span>
        </div>

        {/* Línea separadora */}
        <div className="border-t border-gray-200 mb-2.5 sm:mb-3"></div>

        {/* Primera Fila: Año (insignia naranja), Estado, Kilometraje - Siempre visible */}
        <div className="flex items-center gap-2 mb-2 flex-wrap min-h-[1.75rem] sm:min-h-[2rem]">
          {/* Insignia naranja con el año */}
          {car.year && car.year > 0 && (
            <span className="bg-orange-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-2.5 py-1 rounded whitespace-nowrap">
              {car.year}
            </span>
          )}
          
          {/* Estado */}
          {car.condition && (
            <span className="text-xs sm:text-sm text-gray-700 truncate">
              {car.condition}
            </span>
          )}
          
          {/* Kilometraje */}
          {car.kilometers > 0 && (
            <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
              {formatKilometers(car.kilometers)} Kms
            </span>
          )}
        </div>

        {/* Segunda Fila: Transmisión, Combustible - Siempre visible */}
        <div className="flex items-center gap-2 flex-wrap min-h-[1.75rem] sm:min-h-[2rem] mt-auto">
          {/* Transmisión */}
          {car.transmission && car.transmission !== "N/A" && (
            <span className="text-xs sm:text-sm text-gray-600 truncate">
              {car.transmission}
            </span>
          )}
          
          {/* Combustible */}
          {car.fuel && car.fuel !== "N/A" && (
            <span className="text-xs sm:text-sm text-gray-600 truncate">
              {car.fuel}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
