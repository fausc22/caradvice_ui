import type { Metadata, Viewport } from "next";

// Viewport configuration para Vestri
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#192BC2", // Azul de Vestri
};

// Metadata con iconos específicos para Vestri
export const metadata: Metadata = {
  metadataBase: new URL("https://vestri.caradvice.com.ar"),
  
  icons: {
    icon: [
      { url: "/favicon_vestri.png", sizes: "any", type: "image/png" },
    ],
    shortcut: [
      { url: "/favicon_vestri.png" },
    ],
    apple: [
      { url: "/favicon_vestri.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function VestriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
