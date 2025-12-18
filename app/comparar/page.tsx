"use client";

import { useComparisonStore } from "@/store/useComparisonStore";
import { useVehicles } from "@/hooks/useVehicles";
import { Loader2, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ComparePage() {
  const { getSelectedVehicles, removeVehicle, clearSelection, getSelectedCount } = useComparisonStore();
  const selectedIds = useComparisonStore((state) => state.selectedVehicles);
  const selectedCount = getSelectedCount();

  // Si no hay vehículos seleccionados, mostrar estado vacío
  if (selectedCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4 py-8">
        <div className="max-w-md w-full text-center bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <X size={40} className="sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No hay vehículos para comparar</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Selecciona hasta 5 vehículos en la página de inventario para compararlos.
            </p>
          </div>
          <Link
            href="/autos"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
          >
            Ir al inventario
          </Link>
        </div>
      </div>
    );
  }

  // Obtener datos completos de los vehículos seleccionados
  const vehicles = getSelectedVehicles();

  const formatPrice = (price: number, currency: "ARS" | "USD") => {
    const formatted = Math.floor(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return currency === "USD" ? `U$${formatted}` : `$${formatted}`;
  };

  const getVehiclePrice = (vehicle: typeof vehicles[0]) => {
    if (vehicle.price_usd && vehicle.price_usd > 0) {
      return { price: vehicle.price_usd, currency: "USD" as const };
    }
    if (vehicle.price_ars && vehicle.price_ars > 0) {
      return { price: vehicle.price_ars, currency: "ARS" as const };
    }
    return { price: 0, currency: "ARS" as const };
  };

  const getImageUrl = (vehicle: typeof vehicles[0]) => {
    if (vehicle.featured_image_path) {
      return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/image?path=${encodeURIComponent(vehicle.featured_image_path)}`;
    }
    return vehicle.featured_image_url || "/IMG/logo_transparente.png";
  };

  // Características a comparar
  const comparisonFields = [
    { key: "precio", label: "Precio", format: (vehicle: typeof vehicles[0]) => {
      const priceInfo = getVehiclePrice(vehicle);
      return priceInfo.price > 0 ? formatPrice(priceInfo.price, priceInfo.currency) : "—";
    }},
    { key: "año", label: "Año", format: (vehicle: typeof vehicles[0]) => vehicle.year || "—" },
    { key: "kilometraje", label: "Kilometraje", format: (vehicle: typeof vehicles[0]) => 
      vehicle.kilometres ? `${vehicle.kilometres.toLocaleString("es-AR")} km` : "—"
    },
    { key: "marca", label: "Marca", format: (vehicle: typeof vehicles[0]) => 
      vehicle.taxonomies?.brand?.[0] || "—"
    },
    { key: "modelo", label: "Modelo", format: (vehicle: typeof vehicles[0]) => 
      vehicle.taxonomies?.model?.[0] || "—"
    },
    { key: "condición", label: "Condición", format: (vehicle: typeof vehicles[0]) => 
      vehicle.taxonomies?.condition?.[0] || "—"
    },
    { key: "transmisión", label: "Transmisión", format: (vehicle: typeof vehicles[0]) => 
      vehicle.taxonomies?.transmission?.[0] || "—"
    },
    { key: "combustible", label: "Combustible", format: (vehicle: typeof vehicles[0]) => 
      vehicle.taxonomies?.fuel_type?.[0] || "—"
    },
    { key: "color", label: "Color", format: (vehicle: typeof vehicles[0]) => 
      vehicle.taxonomies?.color?.[0] || "—"
    },
    { key: "segmento", label: "Segmento", format: (vehicle: typeof vehicles[0]) => 
      vehicle.taxonomies?.segment?.[0] || "—"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-antenna">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-[1920px]">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Link
              href="/autos"
              className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-orange-500 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-sm sm:text-base">Volver al inventario</span>
              <span className="sm:hidden text-sm">Volver</span>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
                Comparar Vehículos
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                {selectedCount} {selectedCount === 1 ? "vehículo seleccionado" : "vehículos seleccionados"}
              </p>
            </div>
          </div>
          <button
            onClick={clearSelection}
            className="text-xs sm:text-sm text-gray-600 hover:text-orange-500 transition-colors px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:border-orange-500 whitespace-nowrap flex-shrink-0"
          >
            Limpiar todos
          </button>
        </div>

        {/* Tabla Comparativa - Responsive con scroll horizontal en mobile */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="min-w-[520px] sm:min-w-[700px] lg:min-w-[800px]">
              {/* Header sticky con imágenes y títulos */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <div className="grid" style={{ gridTemplateColumns: `minmax(140px, 180px) repeat(${vehicles.length}, minmax(180px, 1fr))` }}>
                  {/* Columna de labels */}
                  <div className="bg-gray-50 p-3 sm:p-4 border-r border-gray-200">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">Características</h3>
                  </div>
                  
                  {/* Columnas de vehículos */}
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="p-3 sm:p-4 border-r border-gray-200 last:border-r-0 relative">
                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeVehicle(vehicle.id)}
                        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-600 transition-colors touch-manipulation"
                        aria-label="Quitar de comparación"
                      >
                        <X size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      
                      {/* Imagen */}
                      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2 sm:mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(vehicle)}
                          alt={vehicle.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/IMG/logo_transparente.png";
                          }}
                        />
                      </div>
                      
                      {/* Título */}
                      <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-1.5 sm:mb-2 line-clamp-2 pr-8">
                        {vehicle.title}
                      </h3>
                      
                      {/* Precio destacado */}
                      <div className="text-lg sm:text-xl font-bold text-orange-500 mb-2 sm:mb-0">
                        {(() => {
                          const priceInfo = getVehiclePrice(vehicle);
                          return priceInfo.price > 0 ? formatPrice(priceInfo.price, priceInfo.currency) : "Consultar precio";
                        })()}
                      </div>
                      
                      {/* Link a detalle */}
                      <Link
                        href={`/autos/${vehicle.id}`}
                        className="mt-2 sm:mt-3 inline-block text-xs sm:text-sm text-orange-500 hover:text-orange-600 font-medium"
                      >
                        Ver detalles →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filas de características */}
              <div className="divide-y divide-gray-200">
                {comparisonFields.map((field) => (
                  <div
                    key={field.key}
                    className="grid hover:bg-gray-50 transition-colors"
                    style={{ gridTemplateColumns: `minmax(140px, 180px) repeat(${vehicles.length}, minmax(180px, 1fr))` }}
                  >
                    {/* Label de la característica */}
                    <div className="p-3 sm:p-4 bg-gray-50 border-r border-gray-200 font-medium text-gray-700 text-xs sm:text-sm">
                      {field.label}
                    </div>
                    
                    {/* Valores para cada vehículo */}
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="p-3 sm:p-4 border-r border-gray-200 last:border-r-0 text-gray-800 text-xs sm:text-sm">
                        {field.format(vehicle)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="mt-4 sm:mt-6 flex justify-center">
          <Link
            href="/autos"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Volver al inventario</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

