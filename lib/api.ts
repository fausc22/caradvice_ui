const API_URL = 
  typeof window !== "undefined" 
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
    : "http://localhost:3001";

// Verificar si el modo estático está activado
const isStaticMode = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';

export const api = {
  baseUrl: API_URL,
  isStaticMode,
  
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // Si está en modo estático, usar datos locales
    if (isStaticMode) {
      const { loadStaticData, filterStaticVehicles } = await import('./static-data');
      const staticData = await loadStaticData();
      
      if (!staticData) {
        throw new Error('Static data not available');
      }

      // Manejar diferentes endpoints
      if (endpoint === '/api/vehicles') {
        const filtered = filterStaticVehicles(staticData.vehicles, params || {});
        return {
          success: true,
          data: filtered,
        } as T;
      }

      if (endpoint.startsWith('/api/vehicles/') && endpoint !== '/api/vehicles/filters/options') {
        const id = endpoint.split('/').pop();
        const vehicle = staticData.vehicles.find((v) => v.id.toString() === id || v.asofix_id === id);
        
        if (!vehicle) {
          throw new Error('Vehicle not found');
        }

        return {
          success: true,
          data: vehicle,
        } as T;
      }

      if (endpoint === '/api/vehicles/filters/options') {
        return {
          success: true,
          data: staticData.filterOptions,
        } as T;
      }

      if (endpoint.includes('/related')) {
        const id = endpoint.split('/')[2];
        const vehicle = staticData.vehicles.find((v) => v.id.toString() === id || v.asofix_id === id);
        
        if (!vehicle) {
          return {
            success: true,
            data: [],
          } as T;
        }

        // Obtener vehículos relacionados (misma marca o modelo)
        const related = staticData.vehicles
          .filter((v) => v.id !== vehicle.id)
          .filter((v) => {
            const sameBrand = vehicle.taxonomies?.brand?.[0] && 
              v.taxonomies?.brand?.includes(vehicle.taxonomies.brand[0]);
            const sameModel = vehicle.taxonomies?.model?.[0] && 
              v.taxonomies?.model?.includes(vehicle.taxonomies.model[0]);
            return sameBrand || sameModel;
          })
          .slice(0, params?.limit || 8);

        return {
          success: true,
          data: related,
        } as T;
      }
    }

    // Modo normal: llamar a la API
    const url = new URL(`${API_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Filtrar valores inválidos: undefined, null, "", NaN, Infinity
        if (value !== undefined && value !== null && value !== "") {
          // Validar números: rechazar NaN e Infinity
          if (typeof value === 'number') {
            if (isNaN(value) || !isFinite(value)) {
              return; // No agregar este parámetro
            }
          }
          // Convertir a string y validar que no sea "NaN", "null", "undefined", "Infinity"
          const stringValue = String(value);
          if (stringValue !== "NaN" && stringValue !== "null" && stringValue !== "undefined" && stringValue !== "Infinity") {
            url.searchParams.append(key, stringValue);
          }
        }
      });
    }
    
    const response = await fetch(url.toString(), {
      cache: "no-store",
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
    }
    
    return response.json();
  },
};
