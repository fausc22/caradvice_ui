/**
 * Utilidad para eventos del Meta Pixel con parámetros de inventario automotriz.
 * Requerido para que Meta calcule la "Proporción de coincidencias del catálogo".
 *
 * - content_ids: debe coincidir exactamente con el ID del producto/vehículo en el catálogo.
 * - content_type: siempre "vehicle" para Automotive Inventory Ads.
 * @see https://www.facebook.com/business/help/518588851979334
 * @see https://developers.facebook.com/docs/marketing-api/auto-ads/guides/events
 */

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

const CONTENT_TYPE = "vehicle" as const;

function ensureArray(id: string | number): string[] {
  return [String(id)];
}

function trackWithContentIds(
  eventName: string,
  contentIds: (string | number)[],
  extraParams?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !window.fbq) return;
  const ids = contentIds.map((id) => String(id));
  window.fbq("track", eventName, {
    content_type: CONTENT_TYPE,
    content_ids: ids,
    ...extraParams,
  });
}

/**
 * Dispara ViewContent cuando el usuario ve la ficha/detalle de un auto.
 * Llamar al cargar la página de detalle del vehículo.
 */
export function trackViewContent(vehicleId: string | number) {
  trackWithContentIds("ViewContent", ensureArray(vehicleId));
}

/**
 * Dispara Lead cuando el usuario completa el formulario o consulta por un auto (ej. clic WhatsApp).
 * Incluir el ID del vehículo para que Meta matchee con el catálogo.
 */
export function trackLead(vehicleId: string | number) {
  trackWithContentIds("Lead", ensureArray(vehicleId));
}

/**
 * Dispara Search cuando el usuario usa el buscador/filtros.
 * Envía los IDs de los primeros vehículos en los resultados para mejorar el match.
 */
export function trackSearch(vehicleIds: (string | number)[]) {
  if (!vehicleIds.length) return;
  trackWithContentIds("Search", vehicleIds);
}
