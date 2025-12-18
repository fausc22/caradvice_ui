# CAR ADVICE - Clon de Sitio Web

Este es un proyecto Next.js que replica el sitio web de CAR ADVICE, una concesionaria de autos en Córdoba, Argentina.

## Características

- 🚗 Catálogo de autos con filtros y búsqueda
- 💰 Sistema de comparación de vehículos
- 📱 Diseño responsive
- 🎨 Interfaz moderna con Tailwind CSS
- ⚡ Next.js 14 con App Router
- 🔄 Servidor Express para sincronización con API de Asofix
- 🗄️ Base de datos MySQL para almacenar vehículos

## Tecnologías

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (iconos)

### Backend
- Express.js
- Node.js
- TypeScript
- MySQL
- Winston (logging)

## Instalación

### Frontend (Next.js)

```bash
npm install
```

### Backend (Servidor Express)

```bash
cd server
npm install
```

## Configuración

### 1. Configurar el servidor

Copia el archivo de ejemplo de variables de entorno:

```bash
cd server
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# API de Asofix
ASOFIX_API_KEY=tu_api_key_aqui

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=caradvice
```

### 2. Crear la base de datos

Ejecuta el script SQL para crear las tablas:

```bash
mysql -u root -p < server/database/schema.sql
```

## Desarrollo

### Frontend

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Backend

```bash
cd server
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## Sincronización de Vehículos

El servidor incluye un sistema de sincronización que replica la funcionalidad del plugin de WordPress original. El proceso se divide en dos fases:

### Fase 1: Sincronizar datos (sin imágenes)

```bash
cd server
npm run sync
```

Este comando obtiene todos los vehículos de la API de Asofix y los guarda en la base de datos.

### Fase 2: Descargar imágenes

```bash
cd server
npm run sync:images
```

Este comando descarga las imágenes de los vehículos (con pausa de 10 segundos entre cada una).

## Estructura del Proyecto

```
caradvice/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/              # Componentes React
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── CarCard.tsx
│   └── ...
├── server/                 # Servidor Express
│   ├── src/
│   │   ├── config/         # Configuración
│   │   ├── services/       # Servicios (API, Sync, Log)
│   │   ├── routes/         # Rutas Express
│   │   └── scripts/        # Scripts de sincronización
│   ├── database/
│   │   └── schema.sql      # Esquema de base de datos
│   └── README.md           # Documentación del servidor
├── types/                  # Tipos TypeScript
│   └── car.ts
└── README.md
```

## API Endpoints

### Health Check
```
GET http://localhost:3001/health
```

### Vehículos
```
GET http://localhost:3001/api/vehicles?page=1&limit=20
GET http://localhost:3001/api/vehicles/:id
```

### Sincronización
```
GET http://localhost:3001/api/sync/page/:page
POST http://localhost:3001/api/sync/vehicle
GET http://localhost:3001/api/sync/pending-images
POST http://localhost:3001/api/sync/image
```

Para más detalles sobre el servidor, consulta [server/README.md](server/README.md)

## Próximas Mejoras

- [x] Servidor Express para sincronización
- [x] Base de datos MySQL
- [ ] Integración frontend-backend
- [ ] Sistema de autenticación
- [ ] Página de detalles de auto
- [ ] Formulario de contacto
- [ ] Sistema de favoritos
- [ ] Chat de WhatsApp integrado

