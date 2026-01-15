"use client";

import Script from "next/script";

/**
 * Componente TrustindexWidget - Versión oficial
 * 
 * Usa el snippet exacto de Trustindex:
 * El loader.js lleva el widget ID como query parameter
 * <script defer async src='https://cdn.trustindex.io/loader.js?WIDGET_ID'></script>
 */
export default function TrustindexWidget() {
  const widgetId = "855b5c856aad24344896429404f";

  return (
    <Script
      id="trustindex-widget"
      src={`https://cdn.trustindex.io/loader.js?${widgetId}`}
      strategy="afterInteractive"
    />
  );
}
