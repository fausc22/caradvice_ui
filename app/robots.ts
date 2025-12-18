import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://caradvice.com.ar";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/mantenimiento/",
          // Excluir parámetros de filtros y ordenamiento que generan URLs duplicadas
          "/autos?*sortBy=*",
          "/autos?*sortOrder=*",
          "/autos?*page=*",
          // Permitir filtros importantes (marca, modelo, etc.)
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/mantenimiento/",
          // Google puede indexar filtros, pero no parámetros de paginación/ordenamiento
          "/autos?*page=*",
          "/autos?*sortBy=*",
          "/autos?*sortOrder=*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

