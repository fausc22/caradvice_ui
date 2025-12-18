import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
import ConditionalLayout from "@/components/ConditionalLayout";

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
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32-1.png", sizes: "32x32", type: "image/png" },
      { url: "/cropped-favicon-32x32-2-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/favicon-32x32-1.png", sizes: "180x180", type: "image/png" },
    ],
  },
  
  verification: {
    // Agregar cuando tengas Google Search Console
    // google: "tu-codigo-de-verificacion",
  },
  
  category: "Automotive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className="font-antenna">
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
