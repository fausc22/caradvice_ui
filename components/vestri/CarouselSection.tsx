"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const carouselImages = [
  {
    src: "https://caradvice.com.ar/vestri/wp-content/uploads/2025/05/111.png",
    alt: "Vehículo 1",
  },
  {
    src: "https://caradvice.com.ar/vestri/wp-content/uploads/2025/05/22.png",
    alt: "Vehículo 2",
  },
  {
    src: "https://caradvice.com.ar/vestri/wp-content/uploads/2025/04/3-1.png",
    alt: "Vehículo 3",
  },
  {
    src: "https://caradvice.com.ar/vestri/wp-content/uploads/2025/04/4-1.png",
    alt: "Vehículo 4",
  },
];

export default function CarouselSection() {
  return (
    <div className="vestri-carousel-container bg-[var(--vestri-gray-light)] py-[130px] px-0">
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
        speed={300}
        loop={true}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        className="w-full"
      >
        {carouselImages.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-[600px] md:h-[800px] flex items-center justify-center">
              <Image
                src={image.src}
                alt={image.alt}
                width={800}
                height={600}
                className="object-contain"
                priority={index === 0}
                unoptimized
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

