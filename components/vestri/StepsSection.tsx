"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Inspección profesional",
    description:
      "Cada unidad es peritada por nuestro equipo especializado. Sabés exactamente qué estás comprando.",
    bgColor: "bg-[#192BC2]",
    image: "/IMG/vestri/steps/step1.png",
  },
  {
    number: "02",
    title: "Fotos reales y peritaje completo",
    description:
      "Te compartimos todo antes de ofertar: imágenes de calidad y detalles técnicos sin filtro.",
    bgColor: "bg-[#F5E6D3]",
    image: "/IMG/vestri/steps/step2.png",
  },
  {
    number: "03",
    title: "Documentación lista para transferir",
    description:
      "Nuestra gestoría interna deja todo en regla para que retires y vendas sin demoras.",
    bgColor: "bg-gray-400",
    image: "/IMG/vestri/steps/step3.png",
  },
  {
    number: "04",
    title: "Reservás la unidad",
    description: "Confirmás por WhatsApp y te guardamos el auto.",
    bgColor: "bg-[#FF8C42]",
    image: "/IMG/vestri/steps/step4.png",
  },
  {
    number: "05",
    title: "Pagás y retirás",
    description:
      "Coordinamos entrega y te llevás el vehículo con carpeta completa. Así de simple.",
    bgColor: "bg-[#87CEEB]",
    image: "/IMG/vestri/steps/step5.png",
  },
];

export default function StepsSection() {
  return (
    <section id="beneficios" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Como operás con Vestri */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-[#192BC2] text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-4 font-[var(--font-montserrat)] leading-tight">
            Como operás con Vestri
          </h2>
        </motion.div>

        {/* Pasos */}
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${step.bgColor} rounded-3xl shadow-xl overflow-hidden`}
            >
              <div
                className={`flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center p-4 sm:p-6 md:p-8 lg:p-12`}
              >
                {/* Contenido de texto */}
                <div
                  className={`flex-1 ${
                    index % 2 === 0 ? "md:text-left" : "md:text-right"
                  } text-center md:text-left`}
                >
                  {/* Número */}
                  <div className="mb-3 sm:mb-4">
                    <span className="text-white text-[60px] sm:text-[80px] md:text-[100px] lg:text-[120px] xl:text-[150px] font-bold leading-none opacity-30">
                      {step.number}
                    </span>
                  </div>

                  {/* Título y descripción */}
                  <h3 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 font-[var(--font-montserrat)]">
                    {step.title}
                  </h3>
                  <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed font-[var(--font-montserrat)] opacity-90">
                    {step.description}
                  </p>
                </div>

                {/* Imagen del auto */}
                <div className="flex-shrink-0 w-full md:w-1/2 lg:w-2/5">
                  <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px]">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-contain"
                      priority={index < 2}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <a
            href="https://wa.me/5493515158842?text=Hola%E2%80%A6%20Visitando%20la%20landing%20page%20de%20Vestri,%20me%20surgieron%20algunas%20dudas%E2%80%A6"
            target="_blank"
            rel="noopener noreferrer"
            className="vestri-button"
          >
            Quiero más información
          </a>
        </motion.div>
      </div>
    </section>
  );
}

