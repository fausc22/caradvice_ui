"use client";

import { useVehicleFilters } from "@/hooks/useVehicleFilters";
import { useVehicles, useFilterOptions } from "@/hooks/useVehicles";
import { useVehicleStore } from "@/store/useVehicleStore";
import VehicleFilters from "@/components/vehicles/VehicleFilters";
import VehicleGrid from "@/components/vehicles/VehicleGrid";
import ViewControls from "@/components/vehicles/ViewControls";
import Pagination from "@/components/vehicles/Pagination";
import HeroVideo from "@/components/HeroVideo";
import WhatsAppButton from "@/components/WhatsAppButton";
import CompareFloatButton from "@/components/CompareFloatButton";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

export default function AutosPage() {
  const { filters, updateFilters, clearFilters, setFilters } = useVehicleFilters();
  const { viewMode, currency, setViewMode, setCurrency } = useVehicleStore();
  const hasInitialized = useRef(false);

  // Limpiar filtros al recargar la página SOLO si no hay filtros en la URL
  useEffect(() => {
    if (!hasInitialized.current && typeof window !== 'undefined') {
      hasInitialized.current = true;
      
      // Verificar si hay filtros en la URL (excluyendo page, limit, sortBy, sortOrder)
      const urlParams = new URLSearchParams(window.location.search);
      const hasFiltersInUrl = Array.from(urlParams.keys()).some(key => 
        !['page', 'limit', 'sortBy', 'sortOrder'].includes(key) && urlParams.get(key) !== null
      );
      
      // Solo limpiar si NO hay filtros en la URL (navegación directa sin parámetros)
      if (!hasFiltersInUrl) {
        const defaultFilters = {
          page: 1,
          limit: 20,
          sortBy: "created_at" as const,
          sortOrder: "DESC" as const,
          brand: null,
          model: null,
          condition: null,
          transmission: null,
          fuel_type: null,
          color: null,
          segment: null,
          minPrice: null,
          maxPrice: null,
          minYear: null,
          maxYear: null,
          minKilometres: null,
          maxKilometres: null,
          search: null,
          currency: null,
        };
        
        setFilters(defaultFilters);
      }
    }
  }, [setFilters]);
  
  const { data: vehiclesData, isLoading } = useVehicles(filters);
  // Pasar filtros actuales (sin page/limit) para obtener conteos dinámicos
  // Usar el currency del filtro si está definido, sino usar el del store (para visualización)
  const displayCurrency = filters.currency || currency;
  const { data: filterOptions, isLoading: filtersLoading } = useFilterOptions({
    condition: filters.condition,
    brand: filters.brand,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minYear: filters.minYear,
    maxYear: filters.maxYear,
    minKilometres: filters.minKilometres,
    maxKilometres: filters.maxKilometres,
    currency: filters.currency, // Usar el currency del filtro, no del store
  });

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters.page]);

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage });
  };

  const handleSortChange = (sortBy: string, sortOrder: "ASC" | "DESC") => {
    updateFilters({ sortBy: sortBy as any, sortOrder, page: 1 });
  };

  const handleCurrencyChange = (newCurrency: "ARS" | "USD") => {
    setCurrency(newCurrency);
    updateFilters({ currency: newCurrency, page: 1 });
  };

  return (
    <div className="font-antenna min-h-screen bg-gray-50">
      {/* Video y Botones Hero */}
      <HeroVideo />
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Filtros */}
        {!filtersLoading && filterOptions && (
          <VehicleFilters
            filters={filters}
            filterOptions={filterOptions}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            currency={displayCurrency}
            onCurrencyChange={handleCurrencyChange}
          />
        )}

        {/* Header con resultados y controles */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 mt-4 sm:mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                  {vehiclesData?.pagination.total || 0}{" "}
                  <span className="whitespace-nowrap">
                    {vehiclesData?.pagination.total === 1 ? "Resultado" : "Resultados"}
                  </span>
                </h2>
                {isLoading && (
                  <Loader2 className="animate-spin text-orange-500 flex-shrink-0" size={20} />
                )}
              </div>
            </div>

            <ViewControls
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* Grid de vehículos */}
        <VehicleGrid
          vehicles={vehiclesData?.vehicles || []}
          loading={isLoading}
          viewMode={viewMode}
          currency={displayCurrency}
        />

        {/* Paginación */}
        {vehiclesData && vehiclesData.pagination.totalPages > 1 && (
          <Pagination
            currentPage={vehiclesData.pagination.page}
            totalPages={vehiclesData.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {/* Mensaje cuando no hay resultados */}
        {!isLoading && vehiclesData && vehiclesData.vehicles.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <p className="text-gray-600 text-base sm:text-lg mb-4">
              No se encontraron vehículos con los filtros seleccionados.
            </p>
            <button
              onClick={clearFilters}
              className="text-orange-500 hover:text-orange-600 font-medium text-sm sm:text-base"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Botón flotante de WhatsApp */}
      <WhatsAppButton />
      
      {/* Botón flotante de Comparar */}
      <CompareFloatButton />
    </div>
  );
}
