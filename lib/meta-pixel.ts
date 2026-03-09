/**
 * Helpers para el Meta Pixel (Facebook).
 * El script base se carga una sola vez en layout via MetaPixel.tsx.
 * Solo disparar eventos; no cargar el script aquí.
 */

const PIXEL_ID = "1505816897053043";

/**
 * Dispara el evento Lead con content_ids para coincidencia con el catálogo de Meta.
 * Llamar desde el documento principal (ej. onClick del botón WhatsApp) antes de navegar.
 */
export function trackLead(contentIds: string | string[]): void {
  if (typeof window === "undefined" || !window.fbq) return;
  const ids = Array.isArray(contentIds) ? contentIds : [contentIds];
  window.fbq("track", "Lead", {
    content_ids: ids,
    content_type: "product",
  });
}

/**
 * Dispara ViewContent al ver la ficha de un vehículo (coincidencia con catálogo).
 */
export function trackViewContent(contentIds: string | string[]): void {
  if (typeof window === "undefined" || !window.fbq) return;
  const ids = Array.isArray(contentIds) ? contentIds : [contentIds];
  window.fbq("track", "ViewContent", {
    content_ids: ids,
    content_type: "product",
  });
}

export { PIXEL_ID };
