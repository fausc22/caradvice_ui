"use client";

import Link from "next/link";
import { Car, DollarSign, TrendingUp } from "lucide-react";

export default function Hero() {
  const services = [
    {
      icon: <Car className="w-12 h-12" />,
      title: "Compramos TU USADO",
      description: "¡Quiero vender mi auto!",
      href: "/vender",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Vendemos tu auto por vos",
      description: "¡Quiero que vendan mi auto!",
      href: "/consignacion",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      icon: <DollarSign className="w-12 h-12" />,
      title: "Financiamos TU AUTO",
      description: "Simular",
      href: "/financiacion",
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            CAR ADVICE
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu concesionaria de confianza para comprar, vender y financiar tu
            auto
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <Link
              key={index}
              href={service.href}
              className={`${service.color} text-white rounded-lg p-8 shadow-lg transform transition-all hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{service.icon}</div>
                <h2 className="text-xl font-bold mb-2">{service.title}</h2>
                <p className="text-sm opacity-90">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

