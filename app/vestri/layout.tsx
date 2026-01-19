import type { Metadata, Viewport } from "next";
import Script from "next/script";

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
  return (
    <>
      {/* Meta Pixel Code */}
      <Script
        id="meta-pixel"
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
            fbq('init', '1601853571182218');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1601853571182218&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      {/* End Meta Pixel Code */}
      
      {children}
    </>
  );
}
