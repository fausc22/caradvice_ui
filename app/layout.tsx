import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
import ConditionalLayout from "@/components/ConditionalLayout";
import MetaPixelNoscript from "@/components/MetaPixelNoscript";
import GoogleTagManager from "@/components/GoogleTagManager";
import GoogleTagManagerNoscript from "@/components/GoogleTagManagerNoscript";

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// Metadata global base
export const metadata: Metadata = {
  metadataBase: new URL("https://caradvice.com.ar"),
  
  title: {
    default: "CAR ADVICE - Concesionaria de Autos Usados y 0km en Córdoba",
    template: "%s | CAR ADVICE Córdoba",
  },
  
  description:
    "Concesionaria de autos usados y 0km en Córdoba. Compramos tu usado, vendemos tu auto por vos, financiamos tu auto. 4 sucursales en Córdoba Capital.",
  
  keywords: [
    "autos usados Córdoba",
    "concesionaria Córdoba",
    "autos 0km Córdoba",
    "compra venta autos Córdoba",
    "financiación autos Córdoba",
    "CAR ADVICE",
    "autos usados Argentina",
    "concesionaria autos Córdoba",
  ],
  
  authors: [{ name: "CAR ADVICE" }],
  
  creator: "CAR ADVICE",
  
  publisher: "CAR ADVICE",
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://caradvice.com.ar",
    siteName: "CAR ADVICE",
    title: "CAR ADVICE - Concesionaria de Autos Usados y 0km en Córdoba",
    description:
      "Concesionaria de autos usados y 0km en Córdoba. Compramos tu usado, vendemos tu auto por vos, financiamos tu auto. 4 sucursales en Córdoba Capital.",
    images: [
      {
        url: "/IMG/logo_transparente.png",
        width: 1200,
        height: 630,
        alt: "CAR ADVICE - Concesionaria de Autos Córdoba",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "CAR ADVICE - Concesionaria de Autos Usados y 0km en Córdoba",
    description:
      "Concesionaria de autos usados y 0km en Córdoba. Compramos tu usado, vendemos tu auto por vos, financiamos tu auto.",
    images: ["/IMG/logo_transparente.png"],
  },
  
  alternates: {
    canonical: "https://caradvice.com.ar",
  },
  
  icons: {
    // Configuración optimizada para Google Search Results
    // IMPORTANTE: Google prioriza PNG sobre ICO en los resultados de búsqueda.
    // Por eso los PNG se declaran ANTES del ICO en el array.
    // El orden importa: los navegadores y Google usan el primer formato compatible.
    icon: [
      // PNG optimizados para Google (mínimo 48x48, recomendado 96x96)
      // Estos se cargan primero y Google los usará en lugar del ICO
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      // ICO mantenido al final para compatibilidad con navegadores antiguos
      // pero Google preferirá los PNG declarados arriba
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: [
      // Mantener ICO para compatibilidad con atajos de navegador
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      // Apple Touch Icon: 180x180 es el tamaño estándar para iOS
      // Usamos el 192x192 que es el más cercano y compatible
      { url: "/favicon-192.png", sizes: "180x180", type: "image/png" },
    ],
  },
  
  verification: {
    // Agregar cuando tengas Google Search Console
    // google: "tu-codigo-de-verificacion",
  },
  
  category: "Automotive",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  const isVestri = hostname.startsWith("vestri.");

  return (
    <html lang="es-AR">
      <body className="font-antenna">
        {/* Google Tag Manager - Lo más arriba posible en el head */}
        <GoogleTagManager gtmId="GTM-PSVQ79TP" />
        {/* Google Tag Manager (noscript) - Justo después de la apertura del body */}
        <GoogleTagManagerNoscript gtmId="GTM-PSVQ79TP" />
        {/* Meta Pixel Code - Car Advice (solo si NO es Vestri) */}
        {!isVestri && (
          <>
            <Script
              id="meta-pixel-caradvice"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '1505816897053043');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <MetaPixelNoscript pixelId="1505816897053043" />
          </>
        )}
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
