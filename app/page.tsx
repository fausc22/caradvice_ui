import type { Metadata } from "next";
import HeroVideo from "@/components/HeroVideo";
import SearchBar from "@/components/SearchBar";
import VehicleCarousels from "@/components/home/VehicleCarousels";

// Metadata específica de la Home
export async function generateMetadata(): Promise<Metadata> {
  const title = "CAR ADVICE - Concesionaria de autos en Córdoba";
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

        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* CONTENIDO SEO - OCULTO VISUALMENTE PERO PRESENTE EN HTML */}
          <div className="sr-only" aria-hidden="false">
            <h1>Autos Usados y 0km en Córdoba</h1>
            <p>
              Encontrá tu próximo vehículo en CAR ADVICE. Concesionaria especializada en autos
              usados y 0km en Córdoba Capital. Financiación disponible y compra de tu usado.
            </p>
            
            <h2>Encontrá tu próximo auto</h2>
            <p>
              En <strong>CAR ADVICE</strong>, concesionaria de autos en <strong>Córdoba</strong>,
              ofrecemos una amplia selección de <strong>autos usados y 0km</strong> para que
              encuentres el vehículo perfecto. Nuestro equipo te ayuda en cada paso del proceso de
              compra.
            </p>
            <p>
              Además de la <strong>venta de autos</strong>, también <strong>compramos tu usado</strong>{" "}
              y ofrecemos opciones de <strong>financiación</strong> para que puedas adquirir tu
              vehículo de manera accesible. Con 4 sucursales en Córdoba Capital, estamos cerca de
              vos.
            </p>
            
            <h2>Por qué elegir CAR ADVICE</h2>
            <h3>Financiación y compra de usados</h3>
            <p>
              Ofrecemos opciones de <strong>financiación</strong> flexibles para que puedas
              adquirir tu auto en Córdoba. También <strong>compramos tu usado</strong> al mejor
              precio del mercado.
            </p>
            <h3>Catálogo de vehículos disponibles</h3>
            <p>
              Contamos con un amplio catálogo de <strong>autos usados y 0km</strong> en Córdoba.
              Todos nuestros vehículos pasan por una rigurosa inspección antes de la venta.
            </p>
          </div>

          {/* Barra de búsqueda - Directamente después del HeroVideo */}
          <div className="mt-8 sm:mt-12 md:mt-16 mb-12 sm:mb-16 md:mb-20">
            <SearchBar />
          </div>

          {/* Carruseles de vehículos (Client Component) */}
          <VehicleCarousels />
        </section>
      </div>
    </>
  );
}
