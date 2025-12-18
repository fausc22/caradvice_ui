"use client";

import { useVehicle, useRelatedVehicles } from "@/hooks/useVehicles";
import { Loader2, ChevronRight, Share2, MessageCircle, X, Maximize2, ChevronLeft } from "lucide-react";
import RelatedVehiclesCarousel from "@/components/RelatedVehiclesCarousel";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CarCard from "@/components/CarCard";
import { useParams } from "next/navigation";

export default function VehicleDetailPage() {
  // La fuente se aplica globalmente desde el layout
  const params = useParams();
  const id = params.id as string;
  const { data: vehicle, isLoading, error } = useVehicle(id);
  const { data: relatedVehicles } = useRelatedVehicles(id, 8);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Obtener imágenes (con valor por defecto para evitar errores)
  const images = vehicle?.images || [];

  // Navegación de imágenes
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
    if (!isFullscreen || !vehicle || images.length === 0) return;

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
  }, [isFullscreen, activeImageIndex, images.length, vehicle, handleNextImage, handlePreviousImage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Vehículo no encontrado</h1>
          <Link href="/autos" className="text-orange-500 hover:text-orange-600">
            Volver a autos disponibles
          </Link>
        </div>
      </div>
    );
  }

  const activeImage = images[activeImageIndex] || images[0];
  const activeImageUrl = activeImage?.file_path
    ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/image?path=${encodeURIComponent(activeImage.file_path)}`
    : activeImage?.image_url || "/IMG/logo_transparente.png";

  const formatPrice = (price: number, currency: "ARS" | "USD") => {
    const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return currency === "USD" ? `U$${formatted}` : `$${formatted}`;
  };

  const vehicleCurrency = vehicle.price_usd && vehicle.price_usd > 0 ? "USD" : "ARS";
  const vehiclePrice = vehicleCurrency === "USD" ? vehicle.price_usd! : vehicle.price_ars!;

  // Breadcrumbs
  const brand = vehicle.taxonomies?.brand?.[0] || "";
  const model = vehicle.taxonomies?.model?.[0] || "";

  // WhatsApp link
  const whatsappMessage = encodeURIComponent(
    `Hola, estoy interesado en el vehículo: ${vehicle.title}`
  );
  const whatsappLink = `https://wa.me/543515158848?text=${whatsappMessage}`;

  // Share links
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = vehicle.title;
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShare = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`;

  // Función para compartir nativo (Sharer)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Mira este vehículo: ${shareTitle}`,
          url: shareUrl,
        });
      } catch (err) {
        // Usuario canceló o error
        console.log("Error al compartir:", err);
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copiado al portapapeles");
      } catch (err) {
        console.log("Error al copiar:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-orange-500">
                Inicio
              </Link>
            </li>
            <ChevronRight size={16} className="text-gray-400" />
            <li>
              <Link href="/autos" className="hover:text-orange-500">
                Inventario
              </Link>
            </li>
            {brand && (
              <>
                <ChevronRight size={16} className="text-gray-400" />
                <li>
                  <Link href={`/autos?brand=${encodeURIComponent(brand)}`} className="hover:text-orange-500">
                    {brand}
                  </Link>
                </li>
              </>
            )}
            {model && (
              <>
                <ChevronRight size={16} className="text-gray-400" />
                <li>
                  <Link href={`/autos?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`} className="hover:text-orange-500">
                    {model}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight size={16} className="text-gray-400" />
            <li className="text-gray-800 font-medium">{vehicle.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Galería de Imágenes */}
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
                  alt={vehicle.title}
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
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
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
                  const thumbUrl = image.file_path
                    ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/image?path=${encodeURIComponent(image.file_path)}`
                    : image.image_url || "/IMG/logo_transparente.png";
                  
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
                    >
                      <img
                        src={thumbUrl}
                        alt={`${vehicle.title} - Imagen ${index + 1}`}
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

            {/* Descripción debajo de la galería */}
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {vehicle.content ? (
                  <div
                    className="text-gray-700 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: vehicle.content }}
                  />
                ) : (
                  <p className="text-gray-600">No hay descripción disponible para este vehículo.</p>
                )}
              </div>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div>
            {/* Título y Precio */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {vehicle.title}
              </h1>
              <div className="text-4xl md:text-5xl font-bold text-gray-800">
                {formatPrice(vehiclePrice, vehicleCurrency)}
              </div>
            </div>

            {/* Especificaciones Principales */}
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Marca:</span>
                  <p className="font-medium text-gray-800">{brand || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Modelo:</span>
                  <p className="font-medium text-gray-800">{model || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Año:</span>
                  <p className="font-medium text-gray-800">{vehicle.year || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Transmisión:</span>
                  <p className="font-medium text-gray-800">{vehicle.taxonomies?.transmission?.[0] || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Kilómetros:</span>
                  <p className="font-medium text-gray-800">
                    {vehicle.kilometres ? `${vehicle.kilometres.toLocaleString("es-AR")} Kms` : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Combustible:</span>
                  <p className="font-medium text-gray-800">{vehicle.taxonomies?.fuel_type?.[0] || "N/A"}</p>
                </div>
                {vehicle.license_plate && (
                  <div>
                    <span className="text-sm text-gray-600">Matrícula:</span>
                    <p className="font-medium text-gray-800">{vehicle.license_plate}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Condición:</span>
                  <p className="font-medium text-gray-800">{vehicle.taxonomies?.condition?.[0] || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Botón WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 mb-4 transition-colors"
            >
              <MessageCircle size={20} />
              Chat via WhatsApp
            </a>

            {/* Compartir Publicación */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Compartir Publicación</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(whatsappShare, "_blank")}
                  className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center text-white transition-colors"
                  title="Compartir en WhatsApp"
                >
                  <MessageCircle size={20} />
                </button>
                <button
                  onClick={() => window.open(facebookShare, "_blank")}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-colors"
                  title="Compartir en Facebook"
                >
                  <Share2 size={20} />
                </button>
                <button
                  onClick={handleNativeShare}
                  className="w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center justify-center text-white transition-colors"
                  title="Compartir"
                >
                  <Share2 size={20} />
                </button>
                <button
                  onClick={() => window.open(twitterShare, "_blank")}
                  className="w-12 h-12 bg-black hover:bg-gray-800 rounded-lg flex items-center justify-center text-white transition-colors"
                  title="Compartir en X (Twitter)"
                >
                  <span className="text-white font-bold text-lg">X</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Contacto y Admin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Formulario de Contacto */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contacto</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="email"
                  placeholder="Email*"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <textarea
                placeholder="Mensaje*"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="privacy"
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="privacy" className="text-sm text-gray-600">
                  Acepto las{" "}
                  <Link href="/politicas" className="text-orange-500 hover:text-orange-600">
                    políticas de privacidad
                  </Link>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Enviar
              </button>
            </form>
          </div>

          {/* Admin Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin</h3>
            <div className="space-y-4">
              <div>
                <p className="text-orange-500 font-medium mb-2">administrator</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📍</span>
                  <span>Córdoba</span>
                </div>
              </div>
              <button className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <span>✆</span>
                <span>543 *** *** mostrar</span>
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={20} />
                Chat via WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Autos Relacionados */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Anuncios relacionados</h2>
          {relatedVehicles && relatedVehicles.length > 0 ? (
            <RelatedVehiclesCarousel
              vehicles={relatedVehicles.map((relatedVehicle) => {
                const relatedCurrency = relatedVehicle.price_usd && relatedVehicle.price_usd > 0 ? "USD" : "ARS";
                const relatedPrice = relatedCurrency === "USD" ? relatedVehicle.price_usd! : relatedVehicle.price_ars!;
                
                return {
                  id: String(relatedVehicle.id),
                  title: relatedVehicle.title,
                  price: relatedPrice,
                  price_usd: relatedVehicle.price_usd,
                  price_ars: relatedVehicle.price_ars,
                  year: relatedVehicle.year || 0,
                  condition: relatedVehicle.taxonomies?.condition?.[0] || "N/A",
                  kilometers: relatedVehicle.kilometres,
                  transmission: relatedVehicle.taxonomies?.transmission?.[0] || "N/A",
                  fuel: relatedVehicle.taxonomies?.fuel_type?.[0] || "N/A",
                  image: relatedVehicle.featured_image_path
                    ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/image?path=${encodeURIComponent(relatedVehicle.featured_image_path)}`
                    : relatedVehicle.featured_image_url,
                };
              })}
            />
          ) : (
            <p className="text-gray-600">No hay vehículos relacionados disponibles.</p>
          )}
        </div>
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
            >
              <X size={24} />
            </button>

            {/* Imagen */}
            <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={activeImageUrl}
                  alt={vehicle.title}
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
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Título de la imagen */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded text-sm max-w-[80%] text-center">
                {vehicle.title}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
