import { Car } from "@/types/car";
import { api } from "./api";

/**
 * Obtiene un vehículo por ID en el servidor
 * Funciona tanto en modo estático como con API
 */
export async function getVehicle(id: string | number): Promise<Car | null> {
  try {
    const response = await api.get<{
      success: boolean;
      data: Car;
    }>(`/api/vehicles/${id}`);

    if (!response.success || !response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching vehicle:", error);
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

