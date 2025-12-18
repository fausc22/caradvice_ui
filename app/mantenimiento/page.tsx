"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MessageCircle, Globe, Instagram } from "lucide-react";

export default function MantenimientoPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fecha objetivo para el mantenimiento (puedes ajustarla)
  const targetDate = new Date("2025-12-15T12:00:00").getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, "0");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/mantenimiento/fondo_mantenimiento.jpg"
          alt="Fondo mantenimiento"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay sutil para mejorar legibilidad */}
        <div className="absolute inset-0 bg-white/5"></div>
      </div>

      {/* Barra azul superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 z-20"></div>

      {/* Contenido principal - reposado hacia la derecha */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center md:justify-end px-4 md:px-8 lg:pr-16 xl:pr-24">
          <div className="w-full max-w-2xl lg:max-w-3xl py-8 md:py-12">
            {/* Header con logo y texto */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 mb-8 md:mb-12">
              <div className="relative w-40 sm:w-48 md:w-56 h-20 sm:h-24 md:h-28 flex-shrink-0">
                <Image
                  src="/img/mantenimiento/logo_mantenimiento.png"
                  alt="CAR ADVICE Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-center md:text-left">
                <p className="text-gray-800 text-lg sm:text-xl md:text-2xl font-semibold">
                  ¡Estamos mejorando para vos!
                </p>
              </div>
            </div>

            {/* Contador regresivo */}
            <div className="flex justify-center md:justify-start items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 mb-8 md:mb-12 flex-wrap">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-2">
                  {formatNumber(timeLeft.days)}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm md:text-base font-medium">Días</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-2">
                  {formatNumber(timeLeft.hours)}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm md:text-base font-medium">Horas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-2">
                  {formatNumber(timeLeft.minutes)}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm md:text-base font-medium">Minutos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-2">
                  {formatNumber(timeLeft.seconds)}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm md:text-base font-medium">Segundos</div>
              </div>
            </div>

            {/* Texto principal */}
            <div className="mb-8 md:mb-10">
              <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed text-center md:text-left">
                Nuestro taller digital está en pleno mantenimiento para ofrecerte una experiencia de navegación mucho más rápida y completa. Estamos ajustando cada detalle para que encuentres todo lo que necesitas para tu vehículo de una manera más fácil.
              </p>
            </div>

            {/* Caja de información y botones */}
            <div className="bg-[#faf9f6] rounded-xl p-5 sm:p-6 md:p-8 lg:p-10 mb-8 shadow-lg border border-gray-200/50">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 md:mb-4 lg:mb-5">
                ¡No te preocupes, seguimos 100% operativos!
              </h3>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-5 md:mb-6 lg:mb-8">
                Aunque nuestra web está en una parada técnica, nuestro equipo de ventas y servicio postventa sigue a tu disposición para lo que necesites.
              </p>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 justify-center md:justify-start items-stretch sm:items-center">
                <a
                  href="https://wa.me/543515158848"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl text-sm sm:text-base md:text-lg w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px]"
                >
                  <MessageCircle size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  Ventas
                </a>
                <a
                  href="https://www.mercadolibre.com.ar/pagina/caradvice"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl text-sm sm:text-base md:text-lg w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px]"
                >
                  <Globe size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  Catálogo
                </a>
                <a
                  href="https://www.instagram.com/caradvicearg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl text-sm sm:text-base md:text-lg w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px]"
                >
                  <Instagram size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra gris inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 z-20"></div>

      {/* Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/543515158848"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 sm:p-4 shadow-lg transition-all hover:scale-110 active:scale-95"
        aria-label="Contactar por WhatsApp"
      >
        <svg
          className="w-6 h-6 sm:w-8 sm:h-8"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        {/* Badge de notificación */}
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
          1
        </span>
      </a>
    </div>
  );
}

