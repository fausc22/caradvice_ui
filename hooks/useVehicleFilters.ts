import { useQueryStates, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs";
import { CarFilters } from "@/types/car";

export function useVehicleFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(20),
      brand: parseAsString,
      model: parseAsString,
      condition: parseAsString,
      transmission: parseAsString,
      fuel_type: parseAsString,
      color: parseAsString,
      segment: parseAsString,
      minPrice: parseAsInteger,
      maxPrice: parseAsInteger,
      minYear: parseAsInteger,
      maxYear: parseAsInteger,
      minKilometres: parseAsInteger,
      maxKilometres: parseAsInteger,
      search: parseAsString,
      sortBy: parseAsStringEnum(["created_at", "price", "year", "kilometres", "title"]).withDefault("created_at"),
      sortOrder: parseAsStringEnum(["ASC", "DESC"]).withDefault("DESC"),
      currency: parseAsStringEnum(["ARS", "USD"]),
    },
    {
      history: "push",
      shallow: false,
    }
  );

  const updateFilters = (newFilters: Partial<CarFilters>) => {
    setFilters((prev) => {
      const updated = {
        ...prev,
        ...newFilters,
      };
      // Si cambian filtros (no solo la página), resetear a página 1
      if (newFilters.page === undefined && Object.keys(newFilters).some(key => key !== 'page')) {
        updated.page = 1;
      }
      return updated;
    });
  };

  const clearFilters = () => {
    // Resetear solo los parámetros esenciales, sin aplicar filtros por defecto
    setFilters({
      page: 1,
      limit: 20,
      sortBy: "created_at",
      sortOrder: "DESC",
      // No establecer currency: null explícitamente, dejar que se elimine de la URL
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
    });
  };

  // Función helper para validar números y eliminar valores inválidos
  const validateNumber = (value: number | null | undefined): number | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number' && !isNaN(value) && isFinite(value) && value > 0) {
      return value;
    }
    return undefined;
  };

  // Función helper para validar números que pueden ser 0 (como minKilometres)
  const validateNumberWithZero = (value: number | null | undefined): number | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number' && !isNaN(value) && isFinite(value) && value >= 0) {
      return value;
    }
    return undefined;
  };

  // Convertir los filtros a CarFilters con validación y limpieza de valores inválidos
  const carFilters: CarFilters = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    brand: filters.brand || undefined,
    model: filters.model || undefined,
    condition: filters.condition || undefined,
    transmission: filters.transmission || undefined,
    fuel_type: filters.fuel_type || undefined,
    color: filters.color || undefined,
    segment: filters.segment || undefined,
    minPrice: validateNumber(filters.minPrice),
    maxPrice: validateNumber(filters.maxPrice),
    minYear: validateNumber(filters.minYear),
    maxYear: validateNumber(filters.maxYear),
    minKilometres: validateNumberWithZero(filters.minKilometres),
    maxKilometres: validateNumber(filters.maxKilometres),
    search: filters.search || undefined,
    sortBy: filters.sortBy || "created_at",
    sortOrder: filters.sortOrder || "DESC",
    currency: filters.currency || undefined,
  };

  return {
    filters: carFilters,
    updateFilters,
    clearFilters,
    setFilters, // Exportar setFilters para uso en casos especiales
  };
}
