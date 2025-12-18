"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function FloatingCard() {
  return (
    <section className="relative -mt-16 sm:-mt-20 md:-mt-16 lg:-mt-12 z-20 mb-12 sm:mb-16 md:mb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-w-6xl mx-auto border border-gray-100"
        >
          <div className="p-6 sm:p-8 md:p-12 lg:p-16">
            {/* Título */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[#192BC2] text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-3 md:mb-4 font-[var(--font-montserrat)] leading-tight"
            >
              Venta mayorista exclusiva para agencias de autos
            </motion.h2>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-600 text-base md:text-lg lg:text-xl text-center mb-6 md:mb-10 font-[var(--font-montserrat)] font-normal"
            >
              Somos tu nuevo proveedor en la venta de vehículos con condiciones
              preferenciales.
            </motion.p>

            {/* Imagen de autos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative w-full h-auto"
            >
              <Image
                src="/IMG/vestri/autos2.png"
                alt="Vehículos disponibles"
                width={1200}
                height={600}
                className="w-full h-auto object-contain"
                priority
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

