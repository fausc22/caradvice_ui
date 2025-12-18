# 📦 Modo Estático - Guía de Uso

## 🎯 ¿Qué es el Modo Estático?

El modo estático permite mostrar 15 vehículos de la base de datos de forma completamente estática, sin necesidad de tener el backend corriendo. Esto es ideal para:

- ✅ Mostrar la interfaz al cliente en Vercel sin depender de APIs externas
- ✅ Demostraciones rápidas
- ✅ Testing de la UI sin backend
- ✅ Deploy en plataformas estáticas

## 🚀 Cómo Activar el Modo Estático

### Paso 1: Exportar Datos desde el Backend

1. Asegúrate de que el backend tenga datos en la base de datos
2. Ejecuta el script de exportación:

```bash
cd server
npm run export:static
```

Este script:
- Exporta 15 vehículos publicados
- Incluye todas sus imágenes y taxonomías
- Genera opciones de filtros
- Crea el archivo `public/static-data/vehicles.json`

### Paso 2: Activar el Modo Estático

Agrega esta variable de entorno en Vercel (o en tu `.env.local`):

```
NEXT_PUBLIC_STATIC_MODE=true
```

### Paso 3: Build y Deploy

1. El archivo `vehicles.json` debe estar en `public/static-data/`
2. Haz commit del archivo JSON (o configúralo para que se genere en el build)
3. Deploy en Vercel

## 🔄 Cómo Desactivar el Modo Estático

Simplemente cambia la variable de entorno:

```
NEXT_PUBLIC_STATIC_MODE=false
```

O elimínala completamente. El sistema volverá a usar la API normal.

## 📋 Funcionalidades Disponibles en Modo Estático

### ✅ Funciona:
- Ver lista de vehículos (15 vehículos)
- Ver detalle de cada vehículo
- Filtros (marca, modelo, condición, precio, año, etc.)
- Búsqueda por texto
- Ordenamiento
- Paginación
- Imágenes de vehículos
- Vehículos relacionados
- Comparación de vehículos

### ⚠️ Limitaciones:
- Solo 15 vehículos disponibles
- Los filtros solo funcionan sobre esos 15 vehículos
- No se pueden agregar nuevos vehículos sin re-exportar
- Las imágenes deben estar accesibles (pueden ser URLs externas o estar en `/public`)

## 🔧 Actualizar Datos Estáticos

Para actualizar los datos estáticos:

1. Ejecuta el script de exportación nuevamente:
   ```bash
   cd server
   npm run export:static
   ```

2. Esto regenerará `public/static-data/vehicles.json`

3. Haz commit y push del nuevo archivo

4. Vercel detectará el cambio y re-desplegará automáticamente

## 📁 Estructura de Archivos

```
public/
  static-data/
    vehicles.json      # Datos de vehículos y filtros
    config.json        # Metadata de exportación
```

## 🎨 Flujo de Datos

### Modo Estático (ON):
```
Frontend → lib/static-data.ts → vehicles.json → UI
```

### Modo Normal (OFF):
```
Frontend → lib/api.ts → Backend API → Base de Datos → UI
```

## 💡 Tips

1. **Para mostrar al cliente**: Activa modo estático, exporta los mejores 15 vehículos, y deploy
2. **Para desarrollo**: Desactiva modo estático para trabajar con datos reales
3. **Para producción**: Usa modo normal para tener todos los vehículos actualizados

## 🔍 Verificar que Funciona

1. Activa el modo estático
2. Abre la consola del navegador
3. Deberías ver que las peticiones van a `/static-data/vehicles.json` en lugar de a la API
4. Los filtros y búsquedas funcionan localmente sobre los datos estáticos

