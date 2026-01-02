"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Wallet, Car, Search, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface ServiceCard {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
}

export default function HeroVideo() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [lastButtonClicked, setLastButtonClicked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const services: ServiceCard[] = [
    {
      icon: <Wallet className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />,
      title: "Vendé tu auto",
      subtitle: "¡Quiero vender mi auto!",
      href: "https://wa.link/iictkp",
    },
    {
      icon: <Car className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />,
      title: "Consigná tu auto",
      subtitle: "¡Quiero que vendan mi auto!",
      href: "https://wa.link/rlctfq",
    },
    {
      icon: (
        <div className="relative">
          <Search className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />
          <DollarSign className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      ),
      title: "Comprá un auto",
      subtitle: "¡Quiero comprar un auto!",
      href: "https://wa.link/e0j1ga",
    },
  ];

  return (
    <section className="relative w-full">
      {/* Video Section */}
      <div className="relative w-full h-[34vh] sm:h-[37vh] md:h-[40vh] min-h-[190px] sm:min-h-[230px] md:min-h-[290px] overflow-hidden bg-black">
        {/* Poster de fondo mientras carga el video */}
        <div 
          className="absolute inset-0 w-full h-full bg-contain sm:bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/hero-poster.jpg)",
            backgroundPosition: "center center",
          }}
        />
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            src="videos/hero_video.mp4"
            autoPlay
            loop
            muted
            playsInline
            poster="/hero-poster.jpg"
            className="absolute top-1/2 left-1/2 w-full h-full object-contain sm:object-cover object-center"
            style={{
              transform: "translate(-50%, -50%)",
              minWidth: "100%",
              minHeight: "100%",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>

      {/* Cards Section - Siempre visible debajo del video */}
      <div className="w-full bg-black">
        <div className="grid grid-cols-1 md:grid-cols-3 w-full divide-y md:divide-y-0 md:divide-x divide-white/20">
          {services.map((service, index) => {
            // Para el último botón, cambiar el texto si fue clickeado
            const isLastButton = index === 2;
            const displayTitle = isLastButton && lastButtonClicked ? "Ver vehículos" : service.title;
            
            return (
            <Link
              key={index}
              href={service.href}
              target={service.href.startsWith("http") ? "_blank" : undefined}
              rel={service.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="relative group overflow-hidden border-r border-white/20 last:border-r-0"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => {
                if (isLastButton) {
                  setLastButtonClicked(true);
                }
              }}
            >
              <motion.div
                className="h-[120px] sm:h-[140px] md:h-[160px] flex flex-col items-center justify-center p-3 sm:p-4 cursor-pointer relative"
                initial={false}
                animate={{
                  backgroundColor:
                    hoveredCard === index ? "#f97316" : "#000000",
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Separador vertical en desktop - solo entre cards, no al final */}
                {index < services.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-white/20" />
                )}
                    {/* Icono */}
                    <motion.div
                      className="mb-2 sm:mb-2.5 text-white"
                      animate={{
                        scale: hoveredCard === index ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {service.icon}
                    </motion.div>

                    {/* Contenedor de texto debajo del icono */}
                    <div className="relative h-12 sm:h-14 flex items-center justify-center w-full px-2">
                      {/* Título - Se oculta cuando hay hover */}
                      <motion.div
                        className="absolute"
                        animate={{
                          opacity: hoveredCard === index ? 0 : 1,
                          y: hoveredCard === index ? -15 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="font-antenna text-white text-sm sm:text-base md:text-lg font-bold text-center px-2 sm:px-3">
                          {displayTitle}
                        </h2>
                      </motion.div>

                      {/* Subtítulo - Aparece cuando hay hover con contorno tipo botón */}
                      <motion.div
                        className="absolute"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{
                          opacity: hoveredCard === index ? 1 : 0,
                          y: hoveredCard === index ? 0 : 15,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="border-2 border-white rounded-lg px-2 sm:px-4 py-1 sm:py-1.5">
                          <p className="font-antenna text-white text-xs sm:text-sm md:text-base font-semibold text-center whitespace-nowrap">
                            {service.subtitle}
                          </p>
                        </div>
                      </motion.div>
                    </div>
              </motion.div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

