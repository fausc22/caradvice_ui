# Solución al Error 404 en Páginas de Detalle

## Problema Identificado

El error `ECONNREFUSED` indica que el servidor de Next.js no puede conectarse al backend cuando intenta obtener el vehículo por ID.

## Causas Posibles

1. **Backend no está corriendo**: El backend debe estar corriendo en el puerto 4000
2. **Variable de entorno no configurada**: `NEXT_PUBLIC_API_URL` debe apuntar a la URL correcta del backend
3. **Backend no accesible desde el servidor**: En algunos entornos, `localhost` no es accesible desde el servidor de Next.js

## Solución

### 1. Verificar que el backend esté corriendo

```bash
cd backend
npm run dev
```

El backend debe estar corriendo en `http://localhost:4000` (o el puerto configurado).

### 2. Configurar la variable de entorno

Crear o actualizar `.env.local` en la raíz del proyecto:

```env
# URL del backend (debe ser accesible desde el servidor de Next.js)
NEXT_PUBLIC_API_URL=http://localhost:4000

# Si el backend está en otro servidor, usar la URL completa:
# NEXT_PUBLIC_API_URL=http://192.168.1.100:4000
# O en producción:
# NEXT_PUBLIC_API_URL=https://api.caradvice.com.ar
```

### 3. Reiniciar el servidor de Next.js

Después de configurar la variable de entorno, reiniciar el servidor de Next.js:

```bash
npm run dev
```

## Verificación

1. Verificar que el backend responda:
   ```bash
   curl http://localhost:4000/health
   ```

2. Verificar que el endpoint de vehículos funcione:
   ```bash
   curl http://localhost:4000/autos?limit=1
   ```

3. Verificar que el endpoint de detalle funcione:
   ```bash
   curl http://localhost:4000/autos/266
   ```

## Notas Importantes

- El ID usado en las URLs es `vehicle.id` (numérico), convertido a string
- El backend soporta búsqueda por ID numérico o `asofix_id`
- Si el backend está en Docker o en otro servidor, usar la IP o URL completa en lugar de `localhost`

