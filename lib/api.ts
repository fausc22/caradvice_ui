// Obtener la URL del API
// En el cliente, usar NEXT_PUBLIC_API_URL
// En el servidor, intentar usar NEXT_PUBLIC_API_URL primero, luego localhost
// NOTA: En producción, NEXT_PUBLIC_API_URL debe apuntar a la URL pública del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window === "undefined" 
    ? "http://localhost:4000"  // Servidor: localhost por defecto
    : "http://localhost:4000"); // Cliente: localhost por defecto

export const api = {
  baseUrl: API_URL,
  isStaticMode: false, // Siempre false, modo estático eliminado
  
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // Siempre usar la API
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
      // Crear un AbortController para timeout manual
      // Timeout más corto para evitar esperas largas en Vercel (5 segundos)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos
      
      const response = await fetch(url.toString(), {
        cache: "no-store",
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
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
