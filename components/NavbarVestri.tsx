"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NavbarVestri() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const menuItems = [
    { href: "#inicio", label: "INICIO" },
    { href: "#beneficios", label: "BENEFICIOS" },
    { href: "#contacto", label: "CONTACTO" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuClick = (href: string) => {
    // Cerrar el menú móvil primero
    setIsMenuOpen(false);
    
    // Esperar un poco para que el menú se cierre antes de hacer scroll
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        // Calcular el offset para compensar el navbar sticky
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 300); // Esperar 300ms para que la animación de cierre del menú termine
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 bg-white ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      {/* Navbar */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-3 sm:py-4">
          {/* Logo - Izquierda */}
          <div className="flex items-center flex-shrink-0">
            <div className="relative w-[120px] h-[60px] sm:w-[140px] sm:h-[70px] md:w-[160px] md:h-[80px]">
              <Image
                src="/IMG/vestri/logo-advice.png"
                alt="Vestri BY CAR ADVICE"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </div>

          {/* Slogan - Centro (oculto en móvil) */}
          <div className="hidden lg:flex flex-1 justify-center px-2 xl:px-4">
            <h2 className="text-black text-lg xl:text-2xl 2xl:text-3xl font-normal font-[var(--font-montserrat)] text-center">
              Tu socio en el negocio automotor
            </h2>
          </div>

          {/* Menú Desktop - Derecha (oculto en móvil) */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {menuItems.map((item) => (
              <motion.button
                key={item.href}
                onClick={() => handleMenuClick(item.href)}
                className="relative text-gray-700 hover:text-[#192BC2] font-[var(--font-montserrat)] font-semibold text-sm xl:text-base transition-colors duration-300 py-2 px-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#192BC2]"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0 }}
                />
              </motion.button>
            ))}
          </div>

          {/* Menú Hamburguesa - Derecha (solo móvil) */}
          <button
            className="lg:hidden bg-[#192BC2] hover:bg-[#1525a0] text-white p-3 rounded-lg transition-all duration-300 active:scale-95"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu Toggle"
            aria-expanded={isMenuOpen}
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </button>
        </nav>

        {/* Menú Móvil */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden"
            >
              <div className="pt-4 pb-6 border-t border-gray-200 space-y-1">
                {/* Slogan en móvil */}
                <div className="px-4 pb-3 mb-3 border-b border-gray-200">
                  <h2 className="text-black text-base md:text-lg font-normal font-[var(--font-montserrat)]">
                    Tu socio en el negocio automotor
                  </h2>
                </div>
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <button
                      onClick={() => handleMenuClick(item.href)}
                      className="w-full text-left py-3 px-4 text-gray-700 hover:text-[#192BC2] hover:bg-blue-50 rounded-lg transition-all duration-300 font-[var(--font-montserrat)] font-semibold active:scale-95"
                    >
                      {item.label}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Línea azul inferior */}
      <motion.div
        className="h-1 bg-[#192BC2] w-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ originX: 0 }}
      />
    </header>
  );
}

