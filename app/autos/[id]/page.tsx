import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getVehicle, getRelatedVehicles } from "@/lib/server-api";
import { Car } from "@/types/car";
import VehicleGallery from "@/components/vehicles/VehicleGallery";
import VehicleShareButtons from "@/components/vehicles/VehicleShareButtons";
import VehicleContactForm from "@/components/vehicles/VehicleContactForm";
import WhatsAppLeadButton from "@/components/vehicles/WhatsAppLeadButton";
import RelatedVehiclesCarousel from "@/components/RelatedVehiclesCarousel";
import MetaPixelViewContent from "@/components/MetaPixelViewContent";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ return?: string }>;
}

// Configuración para modo dinámico - siempre usar API
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

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
    // Redondear el precio y quitar decimales .00
    const roundedPrice = Math.round(price);
    const formatted = roundedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
export default async function VehicleDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { return: returnUrl } = await searchParams;
  const vehicle = await getVehicle(id);

  if (!vehicle) {
    notFound();
  }

  const relatedVehicles = await getRelatedVehicles(id, 8);

  const formatPrice = (price: number, currency: "ARS" | "USD") => {
    // Redondear el precio y quitar decimales .00
    const roundedPrice = Math.round(price);
    const formatted = roundedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return currency === "USD" ? `U$${formatted}` : `$${formatted}`;
  };

  const vehicleCurrency = vehicle.price_usd && vehicle.price_usd > 0 ? "USD" : "ARS";
  const vehiclePrice = vehicleCurrency === "USD" ? vehicle.price_usd! : vehicle.price_ars!;

  // Breadcrumbs
  const brand = vehicle.taxonomies?.brand?.[0] || "";
  const model = vehicle.taxonomies?.model?.[0] || "";

  // WhatsApp link
  const vehicleUrl = `https://caradvice.com.ar/autos/${id}`;
  const whatsappMessage = encodeURIComponent(
    `Hola, estoy interesado en el vehículo: ${vehicle.title}\n${vehicleUrl}`
  );
  const whatsappLink = `https://wa.me/5493515158848?text=${whatsappMessage}`;

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
      {/* Meta Pixel: ViewContent con content_id para coincidencia de catálogo */}
      <MetaPixelViewContent vehicleId={id} />

    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Breadcrumbs */}
          <nav className="mb-4 sm:mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-orange-500">
                Inicio
              </Link>
            </li>
            <ChevronRight size={16} className="text-gray-400" />
            <li>
              <Link 
                href={returnUrl || "/autos"} 
                className="hover:text-orange-500 transition-colors"
              >
                Inventario
              </Link>
            </li>
            {brand && (
              <>
                <ChevronRight size={16} className="text-gray-400" />
                <li>
                    <Link
                      href={returnUrl || `/autos?brand=${encodeURIComponent(brand)}`}
                      className="hover:text-orange-500 transition-colors"
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
                      href={returnUrl || `/autos?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`}
                      className="hover:text-orange-500 transition-colors"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Galería de Imágenes */}
          <div className="order-1 lg:order-1">
              <VehicleGallery
                images={vehicle.images || []}
                vehicleTitle={vehicle.title}
              />

            {/* Formulario de Contacto debajo de la galería */}
            <div className="mt-6 lg:block hidden">
              <VehicleContactForm
                vehicleId={id}
                vehicleTitle={vehicle.title}
                vehicleUrl={vehicleUrl}
                vehiclePrice={vehiclePrice}
                vehiclePriceCurrency={vehicleCurrency}
              />
            </div>
          </div>

          {/* Información del Vehículo */}
          <div className="order-2 lg:order-2">
            {/* Título y Precio */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 break-words">
                {vehicle.title}
              </h1>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800">
                {formatPrice(vehiclePrice, vehicleCurrency)}
              </div>
            </div>

            {/* Especificaciones Principales */}
            <div className="bg-gray-100 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">Marca:</span>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">{brand || "N/A"}</p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">Modelo:</span>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">{model || "N/A"}</p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">Año:</span>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">{vehicle.year || "N/A"}</p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">Transmisión:</span>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">
                      {vehicle.taxonomies?.transmission?.[0] || "N/A"}
                    </p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">Kilómetros:</span>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">
                      {vehicle.kilometres
                        ? `${vehicle.kilometres.toLocaleString("es-AR")} Kms`
                        : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">Combustible:</span>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">
                      {vehicle.taxonomies?.fuel_type?.[0] || "N/A"}
                    </p>
                </div>
                {vehicle.license_plate && (
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600">Matrícula:</span>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">{vehicle.license_plate}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">Condición:</span>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">
                      {vehicle.taxonomies?.condition?.[0] || "N/A"}
                    </p>
                  </div>
              </div>
            </div>

            {/* Botón WhatsApp (dispara Lead con content_id para Meta) */}
            <WhatsAppLeadButton
              href={whatsappLink}
              vehicleId={id}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 mb-4 transition-colors text-sm sm:text-base"
            />

            {/* Compartir Publicación */}
              <VehicleShareButtons vehicleTitle={vehicle.title} />

            {/* Formulario de Contacto - Solo visible en móvil, después de los detalles */}
            <div className="mt-6 lg:hidden">
              <VehicleContactForm
                vehicleId={id}
                vehicleTitle={vehicle.title}
                vehicleUrl={vehicleUrl}
                vehiclePrice={vehiclePrice}
                vehiclePriceCurrency={vehicleCurrency}
              />
            </div>
          </div>
        </div>

        {/* Autos Relacionados */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Vehiculos relacionados</h2>
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
                    ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/image?path=${encodeURIComponent(relatedVehicle.featured_image_path)}`
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
