# Deploy frontend en VPS con PM2

Esta guia deja este frontend de Next.js corriendo en un VPS con PM2, manteniendo el comportamiento de produccion.

## 1) Requisitos del VPS

- Ubuntu/Debian con acceso SSH.
- Node.js 20 LTS instalado.
- npm instalado.
- PM2 instalado globalmente: `npm i -g pm2`.
- Git instalado.
- (Opcional) Caddy como reverse proxy HTTPS.

## 2) Preparar carpeta de deploy

```bash
sudo mkdir -p /var/www/caradvice
sudo chown -R $USER:$USER /var/www/caradvice
cd /var/www/caradvice
```

## 3) Clonar proyecto

```bash
git clone <TU_REPO_GIT> frontend
cd frontend
```

## 4) Instalar dependencias y compilar

```bash
npm ci
npm run build
```

Si no usas lockfile, reemplaza `npm ci` por `npm install`.

## 5) Variables de entorno (obligatorio)

Este frontend depende de `NEXT_PUBLIC_API_URL` para consumir datos e imagenes.

Opciones comunes:
- Si tu backend/API publica vive en el mismo dominio final:  
  `NEXT_PUBLIC_API_URL=https://caradvice.com.ar`
- Si vive en otro host:  
  `NEXT_PUBLIC_API_URL=https://api.tudominio.com`

Edita el archivo `ecosystem.config.cjs` y ajusta:
- `cwd` (ruta real en tu VPS)
- `NEXT_PUBLIC_API_URL`
- `PORT` (si quieres otro puerto)

## 6) Iniciar con PM2

```bash
mkdir -p /var/log/pm2
pm2 start ecosystem.config.cjs
pm2 status
pm2 logs caradvice-frontend --lines 100
```

Persistencia al reiniciar el servidor:

```bash
pm2 save
pm2 startup
```

Ejecuta el comando que te devuelva `pm2 startup` (requiere sudo), y luego vuelve a correr `pm2 save`.

## 7) Verificacion local en VPS (antes de Caddy)

```bash
curl -I http://127.0.0.1:3000
```

Debe responder `200` o `307/308` segun la ruta solicitada.

## 8) Actualizar a una nueva version

Desde `/var/www/caradvice/frontend`:

```bash
git pull
npm ci
npm run build
pm2 restart caradvice-frontend --update-env
```

## 9) Puntos clave para que se vea igual que en Vercel

- Usa la misma version de Node.js en build y runtime.
- Define correctamente `NEXT_PUBLIC_API_URL` (si falta, el frontend puede intentar `localhost` y romper datos/imagenes).
- Asegura que la API backend tenga CORS/SSL correctos para el dominio final.
- Si usas la ruta `/api/image?path=...`, el frontend espera imagenes locales en `server/uploads` dentro del mismo proyecto en runtime.  
  Si no vas a tener esa carpeta en el VPS, debes servir imagenes por URL publica desde tu API/CDN.

## 10) Comandos utiles PM2

```bash
pm2 status
pm2 logs caradvice-frontend
pm2 restart caradvice-frontend
pm2 stop caradvice-frontend
pm2 delete caradvice-frontend
```

