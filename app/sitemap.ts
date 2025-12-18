import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://caradvice.com.ar";

  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/autos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comparar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Páginas dinámicas de vehículos (solo en modo estático)
  let vehiclePages: MetadataRoute.Sitemap = [];

  if (process.env.NEXT_PUBLIC_STATIC_MODE === "true") {
    try {
      const { loadStaticData } = await import("@/lib/static-data");
      const staticData = await loadStaticData();

      if (staticData && staticData.vehicles) {
        vehiclePages = staticData.vehicles.map((vehicle) => ({
          url: `${baseUrl}/autos/${vehicle.id}`,
          lastModified: vehicle.updated_at
            ? new Date(vehicle.updated_at)
            : vehicle.created_at
            ? new Date(vehicle.created_at)
            : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      }
    } catch (error) {
      console.error("[sitemap] Error al cargar vehículos:", error);
    }
  }

  return [...staticPages, ...vehiclePages];
}

