"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Footer() {
  const locations = [
    {
      name: "CAR ADVICE | Casa Central",
      address: "Octavio Pinto 3024, Córdoba",
      googleMapsUrl: "https://share.google/Z4OqenVjQoIF7wPGP",
    },
    {
      name: "CAR ADVICE | Suc. Granderos",
      address: "Bv. Los Granaderos 3110, X5009 Córdoba",
      googleMapsUrl: "https://share.google/QsggnorrlPRRIB1VR",
    },
    {
      name: "CAR ADVICE | Suc. Caraffa",
      address: "Av. Emilio Caraffa 2883, X5009 Córdoba",
      googleMapsUrl: "https://share.google/Nxz0ZmIWATXnwfxhP",
    },
    {
      name: "CAR ADVICE | Alistaje y Postventa",
      address: "Octavio Pinto 3169, X5009 Córdoba",
      googleMapsUrl: "https://share.google/HU1SMP4DvBeiwqd9Q",
    },
  ];

  const [hoveredLocation, setHoveredLocation] = useState<number | null>(null);

  return (
    <footer className="font-antenna bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Sección principal */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 mb-8">
          {/* Columna izquierda: Logo grande */}
          <div className="flex items-start">
            <Link href="/" className="flex items-center group">
              <div className="relative w-64 h-32 lg:w-80 lg:h-40 flex-shrink-0">
                <Image
                  src="/logo_navbar.jpg"
                  alt="CAR ADVICE Logo"
                  fill
                  className="object-contain object-left group-hover:opacity-90 transition-opacity duration-300"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Columna derecha: Descripción, widget, teléfono y direcciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Sub-columna izquierda: Descripción y widget */}
            <div className="space-y-6">
              {/* Descripción de la empresa */}
              <p className="text-white text-sm leading-relaxed max-w-2xl">
                Somos una concesionaria de autos que combina la venta de vehículos con asesoría personalizada en cada etapa del proceso. Nos especializamos en la compra-venta de autos usados y 0Km, brindando una experiencia ágil, segura y transparente que incluye asesoramiento y gestión documental.
              </p>

              {/* Widget de reseñas */}
              <div className="bg-white rounded-lg p-4 max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-900 font-bold text-lg">4.9</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-green-500 rounded-full p-1">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-gray-700 text-sm">Servicio mejor valorado</span>
                </div>
                <div className="mt-1">
                  <span className="text-gray-500 text-xs">Trustindex</span>
                </div>
              </div>
            </div>

            {/* Sub-columna derecha: Teléfono y direcciones */}
            <div className="space-y-6">
              {/* Teléfono grande */}
              <div className="flex items-center gap-3">
                <Phone size={24} className="text-white" />
                <a
                  href="https://wa.me/5493515158848"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-3xl md:text-4xl font-bold hover:text-orange-500 transition-colors"
                >
                  351 515 8848
                </a>
              </div>

              {/* Direcciones */}
              <div className="space-y-3">
                {locations.map((location, index) => (
                  <motion.a
                    key={index}
                    href={location.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredLocation(index)}
                    onMouseLeave={() => setHoveredLocation(null)}
                    whileHover={{ 
                      scale: 1.02,
                      x: 5,
                    }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      opacity: hoveredLocation !== null && hoveredLocation !== index ? 0.6 : 1,
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }}
                  >
                  <motion.div
                    animate={{
                      scale: hoveredLocation === index ? 1.2 : 1,
                      rotate: hoveredLocation === index ? -10 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 10
                    }}
                  >
                    <MapPin size={16} className="text-red-500 mt-1 flex-shrink-0" />
                  </motion.div>
                    <div className="text-white text-sm relative">
                      <motion.div
                        className="absolute -left-2 top-0 bottom-0 w-1 bg-orange-500 rounded"
                        initial={{ scaleY: 0 }}
                        animate={{
                          scaleY: hoveredLocation === index ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                      <div className={`font-medium transition-colors ${hoveredLocation === index ? 'text-orange-500' : 'text-white'}`}>
                        {location.name}
                      </div>
                      <div className={`transition-colors ${hoveredLocation === index ? 'text-orange-300' : 'text-gray-300'}`}>
                        {location.address}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Línea separadora gris */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Sección inferior: Copyright y redes sociales */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-white text-sm">
            Copyright © 2025. All rights reserved.
          </div>

          {/* Redes sociales */}
          <div className="flex items-center gap-4">
            <span className="text-white text-sm">Seguinos</span>
            <div className="flex gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/caradvicearg/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 border-white bg-black flex items-center justify-center hover:bg-white hover:border-white transition-all group"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5 text-white group-hover:text-black transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/ConcesionariaCarAdvice/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 border-white bg-black flex items-center justify-center hover:bg-white hover:border-white transition-all group"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5 text-white group-hover:text-black transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@caradvicearg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 border-white bg-black flex items-center justify-center hover:bg-white hover:border-white transition-all group"
                aria-label="TikTok"
              >
                <svg
                  className="w-5 h-5 text-white group-hover:text-black transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
