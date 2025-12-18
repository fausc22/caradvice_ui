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
      googleMapsUrl: "https://maps.google.com/?q=Octavio+Pinto+3024,+Córdoba",
    },
    {
      name: "CAR ADVICE | Suc. Granderos",
      address: "Bv. Los Granaderos 3110, X5009 Córdoba",
      googleMapsUrl: "https://maps.google.com/?q=Bv.+Los+Granaderos+3110,+X5009+Córdoba",
    },
    {
      name: "CAR ADVICE | Suc. Caraffa",
      address: "Av. Emilio Caraffa 2883, X5009 Córdoba",
      googleMapsUrl: "https://maps.google.com/?q=Av.+Emilio+Caraffa+2883,+X5009+Córdoba",
    },
    {
      name: "CAR ADVICE | Alistaje y Postventa",
      address: "Octavio Pinto 3169, X5009 Córdoba",
      googleMapsUrl: "https://maps.google.com/?q=Octavio+Pinto+3169,+X5009+Córdoba",
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
                  src="/IMG/logo_transparente.png"
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
                  href="tel:+543515158848"
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
            Copyright © 2021. All rights reserved.
          </div>

          {/* Redes sociales */}
          <div className="flex items-center gap-4">
            <span className="text-white text-sm">Seguinos</span>
            <div className="flex gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/caradvice"
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

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/caradvice"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 border-white bg-black flex items-center justify-center hover:bg-white hover:border-white transition-all group"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5 text-white group-hover:text-black transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@caradvice"
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
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
