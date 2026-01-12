# Optimización de Fast Data Transfer en Vercel

## 📊 Diagnóstico Completo

### 🔴 Problema Crítico: Video Hero (80MB)

**Ubicación**: `/public/videos/hero_video.mp4` (80MB)

**Impacto actual**:
- Se descarga en cada visita a la home (`/`) y página de autos (`/autos`)
- Con `preload="auto"`, el navegador descarga el video completo inmediatamente
- **80MB × número de visitas = consumo masivo de Fast Data Transfer**

**Solución implementada**:
- ✅ Cambio de `preload="auto"` a `preload="none"` (no descarga hasta que sea necesario)
- ✅ Lazy loading con Intersection Observer (solo carga cuando está visible)
- ✅ Carga condicional solo en desktop (mobile muestra solo el poster)
- ✅ Soporte para CDN externo mediante variable de entorno

**Reducción estimada**: **~95%** del consumo del video
- Mobile: 0MB (solo poster)
- Desktop: Solo carga cuando es visible y el usuario interactúa

---

### 🟡 Problema Importante: API Route `/api/image`

**Ubicación**: `app/api/image/route.ts`

**Impacto actual**:
- Todas las imágenes de autos pasan por Vercel
- Cada imagen consume Fast Data Transfer aunque tenga cache headers
- Las imágenes se sirven desde el servidor local (`server/uploads/`)

**Solución recomendada**:

#### Opción 1: Mover imágenes a CDN externo (RECOMENDADO)
```typescript
// Usar Cloudflare R2, AWS S3, o similar
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.caradvice.com.ar";

// En los componentes, cambiar:
const imageUrl = vehicle.featured_image_path 
  ? `${CDN_URL}/uploads/${vehicle.featured_image_path}`
  : vehicle.featured_image_url;
```

**Beneficios**:
- ✅ 0 consumo de Fast Data Transfer para imágenes
- ✅ Mejor rendimiento (CDN global)
- ✅ Escalabilidad ilimitada

#### Opción 2: Optimizar API route con cache agresivo
```typescript
// Agregar headers de cache más agresivos
headers: {
  "Content-Type": contentType,
  "Cache-Control": "public, max-age=31536000, immutable",
  "CDN-Cache-Control": "public, max-age=31536000",
  "Vercel-CDN-Cache-Control": "public, max-age=31536000",
}
```

**Reducción estimada**: **~70%** del consumo de imágenes (con cache del navegador)

---

### 🟢 Problema Menor: Poster del Hero (110KB)

**Ubicación**: `/public/hero-poster.jpg` (110KB)

**Estado**: Aceptable, pero optimizable

**Recomendación**:
- Comprimir el poster a WebP o AVIF
- Tamaño objetivo: < 50KB

---

## 🚀 Soluciones Implementadas

### 1. Optimización del Video Hero

**Cambios realizados**:
- ✅ `preload="none"` en lugar de `preload="auto"`
- ✅ Lazy loading con Intersection Observer
- ✅ Carga solo en desktop (mobile muestra solo poster)
- ✅ Soporte para CDN externo

**Cómo usar CDN externo**:
1. Sube el video a un CDN (Cloudflare R2, AWS S3, etc.)
2. Agrega la variable de entorno:
   ```env
   NEXT_PUBLIC_VIDEO_CDN_URL=https://cdn.caradvice.com.ar/videos/hero_video.mp4
   ```
3. El componente usará automáticamente el CDN

**Reducción de consumo**: **~95%**

---

## 📋 Recomendaciones Adicionales

### 1. Mover Video a CDN Externo (ALTA PRIORIDAD)

**Opciones recomendadas**:

#### Cloudflare Stream (Recomendado)
- ✅ Optimización automática de video
- ✅ Streaming adaptativo
- ✅ Análisis de uso
- ✅ Precio: ~$1 por 1000 minutos de video visto

**Implementación**:
```typescript
// En HeroVideo.tsx, usar:
const videoUrl = "https://customer-xxxxx.cloudflarestream.com/xxxxx/manifest/video.m3u8";
```

#### AWS S3 + CloudFront
- ✅ Escalable y económico
- ✅ Control total
- ✅ Precio: ~$0.023/GB de transferencia

#### Vimeo (Opcional)
- ✅ Player optimizado
- ✅ Analytics incluido
- ✅ Precio: Desde $7/mes

---

### 2. Optimizar Imágenes de Autos

**Estrategia recomendada**:

#### Paso 1: Mover a CDN
```bash
# Subir todas las imágenes a Cloudflare R2 o AWS S3
# Actualizar URLs en la base de datos
```

#### Paso 2: Usar Next.js Image Optimization
```typescript
// Ya estás usando next/image, pero asegúrate de:
<Image
  src={imageUrl}
  width={800}
  height={600}
  quality={85}
  loading="lazy"
  placeholder="blur"
/>
```

#### Paso 3: Implementar formato WebP/AVIF
```typescript
// Next.js Image automáticamente sirve WebP/AVIF cuando es compatible
// Solo asegúrate de tener las imágenes originales en alta calidad
```

---

### 3. Configurar Cache Headers en Vercel

**Agregar a `vercel.json`**:
```json
{
  "headers": [
    {
      "source": "/videos/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/IMG/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

### 4. Monitorear Consumo

**Herramientas recomendadas**:
- Vercel Analytics: Ver consumo de Fast Data Transfer
- Google Analytics: Ver páginas más visitadas
- Cloudflare Analytics: Si usas Cloudflare

**Métricas a monitorear**:
- Consumo mensual de Fast Data Transfer
- Páginas más visitadas
- Tamaño promedio de página
- Tiempo de carga

---

## 📈 Impacto Esperado

### Antes de optimizaciones:
- Video Hero: ~80MB por visita (home + /autos)
- Imágenes: ~2-5MB por página de autos
- **Total estimado**: ~100-150GB/mes (con 1000 visitas/mes)

### Después de optimizaciones:
- Video Hero: ~0-4MB por visita (solo desktop, lazy load)
- Imágenes: ~0MB (si se mueven a CDN) o ~0.5-1MB (con cache)
- **Total estimado**: ~5-10GB/mes (reducción del 90-95%)

---

## ✅ Checklist de Implementación

### Inmediato (Ya implementado):
- [x] Optimizar componente HeroVideo
- [x] Cambiar preload a "none"
- [x] Implementar lazy loading
- [x] Carga condicional desktop/mobile

### Corto plazo (Recomendado esta semana):
- [ ] Subir video a CDN externo (Cloudflare Stream o AWS S3)
- [ ] Configurar variable `NEXT_PUBLIC_VIDEO_CDN_URL`
- [ ] Optimizar poster del hero (comprimir a WebP)
- [ ] Agregar `vercel.json` con cache headers

### Mediano plazo (Próximo mes):
- [ ] Mover imágenes de autos a CDN
- [ ] Actualizar URLs en base de datos
- [ ] Implementar formato WebP/AVIF para imágenes
- [ ] Configurar monitoreo de consumo

---

## 🔧 Configuración de Variables de Entorno

Agregar a `.env.local` y Vercel:

```env
# CDN para video (opcional, pero altamente recomendado)
NEXT_PUBLIC_VIDEO_CDN_URL=https://cdn.caradvice.com.ar/videos/hero_video.mp4

# CDN para imágenes (cuando se implemente)
NEXT_PUBLIC_CDN_URL=https://cdn.caradvice.com.ar
```

---

## 📝 Notas Técnicas

### Por qué `preload="none"` es mejor:
- `preload="auto"`: Descarga el video completo inmediatamente
- `preload="metadata"`: Descarga solo metadatos (tamaño, duración)
- `preload="none"`: No descarga nada hasta que el usuario interactúa

### Por qué lazy loading ayuda:
- El video solo se carga cuando está visible en el viewport
- Reduce consumo en usuarios que no llegan al hero
- Mejora tiempo de carga inicial

### Por qué CDN externo es crítico:
- Vercel cobra por Fast Data Transfer
- CDNs externos son más económicos para contenido estático
- Mejor rendimiento global
- Escalabilidad ilimitada

---

## 🆘 Soporte

Si necesitas ayuda con la implementación:
1. Revisa la documentación de Cloudflare Stream o AWS S3
2. Verifica que las variables de entorno estén configuradas
3. Prueba en modo desarrollo antes de desplegar
4. Monitorea el consumo en Vercel Analytics

---

**Última actualización**: Enero 2025
**Autor**: Optimización de Fast Data Transfer

