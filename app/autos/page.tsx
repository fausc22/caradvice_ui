import type { Metadata } from "next";
import { Suspense } from "react";
import HeroVideo from "@/components/HeroVideo";
import WhatsAppButton from "@/components/WhatsAppButton";
import AutosPageClient from "@/components/autos/AutosPageClient";
import InitialVehicleList from "@/components/autos/InitialVehicleList";
import { getVehicles, getFilterOptions } from "@/lib/server-api";
import { Loader2 } from "lucide-react";
import { CarFilters } from "@/types/car";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    brand?: string;
    model?: string;
    condition?: string;
    transmission?: string;
    fuel_type?: string;
    color?: string;
    segment?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
    minKilometres?: string;
    maxKilometres?: string;
    search?: string;
    currency?: "ARS" | "USD";
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }>;
}

// Metadata dinámica según filtros
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const brand = params.brand;
  const model = params.model;

  let title: string;
  let description: string;

  if (brand && model) {
    title = `${brand} ${model} Usados en Córdoba | CAR ADVICE`;
    description = `Encontrá autos ${brand} ${model} usados en Córdoba. Catálogo actualizado con financiación disponible.`;
  } else if (brand) {
    title = `Autos ${brand} Usados en Córdoba | CAR ADVICE`;
    description = `Encontrá autos ${brand} usados en Córdoba. Catálogo actualizado con financiación disponible.`;
  } else {
    title = "Catálogo de Autos Usados en Córdoba | CAR ADVICE";
    description =
      "Explorá nuestro catálogo de autos usados y 0km en Córdoba. Financiación disponible y compra de usados.";
  }

  // Canonical: siempre apuntar a /autos sin parámetros para evitar duplicados
  const canonical = "https://caradvice.com.ar/autos";

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url: canonical,
      siteName: "CAR ADVICE",
      title,
      description,
      images: [
        {
          url: "https://caradvice.com.ar/IMG/logo_transparente.png",
          width: 1200,
          height: 630,
          alt: "CAR ADVICE - Catálogo de Autos Córdoba",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://caradvice.com.ar/IMG/logo_transparente.png"],
    },
    alternates: {
      canonical,
    },
  };
}

// Componente principal como Server Component
export default async function AutosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Convertir searchParams a CarFilters
  const filters: CarFilters = {
    page: params.page ? parseInt(params.page) : 1,
    limit: 20,
    brand: params.brand || undefined,
    model: params.model || undefined,
    condition: params.condition || undefined,
    transmission: params.transmission || undefined,
    fuel_type: params.fuel_type || undefined,
    color: params.color || undefined,
    segment: params.segment || undefined,
    minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
    minYear: params.minYear ? parseInt(params.minYear) : undefined,
    maxYear: params.maxYear ? parseInt(params.maxYear) : undefined,
    minKilometres: params.minKilometres ? parseInt(params.minKilometres) : undefined,
    maxKilometres: params.maxKilometres ? parseInt(params.maxKilometres) : undefined,
    search: params.search || undefined,
    currency: params.currency || undefined,
    sortBy: (params.sortBy as any) || "created_at",
    sortOrder: (params.sortOrder as any) || "DESC",
  };

  // Obtener datos iniciales en el servidor
  const [vehiclesData, filterOptions] = await Promise.all([
    getVehicles(filters),
    getFilterOptions({
      brand: filters.brand,
      condition: filters.condition,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minYear: filters.minYear,
      maxYear: filters.maxYear,
      minKilometres: filters.minKilometres,
      maxKilometres: filters.maxKilometres,
      currency: filters.currency,
    }),
  ]);

  // Valores por defecto si no hay datos
  const initialVehicles = vehiclesData?.vehicles || [];
  const initialPagination = vehiclesData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };
  const initialFilterOptions = filterOptions || {
    conditions: [],
    brands: [],
    models: [],
    ranges: {},
  };

  return (
    <div className="font-antenna min-h-screen bg-gray-50">
      {/* Video y Botones Hero */}
      <HeroVideo />

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* H1 único para SEO (oculto visualmente) */}
        <h1 className="sr-only">Catálogo de Autos Usados en Córdoba</h1>

        {/* Listado inicial indexable en HTML (oculto visualmente) */}
        <InitialVehicleList vehicles={initialVehicles} />

        {/* Componente Client para interactividad */}
        <Suspense
          fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
          }
        >
          <AutosPageClient
            initialVehicles={initialVehicles}
            initialPagination={initialPagination}
            initialFilterOptions={initialFilterOptions}
            initialFilters={filters}
          />
        </Suspense>
      </div>

      {/* Botón flotante de WhatsApp */}
      <WhatsAppButton />
    </div>
  );
}
