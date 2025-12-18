"use client";

import { useState, useRef, useEffect } from "react";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  // Bloquear pausa del video de YouTube
  useEffect(() => {
    // Cargar YouTube IFrame API
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
      } else {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        (window as any).onYouTubeIframeAPIReady = () => {
          initializePlayer();
        };
      }
    };

    const initializePlayer = () => {
      if (!iframeRef.current) return;

      try {
        const player = new (window as any).YT.Player(iframeRef.current.id || 'youtube-hero-video', {
          events: {
            onStateChange: (event: any) => {
              // Estado 2 = pausado, Estado 1 = reproduciendo
              if (event.data === 2) {
                // Reanudar inmediatamente si se pausa
                setTimeout(() => {
                  if (player && typeof player.playVideo === 'function') {
                    player.playVideo();
                  }
                }, 100);
              }
            },
            onReady: (event: any) => {
              playerRef.current = event.target;
              // Asegurar que esté reproduciéndose
              if (event.target && typeof event.target.playVideo === 'function') {
                event.target.playVideo();
              }
            },
          },
        });
        playerRef.current = player;
      } catch (error) {
        console.error("Error inicializando YouTube player:", error);
      }
    };

    // Verificar periódicamente que esté reproduciéndose
    const checkPlaying = setInterval(() => {
      if (playerRef.current && playerRef.current.getPlayerState) {
        try {
          const state = playerRef.current.getPlayerState();
          // Estado 2 = pausado, Estado 5 = cued (listo pero no reproduciendo)
          if (state === 2 || state === 5) {
            if (playerRef.current.playVideo) {
              playerRef.current.playVideo();
            }
          }
        } catch (error) {
          // Ignorar errores de acceso
        }
      }
    }, 1000);

    // Prevenir atajos de teclado que puedan pausar
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "KeyK" || e.code === "KeyP") {
        // Si el iframe tiene el foco, prevenir la pausa
        if (document.activeElement === iframeRef.current) {
          e.preventDefault();
          e.stopPropagation();
          if (playerRef.current && playerRef.current.playVideo) {
            playerRef.current.playVideo();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    loadYouTubeAPI();

    return () => {
      clearInterval(checkPlaying);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const services: ServiceCard[] = [
    {
      icon: <Wallet className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />,
      title: "Compramos TU USADO",
      subtitle: "¡Quiero vender mi auto!",
      href: "/vender",
    },
    {
      icon: <Car className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />,
      title: "Vendemos tu auto por vos",
      subtitle: "¡Quiero que vendan mi auto!",
      href: "/consignacion",
    },
    {
      icon: (
        <div className="relative">
          <Search className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />
          <DollarSign className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      ),
      title: "Financiamos TU AUTO",
      subtitle: "Simular",
      href: "/financiacion",
    },
  ];

  return (
    <section className="relative w-full">
      {/* Video Section */}
      <div className="relative w-full h-[34vh] sm:h-[37vh] md:h-[40vh] min-h-[190px] sm:min-h-[230px] md:min-h-[290px] overflow-hidden bg-black">
        <div className="absolute inset-0 w-full h-full">
          <iframe
            id="youtube-hero-video"
            ref={iframeRef}
            src="https://www.youtube.com/embed/IJERLFby8so?autoplay=1&mute=1&loop=1&playlist=IJERLFby8so&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&start=0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100vw",
              height: "56.25vw",
              minHeight: "100%",
              minWidth: "177.77%",
              transform: "translate(-50%, -50%)",
              border: "none",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Cards Section - Siempre visible debajo del video */}
      <div className="w-full bg-black">
        <div className="grid grid-cols-1 md:grid-cols-3 w-full divide-y md:divide-y-0 md:divide-x divide-white/20">
          {services.map((service, index) => (
            <Link
              key={index}
              href={service.href}
              className="relative group overflow-hidden border-r border-white/20 last:border-r-0"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
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
                          {service.title}
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
          ))}
        </div>
      </div>
    </section>
  );
}

