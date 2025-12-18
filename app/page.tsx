"use client";

import HeroVideo from "@/components/HeroVideo";
import SearchBar from "@/components/SearchBar";
import VehicleCarousel from "@/components/VehicleCarousel";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useTopPricedVehicles } from "@/hooks/useVehicles";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data: topArsVehicles, isLoading: loadingArs } = useTopPricedVehicles("ARS", 8);
  const { data: topUsdVehicles, isLoading: loadingUsd } = useTopPricedVehicles("USD", 8);

  return (
    <div>
      <HeroVideo />

      <section className="container mx-auto px-4 py-8">
        {/* Barra de búsqueda */}
        <SearchBar />

        {/* Título: TU PRÓXIMO AUTO ESTÁ CON NOSOTROS */}
        <div className="text-center mb-8 sm:mb-12 px-4 mt-12">
          <h2 className="font-antenna text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-8 sm:mb-10 leading-tight">
            TU PRÓXIMO AUTO ESTÁ CON NOSOTROS
          </h2>
          
          {/* Carrusel de autos más caros en ARS */}
          {loadingArs ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : (
            topArsVehicles && topArsVehicles.length > 0 && (
              <>
                <VehicleCarousel vehicles={topArsVehicles} currency="ARS" />
                <div className="mt-8">
                  <Link
                    href="/autos"
                    className="font-antenna inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Ver autos disponibles
                  </Link>
                </div>
              </>
            )
          )}
        </div>

        {/* Título: ENCONTRÁ EL VEHÍCULO PERFECTO PARA VOS */}
        <div className="text-center mb-8 sm:mb-12 px-4 mt-16">
          <h2 className="font-antenna text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-8 sm:mb-10 leading-tight">
            ENCONTRÁ EL VEHÍCULO PERFECTO PARA VOS
          </h2>
          
          {/* Carrusel de autos más caros en USD */}
          {loadingUsd ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : (
            topUsdVehicles && topUsdVehicles.length > 0 && (
              <>
                <VehicleCarousel vehicles={topUsdVehicles} currency="USD" />
                <div className="mt-8">
                  <Link
                    href="/autos"
                    className="font-antenna inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Ver autos disponibles
                  </Link>
                </div>
              </>
            )
          )}
        </div>
      </section>

      {/* Botón flotante de WhatsApp */}
      <WhatsAppButton />
    </div>
  );
}

