"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, X, Search } from "lucide-react";
import { CarFilters, FilterOptions } from "@/types/car";
import { cn } from "@/lib/utils";

interface VehicleFiltersProps {
  filters: CarFilters;
  filterOptions: FilterOptions;
  onFiltersChange: (filters: Partial<CarFilters>) => void;
  onClearFilters: () => void;
  currency: "ARS" | "USD";
  onCurrencyChange: (currency: "ARS" | "USD") => void;
}

export default function VehicleFilters({
  filters,
  filterOptions,
  onFiltersChange,
  onClearFilters,
  currency,
  onCurrencyChange,
}: VehicleFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Sincronizar el estado del switch con el filtro de moneda
  const priceCurrencyFilter = filters.currency || null;
  
  // Estados locales para debounce de los inputs numéricos
  const [localMinPrice, setLocalMinPrice] = useState<string>(filters.minPrice?.toString() || "");
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(filters.maxPrice?.toString() || "");
  const [localMinYear, setLocalMinYear] = useState<string>(filters.minYear?.toString() || "");
  const [localMaxYear, setLocalMaxYear] = useState<string>(filters.maxYear?.toString() || "");
  const [localMinKm, setLocalMinKm] = useState<string>(filters.minKilometres?.toString() || "");
  const [localMaxKm, setLocalMaxKm] = useState<string>(filters.maxKilometres?.toString() || "");
  
  // Ref para evitar loops en los useEffect
  const isInternalUpdate = useRef(false);

  // Sincronizar estados locales cuando cambian los filtros externos (solo si no es un cambio interno)
  useEffect(() => {
    if (!isInternalUpdate.current) {
      setLocalMinPrice(filters.minPrice?.toString() || "");
      setLocalMaxPrice(filters.maxPrice?.toString() || "");
      setLocalMinYear(filters.minYear?.toString() || "");
      setLocalMaxYear(filters.maxYear?.toString() || "");
      setLocalMinKm(filters.minKilometres?.toString() || "");
      setLocalMaxKm(filters.maxKilometres?.toString() || "");
    }
    isInternalUpdate.current = false;
  }, [filters.minPrice, filters.maxPrice, filters.minYear, filters.maxYear, filters.minKilometres, filters.maxKilometres, filters.currency]);

  // Función helper para validar y convertir valores numéricos
  const validateNumericValue = (str: string, allowZero: boolean = false): number | undefined => {
    if (!str.trim()) return undefined;
    const num = Number(str);
    if (isNaN(num) || !isFinite(num)) return undefined;
    if (allowZero && num >= 0) return num;
    if (!allowZero && num > 0) return num;
    return undefined;
  };

  // Debounce para precio mínimo
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = validateNumericValue(localMinPrice, false);
      isInternalUpdate.current = true;
      onFiltersChange({ minPrice: value, page: 1 });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMinPrice]);

  // Debounce para precio máximo
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = validateNumericValue(localMaxPrice, false);
      isInternalUpdate.current = true;
      onFiltersChange({ maxPrice: value, page: 1 });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMaxPrice]);

  // Debounce para año mínimo
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = validateNumericValue(localMinYear, false);
      isInternalUpdate.current = true;
      onFiltersChange({ minYear: value, page: 1 });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMinYear]);

  // Debounce para año máximo
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = validateNumericValue(localMaxYear, false);
      isInternalUpdate.current = true;
      onFiltersChange({ maxYear: value, page: 1 });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMaxYear]);

  // Debounce para kilómetros mínimo (permite 0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = validateNumericValue(localMinKm, true);
      isInternalUpdate.current = true;
      onFiltersChange({ minKilometres: value, page: 1 });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMinKm]);

  // Debounce para kilómetros máximo
  useEffect(() => {
    const timer = setTimeout(() => {
      const value = validateNumericValue(localMaxKm, false);
      isInternalUpdate.current = true;
      onFiltersChange({ maxKilometres: value, page: 1 });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMaxKm]);

  // Validar año (máximo 4 dígitos)
  const validateYear = (value: string): string => {
    if (value === "") return "";
    const num = parseInt(value);
    if (isNaN(num)) return "";
    if (num < 0) return "";
    // Máximo 4 dígitos
    if (num > 9999) return value.slice(0, 4);
    return value;
  };

  const hasActiveFilters = () => {
    return !!(
      filters.condition ||
      filters.brand ||
      filters.model ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minYear ||
      filters.maxYear ||
      filters.minKilometres ||
      filters.maxKilometres ||
      filters.search
    );
  };

  const handleConditionChange = (condition: string) => {
    onFiltersChange({ condition: condition || undefined, page: 1 });
    setOpenDropdown(null);
  };

  const handleBrandChange = (brand: string) => {
    onFiltersChange({ brand: brand || undefined, model: undefined, page: 1 });
    setOpenDropdown(null);
  };

  const handleModelChange = (model: string) => {
    onFiltersChange({ model: model || undefined, page: 1 });
    setOpenDropdown(null);
  };

  // Obtener modelos filtrados por marca
  const availableModels = filters.brand
    ? filterOptions.models
    : [];

  return (
    <div className="font-antenna bg-gray-100 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      {/* Primera fila de filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3 mb-3">
        {/* 0KM/USADOS (Condición) */}
        <div className="relative col-span-1">
          <button
            onClick={() => setOpenDropdown(openDropdown === "condition" ? null : "condition")}
            className={cn(
              "w-full bg-white rounded-full px-4 py-2.5 text-sm font-medium text-gray-700 flex items-center justify-between",
              filters.condition && "ring-2 ring-orange-500"
            )}
          >
            <span className="truncate">{filters.condition || "0KM/USADOS"}</span>
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform",
                openDropdown === "condition" && "rotate-180"
              )}
            />
          </button>
          {openDropdown === "condition" && (
            <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleConditionChange("")}
              >
                Todos
              </div>
              {filterOptions.conditions.map((option) => (
                <div
                  key={option.name}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleConditionChange(option.name)}
                >
                  <span>{option.name}</span>
                  <span className="text-gray-500">({option.count})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Marca */}
        <div className="relative col-span-1">
          <button
            onClick={() => setOpenDropdown(openDropdown === "brand" ? null : "brand")}
            className={cn(
              "w-full bg-white rounded-full px-4 py-2.5 text-sm font-medium text-gray-700 flex items-center justify-between",
              filters.brand && "ring-2 ring-orange-500"
            )}
          >
            <span className="truncate">{filters.brand || "Marca"}</span>
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform",
                openDropdown === "brand" && "rotate-180"
              )}
            />
          </button>
          {openDropdown === "brand" && (
            <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleBrandChange("")}
              >
                Todas
              </div>
              {filterOptions.brands.map((option) => (
                <div
                  key={option.name}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleBrandChange(option.name)}
                >
                  <span>{option.name}</span>
                  <span className="text-gray-500">({option.count})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modelo - Bloqueado hasta seleccionar marca */}
        <div className="relative col-span-1">
          <button
            disabled={!filters.brand}
            onClick={() => filters.brand && setOpenDropdown(openDropdown === "model" ? null : "model")}
            className={cn(
              "w-full bg-white rounded-full px-4 py-2.5 text-sm font-medium flex items-center justify-between",
              filters.brand
                ? filters.model
                  ? "ring-2 ring-orange-500 text-gray-700"
                  : "text-gray-700"
                : "text-gray-400 cursor-not-allowed opacity-50"
            )}
          >
            <span className="truncate">{filters.model || "Modelo"}</span>
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform",
                openDropdown === "model" && "rotate-180"
              )}
            />
          </button>
          {openDropdown === "model" && filters.brand && (
            <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              <div
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleModelChange("")}
              >
                Todos
              </div>
              {availableModels.map((option) => (
                <div
                  key={option.name}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleModelChange(option.name)}
                >
                  <span>{option.name}</span>
                  <span className="text-gray-500">({option.count})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Switch ARS/USD */}
        <div className="flex items-center bg-white rounded-lg border-2 border-gray-200 px-1.5 py-0.5 col-span-1">
          <button
            onClick={() => {
              const newCurrency = priceCurrencyFilter === "ARS" ? undefined : "ARS";
              onFiltersChange({ currency: newCurrency, page: 1 });
              if (newCurrency) {
                onCurrencyChange("ARS");
              }
            }}
            className={cn(
              "px-2 py-1 text-xs font-medium rounded transition-colors",
              priceCurrencyFilter === "ARS" 
                ? "bg-orange-500 text-white" 
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            ARS
          </button>
          <span className="mx-0.5 text-gray-400 text-xs">/</span>
          <button
            onClick={() => {
              const newCurrency = priceCurrencyFilter === "USD" ? undefined : "USD";
              onFiltersChange({ currency: newCurrency, page: 1 });
              if (newCurrency) {
                onCurrencyChange("USD");
              }
            }}
            className={cn(
              "px-2 py-1 text-xs font-medium rounded transition-colors",
              priceCurrencyFilter === "USD" 
                ? "bg-orange-500 text-white" 
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            USD
          </button>
        </div>

        {/* Grupo Precio Min/Max */}
        <div className={cn(
          "flex items-center bg-white rounded-lg border-2 col-span-1",
          (filters.minPrice || filters.maxPrice) 
            ? "border-orange-500" 
            : "border-gray-200"
        )}>
            <div className="flex-1 relative">
              <input
                type="number"
                placeholder="Min $"
                value={localMinPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                    setLocalMinPrice(value);
                  }
                }}
                className={cn(
                  "w-full bg-transparent px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  filters.minPrice 
                    ? "text-orange-500 font-bold" 
                    : "text-gray-500"
                )}
              />
              {filters.minPrice && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocalMinPrice("");
                    onFiltersChange({ minPrice: undefined, page: 1 });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className={cn(
              "w-px h-8",
              (filters.minPrice || filters.maxPrice) ? "bg-orange-500" : "bg-gray-200"
            )} />
            <div className="flex-1 relative">
              <input
                type="number"
                placeholder="Max $"
                value={localMaxPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                    setLocalMaxPrice(value);
                  }
                }}
                className={cn(
                  "w-full bg-transparent px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  filters.maxPrice 
                    ? "text-orange-500 font-bold" 
                    : "text-gray-500"
                )}
              />
              {filters.maxPrice && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocalMaxPrice("");
                    onFiltersChange({ maxPrice: undefined, page: 1 });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
        </div>

        {/* Grupo Año Min/Max - Alineado a la derecha */}
        <div className={cn(
          "flex items-center bg-white rounded-lg border-2 col-span-1",
          (filters.minYear || filters.maxYear) 
            ? "border-orange-500" 
            : "border-gray-200"
        )}>
          <div className="flex-1 relative">
              <input
                type="number"
                placeholder="Min"
                value={localMinYear}
              onChange={(e) => {
                const validated = validateYear(e.target.value);
                setLocalMinYear(validated);
              }}
              maxLength={4}
              className={cn(
                "w-full bg-transparent px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                filters.minYear 
                  ? "text-orange-500 font-bold" 
                  : "text-gray-500"
              )}
            />
            {filters.minYear && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalMinYear("");
                  onFiltersChange({ minYear: undefined, page: 1 });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className={cn(
            "w-px h-8",
            (filters.minYear || filters.maxYear) ? "bg-orange-500" : "bg-gray-200"
          )} />
          <div className="flex-1 relative">
              <input
                type="number"
                placeholder="Max"
                value={localMaxYear}
              onChange={(e) => {
                const validated = validateYear(e.target.value);
                setLocalMaxYear(validated);
              }}
              maxLength={4}
              className={cn(
                "w-full bg-transparent px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                filters.maxYear 
                  ? "text-orange-500 font-bold" 
                  : "text-gray-500"
              )}
            />
            {filters.maxYear && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalMaxYear("");
                  onFiltersChange({ maxYear: undefined, page: 1 });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Segunda fila de filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3 mb-3">
        {/* Grupo Kilómetros Min/Max */}
        <div className={cn(
          "flex items-center bg-white rounded-lg border-2 col-span-1",
          (filters.minKilometres || filters.maxKilometres) 
            ? "border-orange-500" 
            : "border-gray-200"
        )}>
          <div className="flex-1 relative">
              <input
                type="number"
                placeholder="Min Km"
                value={localMinKm}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                  setLocalMinKm(value);
                }
              }}
              className={cn(
                "w-full bg-transparent px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                filters.minKilometres 
                  ? "text-orange-500 font-bold" 
                  : "text-gray-500"
              )}
            />
            {filters.minKilometres && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalMinKm("");
                  onFiltersChange({ minKilometres: undefined, page: 1 });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className={cn(
            "w-px h-8",
            (filters.minKilometres || filters.maxKilometres) ? "bg-orange-500" : "bg-gray-200"
          )} />
          <div className="flex-1 relative">
              <input
                type="number"
                placeholder="Max Km"
                value={localMaxKm}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                  setLocalMaxKm(value);
                }
              }}
              className={cn(
                "w-full bg-transparent px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                filters.maxKilometres 
                  ? "text-orange-500 font-bold" 
                  : "text-gray-500"
              )}
            />
            {filters.maxKilometres && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLocalMaxKm("");
                  onFiltersChange({ maxKilometres: undefined, page: 1 });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Espacio vacío para mantener el grid */}
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
        {/* Barra de búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Inserte palabra clave"
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ search: e.target.value || undefined, page: 1 })}
            className="w-full bg-white rounded-full pl-10 pr-10 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ search: undefined, page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Botón LIMPIAR FILTROS - Siempre habilitado */}
        <button
          onClick={onClearFilters}
          className={cn(
            "bg-white rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap border border-gray-200 transition-colors",
            hasActiveFilters()
              ? "text-gray-700 hover:bg-gray-50 hover:border-orange-500"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          LIMPIAR FILTROS
        </button>
      </div>

      {/* Cerrar dropdowns al hacer click fuera */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}
