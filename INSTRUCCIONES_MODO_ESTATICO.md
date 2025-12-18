# 📋 Instrucciones: Modo Estático ON/OFF

## 🎯 Objetivo

Permitir mostrar 15 vehículos de forma completamente estática en Vercel, sin necesidad del backend corriendo, para poder mostrar la interfaz al cliente.

## ✅ Funcionalidades en Modo Estático

- ✅ Ver 15 vehículos con todas sus características
- ✅ Ver detalle completo de cada vehículo
- ✅ Filtros (marca, modelo, condición, precio, año, kilómetros, etc.)
- ✅ Búsqueda por texto
- ✅ Ordenamiento (precio, año, fecha, etc.)
- ✅ Paginación
- ✅ Ver todas las fotos de cada vehículo
- ✅ Vehículos relacionados
- ✅ Comparación de vehículos

## 🚀 Pasos para Activar Modo Estático

### 1. Exportar Datos desde el Backend

Desde la carpeta `server/`, ejecuta:

```bash
npm run export:static
```

Esto creará el archivo `public/static-data/vehicles.json` con 15 vehículos.

### 2. Verificar el Archivo Generado

Verifica que se creó correctamente:

```bash
ls -la public/static-data/
```

Deberías ver:
- `vehicles.json` (datos de vehículos)
- `config.json` (metadata)

### 3. Activar Modo Estático en Vercel

En la configuración de Vercel, agrega esta variable de entorno:

**Nombre**: `NEXT_PUBLIC_STATIC_MODE`  
**Valor**: `true`

### 4. Hacer Commit del JSON (Opcional)

Si quieres que el JSON esté en el repositorio:

1. Edita `.gitignore` y comenta estas líneas:
   ```
   # public/static-data/vehicles.json
   # public/static-data/config.json
   ```

2. Haz commit:
   ```bash
   git add public/static-data/vehicles.json
   git commit -m "Add static data for demo"
   git push
   ```

### 5. Deploy en Vercel

Vercel detectará automáticamente el cambio y desplegará. El modo estático estará activo.

## 🔄 Desactivar Modo Estático

En Vercel, cambia la variable de entorno:

**Nombre**: `NEXT_PUBLIC_STATIC_MODE`  
**Valor**: `false`

O simplemente elimínala. El sistema volverá a usar la API normal.

## 📝 Actualizar los 15 Vehículos

Si quieres cambiar qué vehículos se muestran:

1. Ejecuta nuevamente: `npm run export:static`
2. Esto regenerará el archivo con los últimos 15 vehículos publicados
3. Haz commit y push del nuevo archivo
4. Vercel re-desplegará automáticamente

## 🖼️ Sobre las Imágenes

Las imágenes funcionan de dos formas:

1. **Si el backend está disponible**: Las imágenes se sirven desde `/api/image?path=...`
2. **Si solo hay URLs externas**: Se usan las URLs originales de la API de Asofix

Para que las imágenes funcionen completamente en modo estático sin backend:

- Opción A: Usar URLs externas de Asofix (ya incluidas en `image_url`)
- Opción B: Copiar las imágenes a `public/static-images/` y actualizar las rutas

## ⚠️ Limitaciones del Modo Estático

- Solo muestra 15 vehículos (los últimos publicados)
- Los filtros solo funcionan sobre esos 15 vehículos
- No se pueden agregar nuevos vehículos sin re-exportar
- Las imágenes deben estar accesibles (URLs externas o en `/public`)

## 🧪 Probar Localmente

1. Exporta los datos: `cd server && npm run export:static`
2. Crea `.env.local` con: `NEXT_PUBLIC_STATIC_MODE=true`
3. Ejecuta: `npm run dev`
4. Abre `http://localhost:3000`
5. Deberías ver los 15 vehículos sin necesidad del backend

## 💡 Casos de Uso

### Para Mostrar al Cliente:
1. Activa modo estático
2. Exporta los mejores 15 vehículos
3. Deploy en Vercel
4. Comparte el link

### Para Desarrollo:
1. Desactiva modo estático (o no lo actives)
2. Usa el backend local
3. Trabaja con todos los vehículos

### Para Producción:
1. Usa modo normal (sin modo estático)
2. Conecta con el backend desplegado
3. Todos los vehículos disponibles

