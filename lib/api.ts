// Obtener la URL del API
// En el cliente, usar NEXT_PUBLIC_API_URL
// En el servidor, intentar usar NEXT_PUBLIC_API_URL primero, luego localhost
// NOTA: En producción, NEXT_PUBLIC_API_URL debe apuntar a la URL pública del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window === "undefined" 
    ? "http://localhost:4000"  // Servidor: localhost por defecto
    : "http://localhost:4000"); // Cliente: localhost por defecto

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
      if (endpoint === '/autos' || endpoint === '/api/vehicles') {
        const filtered = filterStaticVehicles(staticData.vehicles, params || {});
        return {
          success: true,
          data: filtered,
        } as T;
      }

      if ((endpoint.startsWith('/autos/') || endpoint.startsWith('/api/vehicles/')) && endpoint !== '/autos/filters/options' && endpoint !== '/api/vehicles/filters/options' && !endpoint.includes('/related')) {
        const id = endpoint.split('/').pop()?.split('?')[0]; // Remover query params si existen
        if (!id) {
          throw new Error('Invalid vehicle ID');
        }
        
        // Debug en desarrollo
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[API] Buscando vehículo con ID: ${id}, Total vehículos: ${staticData.vehicles.length}`);
        }
        
        // Buscar por id numérico o string, y también por asofix_id
        const vehicle = staticData.vehicles.find((v) => {
          const vehicleIdStr = v.id.toString();
          const vehicleAsofixId = v.asofix_id?.toString();
          const matches = vehicleIdStr === id || vehicleAsofixId === id || v.id === Number(id);
          
          if (process.env.NODE_ENV !== 'production' && matches) {
            console.log(`[API] Vehículo encontrado: ${v.title} (ID: ${v.id}, Asofix: ${v.asofix_id})`);
          }
          
          return matches;
        });
        
        if (!vehicle) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[API] Vehículo no encontrado. IDs disponibles (primeros 5):`, 
              staticData.vehicles.slice(0, 5).map(v => ({ id: v.id, asofix_id: v.asofix_id }))
            );
          }
          throw new Error(`Vehicle not found: ${id}`);
        }

        return {
          success: true,
          data: vehicle,
        } as T;
      }

      if (endpoint === '/autos/filters/options' || endpoint === '/api/vehicles/filters/options') {
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
    // Mapear endpoints antiguos a nuevos
    let apiEndpoint = endpoint;
    if (endpoint === '/api/vehicles') {
      apiEndpoint = '/autos';
    } else if (endpoint.startsWith('/api/vehicles/')) {
      // Reemplazar /api/vehicles/ por /autos/
      // Manejar casos especiales primero
      if (endpoint.includes('/filters/options')) {
        apiEndpoint = '/autos/filters/options';
      } else if (endpoint.includes('/related')) {
        // Mantener la estructura /autos/:id/related
        const id = endpoint.split('/')[2];
        apiEndpoint = `/autos/${id}/related`;
      } else {
        apiEndpoint = endpoint.replace('/api/vehicles/', '/autos/');
      }
    } else if (endpoint === '/api/vehicles/filters/options') {
      apiEndpoint = '/autos/filters/options';
    }
    
    const url = new URL(`${API_URL}${apiEndpoint}`);
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
    
    try {
      // Crear un AbortController para timeout manual (AbortSignal.timeout puede no estar disponible en todos los entornos)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      
      const response = await fetch(url.toString(), {
        cache: "no-store",
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
      }
      
      return response.json();
    } catch (error: any) {
      // Si es un error de conexión o timeout, loguear y relanzar con más contexto
      if (error.name === 'AbortError' || error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
        const errorMsg = `No se pudo conectar al backend en ${API_URL}${apiEndpoint}. Verifica que el backend esté corriendo y que NEXT_PUBLIC_API_URL esté configurado correctamente.`;
        console.error(`[API] ${errorMsg}`);
        console.error(`[API] URL intentada: ${url.toString()}`);
        console.error(`[API] Error original:`, error);
        throw new Error(errorMsg);
      }
      throw error;
    }
  },
};
