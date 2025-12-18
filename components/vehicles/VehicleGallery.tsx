"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { CarImage } from "@/types/car";
import Image from "next/image";

interface VehicleGalleryProps {
  images: CarImage[];
  vehicleTitle: string;
}

export default function VehicleGallery({ images, vehicleTitle }: VehicleGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getImageUrl = (image: CarImage): string => {
    if (image.file_path?.startsWith("/IMG/static/")) {
      return image.file_path;
    }
    if (image.file_path) {
      return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/image?path=${encodeURIComponent(image.file_path)}`;
    }
    if (image.image_url?.startsWith("/IMG/static/")) {
      return image.image_url;
    }
    return image.image_url || "/IMG/logo_transparente.png";
  };

  const activeImage = images[activeImageIndex] || images[0];
  const activeImageUrl = activeImage ? getImageUrl(activeImage) : "/IMG/logo_transparente.png";

  const handleNextImage = useCallback(() => {
    if (images.length === 0) return;
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handlePreviousImage = useCallback(() => {
    if (images.length === 0) return;
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  // Manejar teclas en pantalla completa
  useEffect(() => {
    if (!isFullscreen || images.length === 0) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      } else if (e.key === "ArrowLeft") {
        handlePreviousImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFullscreen, images.length, handleNextImage, handlePreviousImage]);

  if (images.length === 0) {
    return (
      <div className="relative w-full aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden mb-4">
        <Image
          src="/IMG/logo_transparente.png"
          alt={vehicleTitle}
          fill
          className="object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Imagen Principal */}
        <motion.div
          className="relative w-full aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden mb-4 cursor-pointer"
          onClick={() => setIsFullscreen(true)}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImageIndex}
              src={activeImageUrl}
              alt={`${vehicleTitle} - Imagen ${activeImageIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/IMG/logo_transparente.png";
              }}
            />
          </AnimatePresence>

          {/* Contador de imágenes */}
          {images.length > 0 && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded text-sm font-medium">
              {activeImageIndex + 1}/{images.length}
            </div>
          )}

          {/* Botón expandir */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-colors"
            aria-label="Ver imagen en pantalla completa"
          >
            <Maximize2 size={20} />
          </button>

          {/* Navegación de imágenes */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </motion.div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.slice(0, 5).map((image, index) => {
              const thumbUrl = getImageUrl(image);
              return (
                <motion.button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === index
                      ? "border-orange-500 ring-2 ring-orange-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl}
                    alt={`${vehicleTitle} - Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/IMG/logo_transparente.png";
                    }}
                  />
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Pantalla Completa */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullscreen(false)}
          >
            {/* Contador */}
            <div className="absolute top-4 left-4 text-white text-lg font-medium">
              {activeImageIndex + 1}/{images.length}
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 transition-colors"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>

            {/* Imagen */}
            <div
              className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={activeImageUrl}
                  alt={vehicleTitle}
                  className="max-w-full max-h-[90vh] object-contain"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/IMG/logo_transparente.png";
                  }}
                />
              </AnimatePresence>

              {/* Navegación */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Título de la imagen */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded text-sm max-w-[80%] text-center">
                {vehicleTitle}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

