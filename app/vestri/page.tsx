"use client";

import { motion } from "framer-motion";
import NavbarVestri from "@/components/NavbarVestri";
import HeroSection from "@/components/vestri/HeroSection";
import FloatingCard from "@/components/vestri/FloatingCard";
import StepsSection from "@/components/vestri/StepsSection";
import ContactSection from "@/components/vestri/ContactSection";
import WhatsAppFloatButton from "@/components/vestri/WhatsAppFloatButton";
import "./vestri.css";

export default function Vestri() {
  return (
    <div className="font-antenna vestri-container bg-white min-h-screen">
      {/* Navbar Especial de Vestri */}
      <NavbarVestri />

      {/* SECCIÓN 1: INICIO */}
      <HeroSection />

      {/* Card Flotante */}
      <FloatingCard />

      {/* SECCIÓN 2: BENEFICIOS */}
      <StepsSection />

      {/* SECCIÓN 3: CONTACTO */}
      <ContactSection />

      {/* Sucursales y Redes Sociales */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Nuestras Sucursales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-[#192BC2] text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-8 md:mb-12 font-[var(--font-montserrat)] leading-tight">
              Nuestras Sucursales
            </h2>

            {/* Grid de Mapas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
              {/* Mapa 1 - Granaderos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-xl"
              >
                <iframe
                  src="https://www.google.com/maps?q=Bv.+Los+Granaderos+3110,+X5000+Córdoba,+Argentina&ll=-31.373356,-64.217189&z=15&output=embed&hl=es"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </motion.div>

              {/* Mapa 2 - Octavio Pinto */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg overflow-hidden shadow-xl"
              >
                <iframe
                  src="https://www.google.com/maps?ll=-31.433694,-64.185277&z=15&t=m&hl=es-ES&gl=US&mapclient=embed&q=Octavio+Pinto+3024+X5003+C%C3%B3rdoba&output=embed"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </motion.div>

              {/* Mapa 3 - Caraffa */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-lg overflow-hidden shadow-xl"
              >
                <iframe
                  src="https://www.google.com/maps?ll=-31.38647,-64.217527&z=15&t=m&hl=es-ES&gl=US&mapclient=embed&q=Av.+Emilio+Caraffa+2883+X5008AQC+C%C3%B3rdoba&output=embed"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </motion.div>
          </div>
          </motion.div>

      {/* Redes Sociales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 font-[var(--font-montserrat)]">
              Seguinos en nuestras redes
            </h2>
            <div className="flex flex-col items-center gap-4">
            <a
              href="https://instagram.com/vestri.ok"
              target="_blank"
              rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-2xl font-bold text-orange-500 hover:text-orange-400 transition-colors duration-300 font-[var(--font-montserrat)]"
            >
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              @vestri.ok
            </a>
              <a
                href="mailto:vestri@caradvice.com.ar"
                className="text-xl md:text-2xl font-bold text-white hover:text-orange-400 transition-colors duration-300 font-[var(--font-montserrat)]"
              >
                vestri@caradvice.com.ar
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-[var(--font-montserrat)]">
            Todos los derechos © 2025 Vestri – Reventa de vehículos orientado
            al agente
          </p>
        </div>
      </footer>

      {/* Botón flotante de WhatsApp */}
      <WhatsAppFloatButton />
    </div>
  );
}
