"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone, DollarSign, User } from "lucide-react";
import LoginModal from "./LoginModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const menuItems = [
    { href: "/", label: "Inicio" },
    { href: "/autos", label: "Autos disponibles" },
    { href: "/nosotros", label: "¿Quienes somos?" },
    { href: "/contacto", label: "Contacto" },
    { href: "/vestri", label: "Vestri" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-4">
            <a
              href="tel:+543515158848"
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-accent transition"
            >
              <Phone size={16} />
              <span>351 515 8848</span>
            </a>
            <a
              href="mailto:consultas@caradvice.com.ar"
              className="text-sm text-gray-700 hover:text-accent transition"
            >
              consultas@caradvice.com.ar
            </a>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-gray-700" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "ARS" | "USD")}
              className="border-none bg-transparent text-sm font-medium cursor-pointer focus:outline-none"
            >
              <option value="ARS">$AR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center justify-between py-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            CAR ADVICE
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-accent transition font-medium"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 text-gray-700 hover:text-accent transition font-medium"
            >
              <User size={18} />
              <span>Ingresar</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-gray-700 hover:text-accent transition"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsLoginOpen(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 py-2 text-gray-700 hover:text-accent transition"
            >
              <User size={18} />
              <span>Ingresar</span>
            </button>
          </div>
        )}
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
}

