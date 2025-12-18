import { Car, FilterOptions } from "@/types/car";

interface StaticData {
  vehicles: Car[];
  filterOptions: FilterOptions;
  metadata: {
    exportedAt: string;
    totalVehicles: number;
  };
}

let cachedStaticData: StaticData | null = null;

/**
 * Carga los datos estáticos desde el archivo JSON
 * Optimizado para carga rápida con caché
 */
export async function loadStaticData(): Promise<StaticData | null> {
  // Retornar caché si existe
  if (cachedStaticData) {
    return cachedStaticData;
  }

  try {
    // En el cliente, cargar desde /static-data/vehicles.json
    if (typeof window !== 'undefined') {
      const response = await fetch('/static-data/vehicles.json', {
        cache: 'force-cache',
        next: { revalidate: false },
      });
      
      if (!response.ok) {
        console.warn('No se pudo cargar vehicles.json desde el cliente');
        return null;
      }
      
      cachedStaticData = await response.json();
      return cachedStaticData;
    } else {
      // Servidor: leer del sistema de archivos
      // En Next.js, durante build/runtime, podemos leer desde public/
      const fs = require('fs');
      const path = require('path');
      
      // Ruta estándar en Next.js: public/ está en la raíz del proyecto
      const filePath = path.join(process.cwd(), 'public', 'static-data', 'vehicles.json');
      
      try {
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          cachedStaticData = JSON.parse(fileContent);
          
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[loadStaticData] Archivo cargado desde: ${filePath}`);
            console.log(`[loadStaticData] Total vehículos: ${cachedStaticData.vehicles.length}`);
          }
          
          return cachedStaticData;
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[loadStaticData] Archivo no encontrado en: ${filePath}`);
            console.warn(`[loadStaticData] process.cwd(): ${process.cwd()}`);
          }
          
          // Intentar rutas alternativas
          const altPaths = [
            path.join(process.cwd(), 'static-data', 'vehicles.json'),
          ];
          
          for (const altPath of altPaths) {
            if (fs.existsSync(altPath)) {
              const fileContent = fs.readFileSync(altPath, 'utf-8');
              cachedStaticData = JSON.parse(fileContent);
              
              if (process.env.NODE_ENV !== 'production') {
                console.log(`[loadStaticData] Archivo cargado desde ruta alternativa: ${altPath}`);
              }
              
              return cachedStaticData;
            }
          }
          
          console.error('[loadStaticData] No se pudo encontrar vehicles.json en ninguna ruta esperada');
          if (process.env.NODE_ENV !== 'production') {
            console.error(`[loadStaticData] Rutas intentadas: ${[filePath, ...altPaths].join(', ')}`);
          }
          return null;
        }
      } catch (readError) {
        console.error('Error al leer vehicles.json:', readError);
        return null;
      }
    }
  } catch (error) {
    console.error('Error loading static data:', error);
    return null;
  }
}

/**
 * Filtra vehículos según los filtros aplicados (simulación de API)
 */
export function filterStaticVehicles(
  vehicles: Car[],
  filters: {
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
    currency?: 'ARS' | 'USD';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }
): { vehicles: Car[]; pagination: { page: number; limit: number; total: number; totalPages: number } } {
  let filtered = [...vehicles];

  // Filtro por búsqueda
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.title.toLowerCase().includes(searchLower) ||
        (v.content && v.content.toLowerCase().includes(searchLower))
    );
  }

  // Filtro por marca
  if (filters.brand) {
    filtered = filtered.filter(
      (v) => v.taxonomies?.brand?.includes(filters.brand!)
    );
  }

  // Filtro por modelo
  if (filters.model) {
    filtered = filtered.filter(
      (v) => v.taxonomies?.model?.includes(filters.model!)
    );
  }

  // Filtro por condición
  if (filters.condition) {
    filtered = filtered.filter(
      (v) => v.taxonomies?.condition?.includes(filters.condition!)
    );
  }

  // Filtro por transmisión
  if (filters.transmission) {
    filtered = filtered.filter(
      (v) => v.taxonomies?.transmission?.includes(filters.transmission!)
    );
  }

  // Filtro por combustible
  if (filters.fuel_type) {
    filtered = filtered.filter(
      (v) => v.taxonomies?.fuel_type?.includes(filters.fuel_type!)
    );
  }

  // Filtro por color
  if (filters.color) {
    filtered = filtered.filter(
      (v) => v.taxonomies?.color?.includes(filters.color!)
    );
  }

  // Filtro por segmento
  if (filters.segment) {
    filtered = filtered.filter(
      (v) => v.taxonomies?.segment?.includes(filters.segment!)
    );
  }

  // Filtro por precio
  if (filters.currency === 'USD' && filters.minPrice !== undefined) {
    filtered = filtered.filter((v) => (v.price_usd || 0) >= filters.minPrice!);
  }
  if (filters.currency === 'USD' && filters.maxPrice !== undefined) {
    filtered = filtered.filter((v) => (v.price_usd || 0) <= filters.maxPrice!);
  }
  if (filters.currency === 'ARS' && filters.minPrice !== undefined) {
    filtered = filtered.filter((v) => (v.price_ars || 0) >= filters.minPrice!);
  }
  if (filters.currency === 'ARS' && filters.maxPrice !== undefined) {
    filtered = filtered.filter((v) => (v.price_ars || 0) <= filters.maxPrice!);
  }

  // Filtro por año
  if (filters.minYear !== undefined) {
    filtered = filtered.filter((v) => (v.year || 0) >= filters.minYear!);
  }
  if (filters.maxYear !== undefined) {
    filtered = filtered.filter((v) => (v.year || 0) <= filters.maxYear!);
  }

  // Filtro por kilómetros
  if (filters.minKilometres !== undefined) {
    filtered = filtered.filter((v) => v.kilometres >= filters.minKilometres!);
  }
  if (filters.maxKilometres !== undefined) {
    filtered = filtered.filter((v) => v.kilometres <= filters.maxKilometres!);
  }

  // Ordenamiento
  const sortBy = filters.sortBy || 'created_at';
  const sortOrder = filters.sortOrder || 'DESC';

  filtered.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'price':
        aValue = filters.currency === 'USD' ? a.price_usd || 0 : a.price_ars || 0;
        bValue = filters.currency === 'USD' ? b.price_usd || 0 : b.price_ars || 0;
        break;
      case 'year':
        aValue = a.year || 0;
        bValue = b.year || 0;
        break;
      case 'kilometres':
        aValue = a.kilometres || 0;
        bValue = b.kilometres || 0;
        break;
      case 'title':
        aValue = a.title || '';
        bValue = b.title || '';
        break;
      default:
        aValue = a.created_at || '';
        bValue = b.created_at || '';
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'ASC'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortOrder === 'ASC' ? aValue - bValue : bValue - aValue;
  });

  // Paginación
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    vehicles: filtered.slice(start, end),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

