"use client";

import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const carouselImages = [
  {
    src: "/IMG/vestri/carrousel/111.png",
    alt: "Vehículo 1",
  },
  {
    src: "/IMG/vestri/carrousel/22.png",
    alt: "Vehículo 2",
  },
  {
    src: "/IMG/vestri/carrousel/3-1.png",
    alt: "Vehículo 3",
  },
  {
    src: "/IMG/vestri/carrousel/4-1.png",
    alt: "Vehículo 4",
  },
];

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="vestri-hero relative overflow-hidden"
    >
      <div className="vestri-hero-content container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center min-h-[450px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px]">
          {/* Columna Izquierda - Textos */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="vestri-hero-text-1 mb-4 md:mb-5 text-left text-white font-[var(--font-montserrat)]"
            >
              Somos la nueva unidad de negocio de <strong>Car Advice.</strong>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="vestri-hero-text-2 mb-4 md:mb-5 text-left text-white font-[var(--font-montserrat)]"
            >
              Orientados exclusivamente a revendedores.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="vestri-hero-text-3 mb-6 md:mb-8 text-left text-white font-[var(--font-montserrat)]"
            >
              Optimizamos la compra y venta de vehículos para maximizar tu
              rentabilidad.
            </motion.p>

            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              href="https://wa.me/5493515158842?text=Hola%E2%80%A6%20Visitando%20la%20landing%20page%20de%20Vestri,%20me%20surgieron%20algunas%20dudas%E2%80%A6"
              target="_blank"
              rel="noopener noreferrer"
              className="vestri-button self-start"
            >
              ¡Contactanos!
            </motion.a>
          </motion.div>

          {/* Columna Derecha - Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[280px] sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[550px] w-full"
          >
            <Swiper
              modules={[Autoplay, Pagination, EffectFade]}
              spaceBetween={0}
              slidesPerView={1}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              effect="fade"
              fadeEffect={{
                crossFade: true,
              }}
              speed={800}
              loop={true}
              pagination={{
                clickable: true,
                dynamicBullets: false,
                renderBullet: function (index, className) {
                  return '<span class="' + className + '"></span>';
                },
              }}
              className="w-full h-full hero-carousel"
            >
              {carouselImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-contain"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
