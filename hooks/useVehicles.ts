import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Car, CarFilters, FilterOptions } from "@/types/car";

export function useVehicles(filters: CarFilters) {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: {
          vehicles: Car[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
      }>("/api/vehicles", filters);
      
      if (!response.success) {
        throw new Error("Failed to fetch vehicles");
      }
      
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useFilterOptions(filters?: Partial<CarFilters>) {
  return useQuery({
    queryKey: ["filterOptions", filters],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: FilterOptions;
      }>("/api/vehicles/filters/options", filters || {});
      
      if (!response.success) {
        throw new Error("Failed to fetch filter options");
      }
      
      return response.data;
    },
    staleTime: 1000 * 60 * 1, // 1 minuto (conteos dinámicos)
  });
}

export function useVehicle(id: string | number) {
  return useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: Car;
      }>(`/api/vehicles/${id}`);
      
      if (!response.success) {
        throw new Error("Failed to fetch vehicle");
      }
      
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useRelatedVehicles(id: string | number, limit: number = 6) {
  return useQuery({
    queryKey: ["relatedVehicles", id, limit],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: Car[];
      }>(`/api/vehicles/${id}/related`, { limit });
      
      if (!response.success) {
        throw new Error("Failed to fetch related vehicles");
      }
      
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useTopPricedVehicles(currency: "ARS" | "USD", limit: number = 8) {
  return useQuery({
    queryKey: ["topPricedVehicles", currency, limit],
    queryFn: async () => {
      const filters: CarFilters = {
        page: 1,
        limit,
        currency,
        sortBy: "price",
        sortOrder: "DESC",
      };
      
      const response = await api.get<{
        success: boolean;
        data: {
          vehicles: Car[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
      }>("/api/vehicles", filters);
      
      if (!response.success) {
        throw new Error("Failed to fetch top priced vehicles");
      }
      
      return response.data.vehicles;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
