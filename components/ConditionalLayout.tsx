"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isVestriSubdomain, setIsVestriSubdomain] = useState(false);

  useEffect(() => {
    // Detectar si estamos en el subdominio vestri
    const hostname = window.location.hostname;
    setIsVestriSubdomain(hostname.startsWith("vestri."));
  }, []);

  const isMaintenancePage = pathname === "/mantenimiento";
  const isVestriPage = pathname === "/vestri" || isVestriSubdomain;

  if (isMaintenancePage || isVestriPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
