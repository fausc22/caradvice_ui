const API_URL = 
  typeof window !== "undefined" 
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
    : "http://localhost:3001";

export const api = {
  baseUrl: API_URL,
  
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
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
