import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware para manejar subdominios y redirecciones
 * 
 * Funcionalidad:
 * 1. vestri.caradvice.com.ar → sirve /vestri como página principal
 * 2. caradvice.com.ar/vestri → redirige 301 a vestri.caradvice.com.ar
 * 3. caradvice.com.ar/* → funciona normalmente
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  
  // Detectar si estamos en el subdominio vestri
  const isVestriSubdomain = hostname.startsWith("vestri.");
  
  // Detectar si estamos en localhost para desarrollo
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  
  // En desarrollo, usar query param ?subdomain=vestri para simular
  const isVestriDev = isLocalhost && url.searchParams.get("subdomain") === "vestri";

  // CASO 1: Subdominio vestri.caradvice.com.ar (o simulación en dev)
  if (isVestriSubdomain || isVestriDev) {
    // Si acceden a la raíz del subdominio, reescribir a /vestri
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/vestri";
      return NextResponse.rewrite(url);
    }
    
    // Si acceden a /vestri en el subdominio, mostrar sin redirigir
    if (url.pathname === "/vestri") {
      return NextResponse.next();
    }
    
    // Bloquear acceso a otras rutas del dominio principal desde el subdominio
    // (opcional: puedes permitir algunas rutas como /api, /_next, etc.)
    if (
      !url.pathname.startsWith("/vestri") &&
      !url.pathname.startsWith("/_next") &&
      !url.pathname.startsWith("/api") &&
      !url.pathname.startsWith("/IMG") &&
      !url.pathname.startsWith("/fonts") &&
      !url.pathname.includes(".")
    ) {
      // Redirigir al dominio principal para otras rutas
      return NextResponse.redirect(
        new URL(url.pathname, "https://caradvice.com.ar"),
        301
      );
    }
  }

  // CASO 2: Dominio principal caradvice.com.ar/vestri → redirigir al subdominio
  if (!isVestriSubdomain && !isVestriDev && url.pathname === "/vestri") {
    // Solo redirigir en producción (no en localhost)
    if (!isLocalhost) {
      return NextResponse.redirect(
        new URL("/", "https://vestri.caradvice.com.ar"),
        301
      );
    }
  }

  // CASO 3: Cualquier otra ruta en el dominio principal → funciona normalmente
  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
