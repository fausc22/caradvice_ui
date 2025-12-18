import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactForm from "@/components/contacto/ContactForm";
import {
  AnimatedContact,
  AnimatedImage,
  AnimatedLink,
} from "@/components/contacto/AnimatedContact";

const sucursales = [
  {
    name: "CAR ADVICE | Casa Central",
    address: "Octavio Pinto 3024, Córdoba",
    map: `https://www.google.com/maps?q=${encodeURIComponent("Octavio Pinto 3024, Córdoba, Argentina")}&output=embed`,
    googleMapsUrl: "https://share.google/Z4OqenVjQoIF7wPGP",
    icon: "🏢",
    image: "/IMG/contacto/octavio_pinto.jpeg",
  },
  {
    name: "CAR ADVICE | Suc. Granaderos",
    address: "Bv. Los Granaderos 3110, X5009 Córdoba",
    map: `https://www.google.com/maps?q=${encodeURIComponent("Bv. Los Granaderos 3110, X5009 Córdoba, Argentina")}&output=embed`,
    googleMapsUrl: "https://share.google/QsggnorrlPRRIB1VR",
    icon: "🚗",
    image: "/IMG/contacto/granaderos.jpeg",
  },
  {
    name: "CAR ADVICE | Suc. Caraffa",
    address: "Av. Emilio Caraffa 2883, X5009 Córdoba",
    map: `https://www.google.com/maps?q=${encodeURIComponent("Av. Emilio Caraffa 2883, X5009 Córdoba, Argentina")}&output=embed`,
    googleMapsUrl: "https://share.google/Nxz0ZmIWATXnwfxhP",
    icon: "🏪",
    image: "/IMG/contacto/caraffa.jpeg",
  },
  {
    name: "CAR ADVICE | Alistaje y Postventa",
    address: "Octavio Pinto 3169, X5009 Córdoba",
    map: `https://www.google.com/maps?q=${encodeURIComponent("Octavio Pinto 3169, X5009 Córdoba, Argentina")}&output=embed`,
    googleMapsUrl: "https://share.google/HU1SMP4DvBeiwqd9Q",
    icon: "🔧",
    image: "/IMG/contacto/posventa.jpeg",
  },
];

// Metadata específica de la página
export async function generateMetadata(): Promise<Metadata> {
  const title = "Contacto CAR ADVICE | Concesionaria de Autos en Córdoba";
  const description =
    "Contactá con CAR ADVICE en Córdoba. 4 sucursales, horarios de atención y múltiples formas de contacto. Estamos para ayudarte.";

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
      url: "https://caradvice.com.ar/contacto",
      siteName: "CAR ADVICE",
      title,
      description,
      images: [
        {
          url: "https://caradvice.com.ar/IMG/logo_transparente.png",
          width: 1200,
          height: 630,
          alt: "CAR ADVICE - Contacto",
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
      canonical: "https://caradvice.com.ar/contacto",
    },
  };
}

// Structured Data - ContactPage + LocalBusiness
const structuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  mainEntity: {
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
    sameAs: ["https://www.instagram.com/caradvicearg/"],
  },
};

export default function Contacto() {
  return (
    <>
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="font-antenna bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/IMG/contacto/Granaderos-8.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Overlay oscuro para mejorar legibilidad */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <AnimatedContact
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                Sucursales
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto px-4">
                ¡Visitanos hoy mismo y descubrí por qué somos la mejor opción para
                satisfacer tus necesidades automotrices!
              </p>
            </AnimatedContact>
          </div>
        </section>

        {/* Sucursales Grid */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <div className="space-y-10 sm:space-y-12 max-w-7xl mx-auto">
            {sucursales.map((sucursal, index) => (
              <AnimatedContact
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Título de la sucursal */}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 px-2">
                  {sucursal.name} | {sucursal.address}
                </h3>

                {/* Dos recuadros: Foto y Mapa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Recuadro izquierdo: Foto */}
                  <AnimatedContact
                    className="rounded-2xl overflow-hidden shadow-lg bg-white group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      {sucursal.image ? (
                        <AnimatedImage
                          src={sucursal.image}
                          alt={sucursal.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl sm:text-6xl">{sucursal.icon}</span>
                        </div>
                      )}
                    </div>
                  </AnimatedContact>

                  {/* Recuadro derecho: Mapa */}
                  <AnimatedContact
                    className="rounded-2xl overflow-hidden shadow-lg bg-white"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 bg-gradient-to-br from-gray-200 to-gray-300">
                      <iframe
                        src={sucursal.map}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={sucursal.name}
                        className="absolute inset-0"
                      />
                    </div>
                  </AnimatedContact>
                </div>

                {/* Información y botón debajo */}
                <AnimatedContact className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="flex-shrink-0 mt-1 text-orange-500" size={22} />
                      <div>
                        <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1">
                          {sucursal.name}
                        </h4>
                        <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                          {sucursal.address}
                        </p>
                      </div>
                    </div>
                    <AnimatedLink
                      href={sucursal.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap text-sm sm:text-base"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Ver en Google Maps
                    </AnimatedLink>
                  </div>
                </AnimatedContact>
              </AnimatedContact>
            ))}
          </div>
        </section>

        {/* Formulario de Contacto e Información */}
        <section className="bg-gray-50 py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
              {/* Formulario - Izquierda */}
              <AnimatedContact
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Envíanos un mensaje
                </h2>
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                  Completá el formulario y nos pondremos en contacto a la brevedad
                </p>

                <ContactForm />
              </AnimatedContact>

              {/* Información de Contacto - Derecha */}
              <AnimatedContact
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
                  Contactanos
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* Teléfono */}
                  <AnimatedContact
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-md p-5 sm:p-6 text-center hover:shadow-xl transition-all duration-300"
                  >
                    <AnimatedContact
                      className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Phone className="text-white" size={24} />
                    </AnimatedContact>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">
                      Teléfono
                    </h3>
                    <a
                      href="tel:+543515158848"
                      className="text-orange-600 hover:text-orange-700 font-semibold text-base sm:text-lg transition-colors duration-300"
                    >
                      351 515 8848
                    </a>
                  </AnimatedContact>

                  {/* Email */}
                  <AnimatedContact
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-md p-5 sm:p-6 text-center hover:shadow-xl transition-all duration-300"
                  >
                    <AnimatedContact
                      className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Mail className="text-white" size={24} />
                    </AnimatedContact>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">
                      Email
                    </h3>
                    <a
                      href="mailto:consultas@caradvice.com.ar"
                      className="text-orange-600 hover:text-orange-700 font-semibold break-all text-sm sm:text-base transition-colors duration-300"
                    >
                      consultas@caradvice.com.ar
                    </a>
                  </AnimatedContact>

                  {/* Horarios */}
                  <AnimatedContact
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-md p-5 sm:p-6 text-center hover:shadow-xl transition-all duration-300"
                  >
                    <AnimatedContact
                      className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Clock className="text-white" size={24} />
                    </AnimatedContact>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">
                      Horarios
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Lunes a Viernes: 9:00 - 19:00
                      <br />
                      Sábados: 9:00 - 13:00
                    </p>
                  </AnimatedContact>
                </div>

                {/* Lista de direcciones */}
                <AnimatedContact
                  className="bg-white rounded-xl shadow-md p-6 sm:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <ul className="space-y-3 sm:space-y-4">
                    {sucursales.map((sucursal, index) => (
                      <AnimatedContact
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                        className="flex items-start gap-3 text-gray-700 hover:text-orange-600 transition-colors duration-300 text-sm sm:text-base"
                      >
                        <MapPin className="flex-shrink-0 mt-1 text-orange-500" size={18} />
                        <span>
                          <strong>{sucursal.name}</strong> | {sucursal.address}
                        </span>
                      </AnimatedContact>
                    ))}
                  </ul>
                </AnimatedContact>
              </AnimatedContact>
            </div>
          </div>
        </section>

        {/* CTA WhatsApp */}
        <section className="relative bg-gradient-to-br from-green-600 to-green-700 text-white py-10 sm:py-12 md:py-16 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <AnimatedContact
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                ¿Preferís hablar por WhatsApp?
              </h2>
              <p className="text-base sm:text-lg mb-5 sm:mb-6 text-green-100 px-4">
                Chateá con nosotros y te respondemos al instante
              </p>
              <AnimatedLink
                href="https://wa.me/5493515158848"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-green-600 hover:bg-green-50 font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 shadow-lg text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Abrir WhatsApp
              </AnimatedLink>
            </AnimatedContact>
          </div>
        </section>

        {/* Botón flotante de WhatsApp */}
        <WhatsAppButton />
      </div>
    </>
  );
}
