import type { Metadata } from "next";
import HeroVideo from "@/components/HeroVideo";
import SearchBar from "@/components/SearchBar";
import VehicleCarousels from "@/components/home/VehicleCarousels";
import Link from "next/link";

// Metadata específica de la Home
export async function generateMetadata(): Promise<Metadata> {
  const title = "Autos Usados y 0km en Córdoba | CAR ADVICE – Concesionaria";
  const description =
    "Encontrá autos usados y 0km en Córdoba en CAR ADVICE. Financiación, compra de usados y atención personalizada. Conocé nuestro catálogo.";

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
      url: "https://caradvice.com.ar/",
      siteName: "CAR ADVICE",
      title,
      description,
      images: [
        {
          url: "https://caradvice.com.ar/IMG/logo_transparente.png",
          width: 1200,
          height: 630,
          alt: "CAR ADVICE - Concesionaria de Autos Córdoba",
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
      canonical: "https://caradvice.com.ar/",
    },
  };
}

// Structured Data - LocalBusiness / AutoDealer
const structuredData = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: "CAR ADVICE",
  url: "https://caradvice.com.ar",
  logo: "https://caradvice.com.ar/IMG/logo_transparente.png",
  description:
    "Concesionaria de autos usados y 0km en Córdoba. Compramos tu usado, vendemos tu auto por vos, financiamos tu auto.",
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: "Octavio Pinto 3024",
      addressLocality: "Córdoba",
      addressRegion: "Córdoba",
      postalCode: "X5009",
      addressCountry: "AR",
      name: "CAR ADVICE | Casa Central",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Bv. Los Granaderos 3110",
      addressLocality: "Córdoba",
      addressRegion: "Córdoba",
      postalCode: "X5009",
      addressCountry: "AR",
      name: "CAR ADVICE | Suc. Granaderos",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Av. Emilio Caraffa 2883",
      addressLocality: "Córdoba",
      addressRegion: "Córdoba",
      postalCode: "X5009",
      addressCountry: "AR",
      name: "CAR ADVICE | Suc. Caraffa",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Octavio Pinto 3169",
      addressLocality: "Córdoba",
      addressRegion: "Córdoba",
      postalCode: "X5009",
      addressCountry: "AR",
      name: "CAR ADVICE | Alistaje y Postventa",
    },
  ],
  areaServed: {
    "@type": "City",
    name: "Córdoba",
    "@id": "https://www.wikidata.org/wiki/Q44210",
  },
  telephone: "+543515158848",
  email: "consultas@caradvice.com.ar",
  priceRange: "$$",
  paymentAccepted: "Cash, Credit Card, Financing",
  currenciesAccepted: "ARS, USD",
  sameAs: [
    "https://www.instagram.com/caradvicearg/",
    // Agregar otras redes sociales cuando estén disponibles
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "13:00",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Catálogo de Autos Usados y 0km",
    itemListElement: {
      "@type": "ItemList",
      itemListElement: {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Product",
          name: "Autos Usados",
          url: "https://caradvice.com.ar/autos",
        },
      },
    },
  },
};

export default function Home() {
  return (
    <>
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div>
        <HeroVideo />

        <section className="container mx-auto px-4 py-8">
          {/* H1 visible y semántico */}
          <div className="text-center mb-8 sm:mb-12 px-4 mt-8">
            <h1 className="font-antenna text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              Autos Usados y 0km en Córdoba
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Encontrá tu próximo vehículo en CAR ADVICE. Concesionaria especializada en autos
              usados y 0km en Córdoba Capital. Financiación disponible y compra de tu usado.
            </p>
          </div>

          {/* Barra de búsqueda */}
          <SearchBar />

          {/* Contenido SEO visible - Sección de servicios */}
          <div className="mt-12 mb-8 sm:mb-12 px-4">
            <h2 className="font-antenna text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
              Encontrá tu próximo auto
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4">
                En <strong>CAR ADVICE</strong>, concesionaria de autos en <strong>Córdoba</strong>,
                ofrecemos una amplia selección de <strong>autos usados y 0km</strong> para que
                encuentres el vehículo perfecto. Nuestro equipo te ayuda en cada paso del proceso de
                compra.
              </p>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4">
                Además de la <strong>venta de autos</strong>, también <strong>compramos tu usado</strong>{" "}
                y ofrecemos opciones de <strong>financiación</strong> para que puedas adquirir tu
                vehículo de manera accesible. Con 4 sucursales en Córdoba Capital, estamos cerca de
                vos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Link
                  href="/autos"
                  className="font-antenna inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-center"
                >
                  Ver catálogo completo
                </Link>
                <Link
                  href="/contacto"
                  className="font-antenna inline-block bg-gray-800 hover:bg-gray-900 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-center"
                >
                  Contactanos
                </Link>
              </div>
            </div>
          </div>

          {/* Carruseles de vehículos (Client Component) */}
          <VehicleCarousels />

          {/* Sección adicional de contenido SEO */}
          <div className="mt-16 mb-8 sm:mb-12 px-4">
            <h2 className="font-antenna text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
              Por qué elegir CAR ADVICE
            </h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-antenna text-xl font-bold text-gray-800 mb-3">
                  Financiación y compra de usados
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Ofrecemos opciones de <strong>financiación</strong> flexibles para que puedas
                  adquirir tu auto en Córdoba. También <strong>compramos tu usado</strong> al mejor
                  precio del mercado.
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-antenna text-xl font-bold text-gray-800 mb-3">
                  Catálogo de vehículos disponibles
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Contamos con un amplio catálogo de <strong>autos usados y 0km</strong> en Córdoba.
                  Todos nuestros vehículos pasan por una rigurosa inspección antes de la venta.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
