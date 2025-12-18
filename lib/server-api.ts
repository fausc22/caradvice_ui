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
    
    // Debug: verificar modo estático
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[getVehicle] Buscando vehículo con ID: ${vehicleId}, Modo estático: ${api.isStaticMode}`);
    }
    
    const response = await api.get<{
      success: boolean;
      data: Car;
    }>(`/api/vehicles/${vehicleId}`);

    if (!response || !response.success || !response.data) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[getVehicle] Vehículo no encontrado: ${vehicleId}`);
      }
      return null;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[getVehicle] Vehículo encontrado: ${response.data.title}`);
    }

    return response.data;
  } catch (error) {
    console.error(`[getVehicle] Error al obtener vehículo ${id}:`, error);
    // En producción, no mostrar detalles del error
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error details:', error);
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
    }>(`/api/vehicles/${id}/related`, { limit });

    if (!response.success || !response.data) {
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching related vehicles:", error);
    return [];
  }
}

