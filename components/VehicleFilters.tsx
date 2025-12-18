"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { CarFilters, FilterOptions } from "@/types/car";

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
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters = () => {
    return !!(
      filters.brand ||
      filters.model ||
      filters.condition ||
      filters.transmission ||
      filters.fuel_type ||
      filters.color ||
      filters.segment ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minYear ||
      filters.maxYear ||
      filters.minKilometres ||
      filters.maxKilometres ||
      filters.search
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Búsqueda */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Inserte palabra clave"
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => onFiltersChange({ search: "" })}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Filtros principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        {/* Condición */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condición
          </label>
          <select
            value={filters.condition || ""}
            onChange={(e) =>
              onFiltersChange({ condition: e.target.value || undefined })
            }
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todas</option>
            {filterOptions.conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo/Segmento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={filters.segment || ""}
            onChange={(e) =>
              onFiltersChange({ segment: e.target.value || undefined })
            }
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todos</option>
            {filterOptions.segments.map((segment) => (
              <option key={segment} value={segment}>
                {segment}
              </option>
            ))}
          </select>
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca
          </label>
          <select
            value={filters.brand || ""}
            onChange={(e) =>
              onFiltersChange({ brand: e.target.value || undefined })
            }
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todas</option>
            {filterOptions.brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo
          </label>
          <select
            value={filters.model || ""}
            onChange={(e) =>
              onFiltersChange({ model: e.target.value || undefined })
            }
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todos</option>
            {filterOptions.models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Min Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Precio
          </label>
          <input
            type="number"
            placeholder="Mínimo"
            value={filters.minPrice || ""}
            onChange={(e) =>
              onFiltersChange({
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Max Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Precio
          </label>
          <input
            type="number"
            placeholder="Máximo"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              onFiltersChange({
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Filtros adicionales (colapsables) */}
      {showMoreFilters && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 pt-4 border-t">
          {/* Min Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Año
            </label>
            <input
              type="number"
              placeholder="Mínimo"
              value={filters.minYear || ""}
              onChange={(e) =>
                onFiltersChange({
                  minYear: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Max Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Año
            </label>
            <input
              type="number"
              placeholder="Máximo"
              value={filters.maxYear || ""}
              onChange={(e) =>
                onFiltersChange({
                  maxYear: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Transmisión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transmisión
            </label>
            <select
              value={filters.transmission || ""}
              onChange={(e) =>
                onFiltersChange({ transmission: e.target.value || undefined })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas</option>
              {filterOptions.transmissions.map((transmission) => (
                <option key={transmission} value={transmission}>
                  {transmission}
                </option>
              ))}
            </select>
          </div>

          {/* Combustible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Combustible
            </label>
            <select
              value={filters.fuel_type || ""}
              onChange={(e) =>
                onFiltersChange({ fuel_type: e.target.value || undefined })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos</option>
              {filterOptions.fuelTypes.map((fuelType) => (
                <option key={fuelType} value={fuelType}>
                  {fuelType}
                </option>
              ))}
            </select>
          </div>

          {/* Min Kilómetros */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Kilómetro
            </label>
            <input
              type="number"
              placeholder="Mínimo"
              value={filters.minKilometres || ""}
              onChange={(e) =>
                onFiltersChange({
                  minKilometres: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Max Kilómetros */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Kilómetro
            </label>
            <input
              type="number"
              placeholder="Máximo"
              value={filters.maxKilometres || ""}
              onChange={(e) =>
                onFiltersChange({
                  maxKilometres: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <select
              value={filters.color || ""}
              onChange={(e) =>
                onFiltersChange({ color: e.target.value || undefined })
              }
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos</option>
              {filterOptions.colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            {showMoreFilters ? "Menos filtros" : "Más filtros"}
            <ChevronDown
              size={16}
              className={`transition-transform ${
                showMoreFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {hasActiveFilters() && (
            <button
              onClick={onClearFilters}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Borrar todo
            </button>
          )}
        </div>

        {/* Selector de moneda */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Moneda:</label>
          <select
            value={currency}
            onChange={(e) => {
              const newCurrency = e.target.value as "ARS" | "USD";
              onCurrencyChange(newCurrency);
              onFiltersChange({ currency: newCurrency });
            }}
            className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
    </div>
  );
}
