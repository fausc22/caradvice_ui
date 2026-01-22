import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware para Car Advice
 * Maneja el routing del dominio principal
 */
export function middleware(request: NextRequest) {
  // El middleware ahora solo maneja el dominio principal
  // Todas las rutas funcionan normalmente
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
