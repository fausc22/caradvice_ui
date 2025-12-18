import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import { getVehicle, getRelatedVehicles } from "@/lib/server-api";
import { Car } from "@/types/car";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import VehicleShareButtons from "@/components/vehicles/VehicleShareButtons";
import RelatedVehiclesCarousel from "@/components/RelatedVehiclesCarousel";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Función para generar metadata dinámica
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicle(id);

  if (!vehicle) {
    return {
      title: "Vehículo no encontrado | CAR ADVICE",
      description: "El vehículo que buscas no está disponible.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const brand = vehicle.taxonomies?.brand?.[0] || "";
  const model = vehicle.taxonomies?.model?.[0] || "";
  const year = vehicle.year || "";
  const kilometres = vehicle.kilometres
    ? `${vehicle.kilometres.toLocaleString("es-AR")} km`
    : "";
  const vehicleCurrency = vehicle.price_usd && vehicle.price_usd > 0 ? "USD" : "ARS";
  const vehiclePrice = vehicleCurrency === "USD" ? vehicle.price_usd! : vehicle.price_ars!;
  
  const formatPrice = (price: number, currency: "ARS" | "USD") => {
    const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return currency === "USD" ? `U$${formatted}` : `$${formatted}`;
  };

  const priceFormatted = formatPrice(vehiclePrice, vehicleCurrency);
  
  // Construir título dinámico
  const title = `${brand} ${model} ${year ? year : ""} - ${priceFormatted} | CAR ADVICE Córdoba`.trim();
  
  // Construir descripción dinámica
  const descriptionParts = [];
  if (brand && model) {
    descriptionParts.push(`${brand} ${model}`);
  }
  if (year) {
    descriptionParts.push(`${year}`);
  }
  if (kilometres) {
    descriptionParts.push(`con ${kilometres}`);
  }
  descriptionParts.push("Disponible en Córdoba.");
  descriptionParts.push("Financiación y toma de usados en CAR ADVICE.");
  
  const description = descriptionParts.join(" ");

  // Obtener imagen principal para Open Graph
  const getImageUrl = (vehicle: Car): string => {
    if (vehicle.featured_image_path?.startsWith("/IMG/static/")) {
      return `https://caradvice.com.ar${vehicle.featured_image_path}`;
    }
    if (vehicle.featured_image_path) {
      return `${process.env.NEXT_PUBLIC_API_URL || "https://caradvice.com.ar"}/api/image?path=${encodeURIComponent(vehicle.featured_image_path)}`;
    }
    if (vehicle.featured_image_url?.startsWith("/IMG/static/")) {
      return `https://caradvice.com.ar${vehicle.featured_image_url}`;
    }
    return vehicle.featured_image_url || "https://caradvice.com.ar/IMG/logo_transparente.png";
  };

  const ogImage = getImageUrl(vehicle);
  const canonicalUrl = `https://caradvice.com.ar/autos/${id}`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "CAR ADVICE",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: vehicle.title,
        },
      ],
      locale: "es_AR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// Componente principal como Server Component
export default async function VehicleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const vehicle = await getVehicle(id);

  if (!vehicle) {
    notFound();
  }

  const relatedVehicles = await getRelatedVehicles(id, 8);

  const formatPrice = (price: number, currency: "ARS" | "USD") => {
    const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return currency === "USD" ? `U$${formatted}` : `$${formatted}`;
  };

  const vehicleCurrency = vehicle.price_usd && vehicle.price_usd > 0 ? "USD" : "ARS";
  const vehiclePrice = vehicleCurrency === "USD" ? vehicle.price_usd! : vehicle.price_ars!;

  // Breadcrumbs
  const brand = vehicle.taxonomies?.brand?.[0] || "";
  const model = vehicle.taxonomies?.model?.[0] || "";

  // WhatsApp link
  const whatsappMessage = encodeURIComponent(
    `Hola, estoy interesado en el vehículo: ${vehicle.title}`
  );
  const whatsappLink = `https://wa.me/543515158848?text=${whatsappMessage}`;

  // Structured Data (Schema.org) - Product
  const getImageUrl = (image?: { file_path?: string; image_url?: string }): string => {
    if (image?.file_path?.startsWith("/IMG/static/")) {
      return `https://caradvice.com.ar${image.file_path}`;
    }
    if (image?.file_path) {
      return `${process.env.NEXT_PUBLIC_API_URL || "https://caradvice.com.ar"}/api/image?path=${encodeURIComponent(image.file_path)}`;
    }
    if (image?.image_url?.startsWith("/IMG/static/")) {
      return `https://caradvice.com.ar${image.image_url}`;
    }
    return image?.image_url || "https://caradvice.com.ar/IMG/logo_transparente.png";
  };

  const productImages = vehicle.images?.map((img) => getImageUrl(img)) || [];
  if (vehicle.featured_image_path || vehicle.featured_image_url) {
    const featuredUrl = getImageUrl({
      file_path: vehicle.featured_image_path,
      image_url: vehicle.featured_image_url,
    });
    if (!productImages.includes(featuredUrl)) {
      productImages.unshift(featuredUrl);
    }
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: vehicle.title,
    image: productImages.length > 0 ? productImages : ["https://caradvice.com.ar/IMG/logo_transparente.png"],
    description: vehicle.content
      ? vehicle.content.replace(/<[^>]*>/g, "").substring(0, 200)
      : `${brand} ${model} ${vehicle.year || ""} disponible en CAR ADVICE Córdoba.`,
    brand: brand
      ? {
          "@type": "Brand",
          name: brand,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      price: vehiclePrice,
      priceCurrency: vehicleCurrency === "USD" ? "USD" : "ARS",
      availability: "https://schema.org/InStock",
      url: `https://caradvice.com.ar/autos/${id}`,
      seller: {
        "@type": "Organization",
        name: "CAR ADVICE",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Córdoba",
          addressRegion: "Córdoba",
          addressCountry: "AR",
        },
      },
    },
    itemCondition: vehicle.taxonomies?.condition?.[0]
      ? `https://schema.org/${vehicle.taxonomies.condition[0] === "Usado" ? "UsedCondition" : "NewCondition"}`
      : undefined,
    additionalProperty: [
      vehicle.year && {
        "@type": "PropertyValue",
        name: "Año",
        value: vehicle.year.toString(),
      },
      vehicle.kilometres && {
        "@type": "PropertyValue",
        name: "Kilómetros",
        value: vehicle.kilometres.toString(),
      },
      vehicle.taxonomies?.transmission?.[0] && {
        "@type": "PropertyValue",
        name: "Transmisión",
        value: vehicle.taxonomies.transmission[0],
      },
      vehicle.taxonomies?.fuel_type?.[0] && {
        "@type": "PropertyValue",
        name: "Combustible",
        value: vehicle.taxonomies.fuel_type[0],
      },
      vehicle.taxonomies?.color?.[0] && {
        "@type": "PropertyValue",
        name: "Color",
        value: vehicle.taxonomies.color[0],
      },
    ].filter(Boolean),
  };

  return (
    <>
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-orange-500">
                Inicio
              </Link>
            </li>
            <ChevronRight size={16} className="text-gray-400" />
            <li>
              <Link href="/autos" className="hover:text-orange-500">
                Inventario
              </Link>
            </li>
            {brand && (
              <>
                <ChevronRight size={16} className="text-gray-400" />
                <li>
                    <Link
                      href={`/autos?brand=${encodeURIComponent(brand)}`}
                      className="hover:text-orange-500"
                    >
                    {brand}
                  </Link>
                </li>
              </>
            )}
            {model && (
              <>
                <ChevronRight size={16} className="text-gray-400" />
                <li>
                    <Link
                      href={`/autos?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`}
                      className="hover:text-orange-500"
                    >
                    {model}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight size={16} className="text-gray-400" />
              <li className="text-gray-800 font-medium" aria-current="page">
                {vehicle.title}
              </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Galería de Imágenes */}
          <div>
              <VehicleGallery
                images={vehicle.images || []}
                vehicleTitle={vehicle.title}
              />

            {/* Descripción debajo de la galería */}
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción</h2>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {vehicle.content ? (
                  <div
                    className="text-gray-700 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: vehicle.content }}
                  />
                ) : (
                    <p className="text-gray-600">
                      No hay descripción disponible para este vehículo.
                    </p>
                )}
                </div>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div>
            {/* Título y Precio */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {vehicle.title}
              </h1>
              <div className="text-4xl md:text-5xl font-bold text-gray-800">
                {formatPrice(vehiclePrice, vehicleCurrency)}
              </div>
            </div>

            {/* Especificaciones Principales */}
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Marca:</span>
                  <p className="font-medium text-gray-800">{brand || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Modelo:</span>
                  <p className="font-medium text-gray-800">{model || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Año:</span>
                  <p className="font-medium text-gray-800">{vehicle.year || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Transmisión:</span>
                    <p className="font-medium text-gray-800">
                      {vehicle.taxonomies?.transmission?.[0] || "N/A"}
                    </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Kilómetros:</span>
                  <p className="font-medium text-gray-800">
                      {vehicle.kilometres
                        ? `${vehicle.kilometres.toLocaleString("es-AR")} Kms`
                        : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Combustible:</span>
                    <p className="font-medium text-gray-800">
                      {vehicle.taxonomies?.fuel_type?.[0] || "N/A"}
                    </p>
                </div>
                {vehicle.license_plate && (
                  <div>
                    <span className="text-sm text-gray-600">Matrícula:</span>
                    <p className="font-medium text-gray-800">{vehicle.license_plate}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Condición:</span>
                    <p className="font-medium text-gray-800">
                      {vehicle.taxonomies?.condition?.[0] || "N/A"}
                    </p>
                  </div>
              </div>
            </div>

            {/* Botón WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 mb-4 transition-colors"
            >
              <MessageCircle size={20} />
              Chat via WhatsApp
            </a>

            {/* Compartir Publicación */}
              <VehicleShareButtons vehicleTitle={vehicle.title} />
          </div>
        </div>

        {/* Sección de Contacto y Admin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Formulario de Contacto */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contacto</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="email"
                  placeholder="Email*"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <textarea
                placeholder="Mensaje*"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="privacy"
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="privacy" className="text-sm text-gray-600">
                  Acepto las{" "}
                  <Link href="/politicas" className="text-orange-500 hover:text-orange-600">
                    políticas de privacidad
                  </Link>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Enviar
              </button>
            </form>
          </div>

          {/* Admin Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin</h3>
            <div className="space-y-4">
              <div>
                <p className="text-orange-500 font-medium mb-2">administrator</p>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📍</span>
                  <span>Córdoba</span>
                </div>
              </div>
              <button className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <span>✆</span>
                <span>543 *** *** mostrar</span>
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={20} />
                Chat via WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Autos Relacionados */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Anuncios relacionados</h2>
          {relatedVehicles && relatedVehicles.length > 0 ? (
            <RelatedVehiclesCarousel
              vehicles={relatedVehicles.map((relatedVehicle) => {
                  const relatedCurrency =
                    relatedVehicle.price_usd && relatedVehicle.price_usd > 0 ? "USD" : "ARS";
                  const relatedPrice =
                    relatedCurrency === "USD"
                      ? relatedVehicle.price_usd!
                      : relatedVehicle.price_ars!;
                
                return {
                  id: String(relatedVehicle.id),
                  title: relatedVehicle.title,
                  price: relatedPrice,
                  price_usd: relatedVehicle.price_usd,
                  price_ars: relatedVehicle.price_ars,
                  year: relatedVehicle.year || 0,
                    condition:
                      relatedVehicle.taxonomies?.condition?.[0] || "N/A",
                  kilometers: relatedVehicle.kilometres,
                    transmission:
                      relatedVehicle.taxonomies?.transmission?.[0] || "N/A",
                  fuel: relatedVehicle.taxonomies?.fuel_type?.[0] || "N/A",
                    image:
                      relatedVehicle.featured_image_path?.startsWith("/IMG/static/")
                    ? relatedVehicle.featured_image_path
                    : relatedVehicle.featured_image_path
                    ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/image?path=${encodeURIComponent(relatedVehicle.featured_image_path)}`
                    : relatedVehicle.featured_image_url?.startsWith("/IMG/static/")
                    ? relatedVehicle.featured_image_url
                    : relatedVehicle.featured_image_url,
                };
              })}
            />
          ) : (
              <p className="text-gray-600">
                No hay vehículos relacionados disponibles.
              </p>
          )}
          </div>
        </div>
      </div>
    </>
  );
}
