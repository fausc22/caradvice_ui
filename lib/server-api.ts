import { Car } from "@/types/car";
import { api } from "./api";

/**
 * Obtiene un vehículo por ID en el servidor
 * Funciona tanto en modo estático como con API
 */
export async function getVehicle(id: string | number): Promise<Car | null> {
  try {
    // Normalizar el ID a string para la búsqueda
    const vehicleId = String(id);
    
    // Debug: verificar URL del API
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[getVehicle] Buscando vehículo con ID: ${vehicleId}`);
      console.log(`[getVehicle] API URL: ${api.baseUrl}`);
    }
    
    const response = await api.get<{
      success: boolean;
      data: Car;
    }>(`/autos/${vehicleId}`);

    if (!response || !response.success || !response.data) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[getVehicle] Vehículo no encontrado: ${vehicleId}`);
        console.warn(`[getVehicle] Response:`, JSON.stringify(response, null, 2));
      }
      return null;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[getVehicle] Vehículo encontrado: ${response.data.title} (ID: ${response.data.id}, Asofix: ${response.data.asofix_id})`);
    }

    return response.data;
  } catch (error: any) {
    console.error(`[getVehicle] Error al obtener vehículo ${id}:`, error);
    
    // Si es un error de conexión, dar más información
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
      console.error(`[getVehicle] Error de conexión. Verifica que:`);
      console.error(`  - El backend esté corriendo en ${api.baseUrl}`);
      console.error(`  - NEXT_PUBLIC_API_URL esté configurado correctamente`);
      console.error(`  - El backend esté accesible desde el servidor de Next.js`);
    }
    
    // En producción, no mostrar detalles del error
    if (process.env.NODE_ENV !== 'production') {
      console.error('[getVehicle] Error details:', error);
    }
    return null;
  }
}

/**
 * Obtiene vehículos relacionados en el servidor
 */
export async function getRelatedVehicles(
  id: string | number,
  limit: number = 8
): Promise<Car[]> {
  try {
    const response = await api.get<{
      success: boolean;
      data: Car[];
    }>(`/autos/${id}/related`, { limit });

    if (!response.success || !response.data) {
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching related vehicles:", error);
    return [];
  }
}

/**
 * Obtiene vehículos con filtros en el servidor
 */
export async function getVehicles(filters?: {
  page?: number;
  limit?: number;
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
}): Promise<{
  vehicles: Car[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} | null> {
  try {
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
    }>("/autos", filters || {});

    if (!response.success || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return null;
  }
}

/**
 * Obtiene opciones de filtros en el servidor
 */
export async function getFilterOptions(filters?: {
  brand?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minKilometres?: number;
  maxKilometres?: number;
  currency?: "ARS" | "USD";
}): Promise<{
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
} | null> {
  try {
    const response = await api.get<{
      success: boolean;
      data: {
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
    }>("/autos/filters/options", filters || {});

    if (!response.success || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return null;
  }
}

