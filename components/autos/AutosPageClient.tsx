"use client";

import { useVehicleFilters } from "@/hooks/useVehicleFilters";
import { useVehicles, useFilterOptions } from "@/hooks/useVehicles";
import { useVehicleStore } from "@/store/useVehicleStore";
import VehicleFilters from "@/components/vehicles/VehicleFilters";
import VehicleGrid from "@/components/vehicles/VehicleGrid";
import ViewControls from "@/components/vehicles/ViewControls";
import Pagination from "@/components/vehicles/Pagination";
import CompareFloatButton from "@/components/CompareFloatButton";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Car } from "@/types/car";

interface AutosPageClientProps {
  initialVehicles: Car[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialFilterOptions: {
    conditions: { name: string; count: number }[];
    brands: { name: string; count: number }[];
    models: { name: string; count: number }[];
    segments?: { name: string; count: number }[];
    transmissions?: { name: string; count: number }[];
    fuelTypes?: { name: string; count: number }[];
    colors?: { name: string; count: number }[];
    ranges: {
      min_price_usd?: number;
      max_price_usd?: number;
      min_price_ars?: number;
      max_price_ars?: number;
      min_year?: number;
      max_year?: number;
      min_kilometres?: number;
      max_kilometres?: number;
    };
  };
  initialFilters: {
    page?: number;
    brand?: string;
    model?: string;
    condition?: string;
    transmission?: string;
    fuel_type?: string;
    color?: string;
    segment?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    minKilometres?: number;
    maxKilometres?: number;
    search?: string;
    currency?: "ARS" | "USD";
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  };
}

export default function AutosPageClient({
  initialVehicles,
  initialPagination,
  initialFilterOptions,
  initialFilters,
}: AutosPageClientProps) {
  const { filters, updateFilters, clearFilters, setFilters } = useVehicleFilters();
  const { viewMode, currency, setViewMode, setCurrency } = useVehicleStore();
  const hasInitialized = useRef(false);

  // Inicializar filtros desde props si hay filtros en la URL
  useEffect(() => {
    if (!hasInitialized.current && typeof window !== "undefined") {
      hasInitialized.current = true;

      // Verificar si hay filtros en la URL (excluyendo page, limit, sortBy, sortOrder)
      const urlParams = new URLSearchParams(window.location.search);
      const hasFiltersInUrl = Array.from(urlParams.keys()).some(
        (key) => !["page", "limit", "sortBy", "sortOrder"].includes(key) && urlParams.get(key) !== null
      );

      // Si hay filtros en la URL, usar los filtros iniciales
      if (hasFiltersInUrl) {
        setFilters({
          page: initialFilters.page || 1,
          limit: 20,
          sortBy: (initialFilters.sortBy as any) || "created_at",
          sortOrder: (initialFilters.sortOrder as any) || "DESC",
          brand: initialFilters.brand || null,
          model: initialFilters.model || null,
          condition: initialFilters.condition || null,
          transmission: initialFilters.transmission || null,
          fuel_type: initialFilters.fuel_type || null,
          color: initialFilters.color || null,
          segment: initialFilters.segment || null,
          minPrice: initialFilters.minPrice || null,
          maxPrice: initialFilters.maxPrice || null,
          minYear: initialFilters.minYear || null,
          maxYear: initialFilters.maxYear || null,
          minKilometres: initialFilters.minKilometres || null,
          maxKilometres: initialFilters.maxKilometres || null,
          search: initialFilters.search || null,
          currency: initialFilters.currency || null,
        });
      } else {
        // Si no hay filtros, usar valores por defecto
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
  }, [setFilters, initialFilters]);

  const { data: vehiclesData, isLoading } = useVehicles(filters);
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
    currency: filters.currency,
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

  // Usar datos del servidor inicialmente, luego datos del cliente cuando cambien los filtros
  const currentVehicles = vehiclesData?.vehicles || initialVehicles;
  const currentPagination = vehiclesData?.pagination || initialPagination;
  const currentFilterOptions = filterOptions || initialFilterOptions;
  const isInitialLoad = !vehiclesData && !isLoading;

  return (
    <>
      {/* Filtros */}
      {!filtersLoading && currentFilterOptions && (
        <VehicleFilters
          filters={filters}
          filterOptions={currentFilterOptions}
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
                {currentPagination.total || 0}{" "}
                <span className="whitespace-nowrap">
                  {currentPagination.total === 1 ? "Resultado" : "Resultados"}
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
            sortBy={filters.sortBy ?? "created_at"}
            sortOrder={filters.sortOrder ?? "DESC"}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      {/* Grid de vehículos - Renderizar listado inicial en HTML */}
      <VehicleGrid
        vehicles={currentVehicles}
        loading={isLoading && !isInitialLoad}
        viewMode={viewMode}
        currency={displayCurrency}
      />

      {/* Paginación */}
      {currentPagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPagination.page}
          totalPages={currentPagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Mensaje cuando no hay resultados */}
      {!isLoading && currentVehicles.length === 0 && (
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

      {/* Botón flotante de Comparar */}
      <CompareFloatButton />
    </>
  );
}

