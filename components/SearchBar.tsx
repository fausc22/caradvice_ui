"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFilterOptions } from "@/hooks/useVehicles";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SearchBar() {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Obtener todas las marcas disponibles
  const { data: allFilterOptions } = useFilterOptions();
  
  // Obtener modelos cuando hay una marca seleccionada
  const { data: modelFilterOptions } = useFilterOptions(
    selectedBrand ? { brand: selectedBrand } : undefined
  );

  // Resetear modelo cuando cambia la marca
  useEffect(() => {
    setSelectedModel("");
  }, [selectedBrand]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    if (openDropdown) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
          setOpenDropdown(null);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

  const brands = allFilterOptions?.brands || [];
  const models = selectedBrand && modelFilterOptions?.models ? modelFilterOptions.models : [];
  // Generar años desde 2025 hasta 1995 (31 años)
  const years = Array.from({ length: 2025 - 1995 + 1 }, (_, i) => 2025 - i);

  const handleSearch = () => {
    // Construir los parámetros de la URL
    const params = new URLSearchParams();
    
    // Siempre incluir parámetros por defecto
    params.set("page", "1");
    params.set("limit", "20");
    params.set("sortBy", "created_at");
    params.set("sortOrder", "DESC");
    
    // Agregar filtros seleccionados
    if (selectedBrand) {
      params.set("brand", selectedBrand);
    }
    
    if (selectedModel) {
      params.set("model", selectedModel);
    }
    
    if (selectedYear) {
      params.set("minYear", selectedYear);
      params.set("maxYear", selectedYear);
    }

    // Redirigir a /autos con los filtros
    router.push(`/autos?${params.toString()}`);
  };

  // Validar que haya al menos un filtro seleccionado
  // Permite: solo marca, marca+modelo, marca+modelo+año, o solo año
  const canSearch = selectedBrand || selectedYear;

  return (
    <div className="bg-gray-100 rounded-lg p-4 sm:p-6 mb-8 shadow-sm font-antenna">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        Buscá tu próximo auto
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 sm:mb-6">
        {/* Marca */}
        <div className="dropdown-container">
          <label className="block text-sm font-medium text-gray-700 mb-2 font-antenna">
            Marca
          </label>
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "brand" ? null : "brand")}
              className={cn(
                "font-antenna w-full bg-white rounded-full px-4 py-3 text-sm font-medium text-gray-700 flex items-center justify-between",
                selectedBrand && "ring-2 ring-orange-500"
              )}
            >
              <span className="truncate">{selectedBrand || "Elegí la marca"}</span>
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform flex-shrink-0 ml-2",
                  openDropdown === "brand" && "rotate-180"
                )}
              />
            </button>
            {openDropdown === "brand" && (
              <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                <div
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedBrand("");
                    setOpenDropdown(null);
                  }}
                >
                  Todas
                </div>
                {brands.map((brand) => (
                  <div
                    key={brand.name}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      setSelectedBrand(brand.name);
                      setOpenDropdown(null);
                    }}
                  >
                    <span>{brand.name}</span>
                    {brand.count !== undefined && (
                      <span className="text-gray-500">({brand.count})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modelo - Solo habilitado si hay marca seleccionada */}
        <div className="dropdown-container">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modelo
          </label>
          <div className="relative">
            <button
              disabled={!selectedBrand}
              onClick={() => selectedBrand && setOpenDropdown(openDropdown === "model" ? null : "model")}
              className={cn(
                "font-antenna w-full bg-white rounded-full px-4 py-3 text-sm font-medium flex items-center justify-between",
                selectedBrand
                  ? selectedModel
                    ? "ring-2 ring-orange-500 text-gray-700"
                    : "text-gray-700"
                  : "text-gray-400 cursor-not-allowed opacity-50 bg-gray-100"
              )}
            >
              <span className="truncate">
                {selectedModel || (selectedBrand ? "Elegí el modelo" : "Primero elegí una marca")}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform flex-shrink-0 ml-2",
                  openDropdown === "model" && "rotate-180",
                  !selectedBrand && "text-gray-300"
                )}
              />
            </button>
            {openDropdown === "model" && selectedBrand && (
              <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                <div
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedModel("");
                    setOpenDropdown(null);
                  }}
                >
                  Todos
                </div>
                {models.map((model) => (
                  <div
                    key={model.name}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      setSelectedModel(model.name);
                      setOpenDropdown(null);
                    }}
                  >
                    <span>{model.name}</span>
                    {model.count !== undefined && (
                      <span className="text-gray-500">({model.count})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Año */}
        <div className="dropdown-container">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año
          </label>
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "year" ? null : "year")}
              className={cn(
                "font-antenna w-full bg-white rounded-full px-4 py-3 text-sm font-medium text-gray-700 flex items-center justify-between",
                selectedYear && "ring-2 ring-orange-500"
              )}
            >
              <span className="truncate">{selectedYear || "Elegí el año"}</span>
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform flex-shrink-0 ml-2",
                  openDropdown === "year" && "rotate-180"
                )}
              />
            </button>
            {openDropdown === "year" && (
              <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                <div
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedYear("");
                    setOpenDropdown(null);
                  }}
                >
                  Todos
                </div>
                {years.map((year) => (
                  <div
                    key={year}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedYear(String(year));
                      setOpenDropdown(null);
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar dropdowns */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/autos"
            className="font-antenna relative inline-block text-blue-600 hover:text-blue-700 font-semibold text-base sm:text-lg transition-colors group"
          >
            <span className="relative z-10">• Ver todos los vehículos disponibles</span>
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600/30 origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut", delay: 0.1 }}
            />
          </Link>
        </motion.div>
        <button
          onClick={handleSearch}
          disabled={!canSearch}
          className={`font-antenna bg-red-600 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center shadow-md hover:shadow-lg ${
            canSearch
              ? "hover:bg-red-700 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          <Search size={18} />
          Buscar
        </button>
      </div>
    </div>
  );
}
