"use client";

import { motion } from "framer-motion";
import { Target, Eye, Award, Users } from "lucide-react";
import WhatsAppButton from "@/components/WhatsAppButton";

const teamMembers = [
  {
    name: "Ignacio Schuvarten",
    role: "ASESOR COMPRAS",
    email: "ischuvarten@caradvice.com.ar",
    image: "/IMG/about/ignacio1.jpg",
  },
  {
    name: "Aldana Concetti",
    role: "ASESOR COMPRAS",
    email: "aconcetti@caradvice.com.ar",
  },
  {
    name: "Fernando Gallardo",
    role: "ASESOR VENTAS",
    email: "fgallardo@caradvice.com.ar",
    image: "/IMG/about/DSC2418.jpg",
  },
  {
    name: "Javier Acosta",
    role: "ASESOR VENTAS",
    email: "jacosta@caradvice.com.ar",
    image: "/IMG/about/DSC2626.jpg",
  },
  {
    name: "Ignacio Valle",
    role: "ASESOR VENTAS",
    email: "ivalle@caradvice.com.ar",
    image: "/IMG/about/DSC2405.jpg",
  },
  {
    name: "Pablo Pedraza",
    role: "ASESOR VENTAS",
    email: "ppedraza@caradvice.com.ar",
    image: "/IMG/about/DSC2359.jpg",
  },
  {
    name: "Santiago Panizza",
    role: "ASESOR VENTAS",
    email: "spanizza@caradvice.com.ar",
    image: "/IMG/about/DSC2294.jpg",
  },
  {
    name: "Raúl Aranda",
    role: "ASESOR VENTAS",
    email: "raranda@caradvice.com.ar",
    image: "/IMG/about/DSC2542.jpg",
  },
  {
    name: "Nicolás Cazal",
    role: "ASESOR VENTAS",
    email: "ncazal@caradvice.com.ar",
    image: "/IMG/about/DSC2531.jpg",
  },
  {
    name: "Damian Alterman",
    role: "ASESOR VENTAS",
    email: "dalterman@caradvice.com.ar",
    image: "/IMG/about/IMG_2907.jpg",
  },
  {
    name: "Emmanuel Buscarolo",
    role: "ASESOR VENTAS",
    email: "ebuscarolo@caradvice.com.ar",
    image: "/IMG/about/emanuel.jpeg",
  },
  {
    name: "Fernando Escudero",
    role: "ASESOR VENTAS",
    email: "fescudero@caradvice.com.ar",
    image: "/IMG/about/IMG_2915.jpg",
  },
  {
    name: "Juan Tapia",
    role: "ASESOR VENTAS",
    email: "juan.tapia@caradvice.com.ar",
  },
];

export default function QuienesSomos() {
  return (
    <div className="font-antenna bg-white">
      {/* Introducción */}
      <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
        {/* Imagen de fondo con blur */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/IMG/about/Caraffa-12.jpg')",
            filter: "blur(8px)",
            transform: "scale(1.1)",
          }}
        />
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Contenedor con recuadro */}
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24 relative z-10">
          <div className="flex justify-center md:justify-end">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 max-w-2xl w-full"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Quiénes somos
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-4 sm:mb-6">
                En CAR ADVICE nos destacamos por ofrecer{" "}
                <span className="font-bold text-gray-900">
                  vehículos rigurosamente seleccionados
                </span>
                , con opciones de{" "}
                <span className="font-bold text-gray-900">
                  financiación flexibles
                </span>{" "}
                y un servicio de{" "}
                <span className="font-bold text-gray-900">postventa</span> que
                garantiza la satisfacción a largo plazo.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                Nuestra propuesta va más allá de la venta:{" "}
                <span className="font-bold text-gray-900">
                  construimos confianza
                </span>{" "}
                a través de un enfoque cercano y transparente. Gracias a la
                estrategia de contenido digital, generamos valor real para nuestra
                comunidad, fidelizando clientes y posicionándonos como referentes en
                el sector.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Misión, Visión, Valores */}
      <section className="bg-gray-100 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Misión */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 md:p-10 text-center"
            >
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500 rounded-full flex items-center justify-center">
                  <Target className="text-white" size={28} />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Misión
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
                Transformar la compra-venta de vehículos usados y 0km en una{" "}
                <span className="font-bold">solución integral</span>, brindando
                una experiencia{" "}
                <span className="font-bold">libre de preocupaciones.</span>
              </p>
            </motion.div>

            {/* Visión */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 md:p-10 text-center"
            >
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500 rounded-full flex items-center justify-center">
                  <Eye className="text-white" size={28} />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Visión
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">
                Ser la empresa{" "}
                <span className="font-bold">
                  referente del sector en Córdoba Capital
                </span>
                , en la cual los clientes confíen sus operaciones en nuestra
                experiencia y profesionalidad, a fin de obtener{" "}
                <span className="font-bold">resultados satisfactorios.</span>
              </p>
            </motion.div>

            {/* Valores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 md:p-10 text-center"
            >
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500 rounded-full flex items-center justify-center">
                  <Award className="text-white" size={28} />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Valores
              </h2>
              <ul className="text-gray-700 leading-relaxed space-y-1 text-sm sm:text-base md:text-lg">
                <li className="font-bold">Calidad,</li>
                <li className="font-bold">servicio al cliente,</li>
                <li className="font-bold">responsabilidad,</li>
                <li className="font-bold">trabajo en equipo,</li>
                <li className="font-bold">transparencia.</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nuestro Diferencial */}
      <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
        {/* Imagen de fondo con blur */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/IMG/about/Caraffa-17.jpg')",
            filter: "blur(8px)",
            transform: "scale(1.1)",
          }}
        />
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Contenedor con recuadro */}
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24 relative z-10">
          <div className="flex justify-center md:justify-end">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 max-w-2xl w-full"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Nuestro diferencial
              </h2>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Oferta de valor
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-4 sm:mb-6">
                En CAR ADVICE nos destacamos por ofrecer{" "}
                <span className="font-bold text-gray-900">
                  vehículos rigurosamente seleccionados
                </span>
                , con opciones de{" "}
                <span className="font-bold text-gray-900">
                  financiación flexibles
                </span>{" "}
                y un servicio de{" "}
                <span className="font-bold text-gray-900">postventa</span> que
                garantiza la satisfacción a largo plazo.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                Nuestra propuesta va más allá de la venta:{" "}
                <span className="font-bold text-gray-900">
                  construimos confianza
                </span>{" "}
                a través de un enfoque cercano y transparente. Gracias a la
                estrategia de contenido digital, generamos valor real para nuestra
                comunidad, fidelizando clientes y posicionándonos como referentes
                en el sector.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nuestro Equipo */}
      <section className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <div className="flex justify-center mb-4 sm:mb-6">
              <motion.div 
                className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Users className="text-white" size={32} />
              </motion.div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 italic px-4">
              &ldquo;Trabajamos para que la experiencia de nuestro cliente sea única.&rdquo;
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto px-4 sm:px-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.03,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer"
              >
                {/* Foto superior con efecto zoom */}
                <div className="relative w-full h-48 sm:h-56 md:h-60 lg:h-64 xl:h-72 overflow-hidden bg-gray-100">
                  {member.image ? (
                    <>
                      <motion.img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                      {/* Overlay sutil al hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <Users className="text-gray-600" size={60} />
                    </div>
                  )}
                </div>
                
                {/* Información inferior */}
                <motion.div 
                  className="p-4 sm:p-5 md:p-6"
                  initial={{ opacity: 1 }}
                  whileHover={{ opacity: 0.95 }}
                >
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-orange-600 font-semibold tracking-wide uppercase">
                    {member.role}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/IMG/about/Granaderos-18.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              ¿Listo para encontrar tu próximo auto?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-200 max-w-2xl mx-auto px-4">
              Nuestro equipo está listo para ayudarte en cada paso del proceso
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <motion.a
                href="/autos"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition-colors duration-300 shadow-lg w-full sm:w-auto text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver Autos Disponibles
              </motion.a>
              <motion.a
                href="/contacto"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition-colors duration-300 border border-white/30 w-full sm:w-auto text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contactanos
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Botón flotante de WhatsApp */}
      <WhatsAppButton />
    </div>
  );
}


