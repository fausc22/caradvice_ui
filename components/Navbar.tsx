"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


interface NavLinkProps {
  href: string;
  label: string;
  imageSrc?: string;
  logoHeightDesktop?: string;
  logoHeightMobile?: string;
  logoWidth?: number;
}

function NavLink({ href, label, imageSrc, logoHeightDesktop = "h-12", logoHeightMobile = "h-10", logoWidth = 180 }: NavLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className="relative py-2 px-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {imageSrc ? (
        <div className={`relative ${logoHeightDesktop} w-auto flex items-center`}>
          <Image
            src={imageSrc}
            alt={label}
            width={logoWidth}
            height={logoWidth * 0.3}
            className={`transition-opacity duration-300 object-contain ${
              isHovered ? "opacity-80" : "opacity-100"
            }`}
            style={{ height: "auto", width: "auto", maxHeight: "100%" }}
          />
        </div>
      ) : (
        <span
          className={`transition-colors duration-300 ${
            isHovered ? "text-orange-500" : "text-white"
          }`}
        >
          {label}
        </span>
      )}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ originX: 0 }}
      />
    </Link>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // TAMAÑO DEL LOGO VESTRI - Modifica estos valores para ajustar el tamaño
  const VESTRI_LOGO_HEIGHT_DESKTOP = "h-20"; // Altura en desktop (ej: h-8, h-10, h-12, h-14, h-16)
  const VESTRI_LOGO_HEIGHT_MOBILE = "h-20"; // Altura en móvil (ej: h-6, h-8, h-10, h-12)
  const VESTRI_LOGO_WIDTH = 180; // Ancho en píxeles (ajusta según necesites)

  const menuItems = [
    { href: "/", label: "Inicio" },
    { href: "/autos", label: "Vehiculos" },
    { href: "/nosotros", label: "Nosotros" },
    { href: "/contacto", label: "Contacto" },
    { href: "/vestri", label: "Vestri", imageSrc: "/IMG/vestri-navbar.png" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menú móvil al hacer clic fuera o cambiar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={`font-antenna sticky top-0 z-50 w-full transition-all duration-300 bg-black ${
        isScrolled ? "shadow-lg" : ""
      }`}
    >
      {/* Contenido del navbar */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-0.5 md:py-1">
          {/* Logo - Ocupa toda la parte izquierda */}
          <Link
            href="/"
            className="flex items-center group flex-shrink-0 flex-1 lg:flex-none"
          >
            <div className="relative w-32 h-16 sm:w-36 sm:h-18 md:w-40 md:h-20 lg:w-44 lg:h-22 flex-shrink-0">
              <Image
                src="/logo_navbar.jpg"
                alt="CAR ADVICE Logo"
                fill
                className="object-contain object-left group-hover:opacity-90 transition-opacity duration-300"
                style={{ mixBlendMode: 'lighten' }}
                priority
              />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {menuItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                imageSrc={item.imageSrc}
                logoHeightDesktop={VESTRI_LOGO_HEIGHT_DESKTOP}
                logoHeightMobile={VESTRI_LOGO_HEIGHT_MOBILE}
                logoWidth={VESTRI_LOGO_WIDTH}
              />
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="pt-4 pb-6 border-t border-white/20 space-y-1">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="block py-3 px-4 text-white hover:text-orange-500 hover:bg-white/5 rounded-lg transition-all duration-300 relative group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.imageSrc ? (
                        <div className={`relative z-10 ${VESTRI_LOGO_HEIGHT_MOBILE} w-auto flex items-center`}>
                          <Image
                            src={item.imageSrc}
                            alt={item.label}
                            width={VESTRI_LOGO_WIDTH}
                            height={VESTRI_LOGO_WIDTH * 0.3}
                            className="transition-opacity duration-300 object-contain group-hover:opacity-80"
                            style={{ height: "auto", width: "auto", maxHeight: "100%" }}
                          />
                        </div>
                      ) : (
                        <span className="relative z-10">{item.label}</span>
                      )}
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r"
                        initial={{ scaleY: 0 }}
                        whileHover={{ scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

