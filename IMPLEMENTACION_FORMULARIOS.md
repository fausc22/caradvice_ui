# 📧 Implementación de Formularios con Envío de Emails

## 📋 Resumen

Se implementó un sistema completo de envío de emails para los 3 formularios existentes en el proyecto Next.js:

1. **Formulario de Contacto** (`/contacto`)
2. **Formulario de Vestri** (`/vestri`)
3. **Formulario de Detalle de Vehículo** (`/autos/[id]`)

Todos los formularios ahora envían los datos capturados al email `consultas@caradvice.com.ar` mediante un endpoint API centralizado.

---

## 🎯 Qué se Implementó

### 1. API Route Centralizada (`/app/api/leads/route.ts`)

**Endpoint**: `POST /api/leads`

**Características**:
- ✅ Endpoint único y reutilizable para los 3 formularios
- ✅ Validación server-side de todos los datos
- ✅ Sanitización de inputs para prevenir inyección
- ✅ Envío de emails HTML con formato profesional
- ✅ Manejo de errores robusto
- ✅ Soporte para diferentes fuentes (vehicle, contact, vestri)
- ✅ Incluye información del vehículo cuando aplica

**Payload esperado**:
```json
{
  "source": "vehicle | contact | vestri",
  "name": "string",
  "email": "string (requerido excepto para vestri)",
  "phone": "string",
  "message": "string",
  "vehicle": {
    "id": "string",
    "title": "string",
    "url": "string"
  } // Solo para source: "vehicle"
}
```

### 2. Componentes Actualizados

#### `components/contacto/ContactForm.tsx`
- ✅ Actualizado para usar `/api/leads`
- ✅ Mantiene toda la interfaz visual original
- ✅ Manejo de estados (loading, success, error)
- ✅ Validaciones client-side preservadas

#### `components/vestri/ContactSection.tsx`
- ✅ Actualizado para usar `/api/leads`
- ✅ Mantiene toda la interfaz visual original
- ✅ Email opcional (solo teléfono y nombre requeridos)
- ✅ Manejo de estados completo

#### `components/vehicles/VehicleContactForm.tsx` (NUEVO)
- ✅ Componente cliente nuevo para el formulario del vehículo
- ✅ Conectado a `/api/leads` con información del vehículo
- ✅ Reemplaza el formulario HTML estático anterior
- ✅ Interfaz visual idéntica a la original

### 3. Integración en Página de Vehículo

- ✅ `app/autos/[id]/page.tsx` actualizado
- ✅ Formulario estático reemplazado por componente funcional
- ✅ Pasa información del vehículo al formulario

---

## 🔧 Configuración Requerida

### Variables de Entorno

Agregar al archivo `.env` o `.env.local`:

```env
# Configuración SMTP para envío de emails
SMTP_HOST=smtp.gmail.com          # Servidor SMTP
SMTP_PORT=587                      # Puerto (587 para TLS, 465 para SSL)
SMTP_SECURE=false                  # true para SSL (puerto 465), false para TLS (puerto 587)
SMTP_USER=tu-email@gmail.com       # Email del remitente
SMTP_PASS=tu-app-password          # Contraseña de aplicación (NO la contraseña normal)

# Email destino para las consultas
EMAIL_TO=consultas@caradvice.com.ar
```

### Configuración para Gmail

1. Activar verificación en 2 pasos
2. Generar una "Contraseña de aplicación":
   - Ir a: https://myaccount.google.com/apppasswords
   - Seleccionar "Otra aplicación (nombre personalizado)"
   - Ingresar "CAR ADVICE Formularios"
   - Copiar la contraseña generada
   - Usar esta contraseña en `SMTP_PASS`

### Configuración para Otros Proveedores

**Outlook/Hotmail**:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

**SendGrid**:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=tu-api-key-de-sendgrid
```

**SMTP Personalizado**:
- Consultar con el proveedor de hosting/email
- Usar los valores proporcionados por el servicio

---

## 📦 Dependencias Instaladas

```json
{
  "nodemailer": "^latest",
  "@types/nodemailer": "^latest"
}
```

Ya instaladas mediante `npm install nodemailer @types/nodemailer`

---

## 🔒 Seguridad Implementada

1. **Validación Server-Side**: Todos los datos se validan en el servidor
2. **Sanitización**: Strings sanitizados para prevenir inyección
3. **Límites de Longitud**: Campos limitados a 5000 caracteres
4. **Validación de Email**: Regex para validar formato de email
5. **Validación de Source**: Solo acepta valores permitidos (vehicle, contact, vestri)
6. **Manejo de Errores**: No expone detalles internos en producción

---

## 📧 Formato del Email

El email enviado incluye:

- **Asunto**: Claro según el formulario de origen
- **Contenido HTML**: Formato profesional y responsivo
- **Contenido Texto**: Versión texto plano para clientes que no soportan HTML
- **Datos del formulario**:
  - Nombre
  - Email (cuando aplica)
  - Teléfono
  - Mensaje
  - Información del vehículo (solo para formulario de vehículo)
  - Origen del formulario
  - Fecha y hora

---

## ✅ Testing

### Probar Localmente

1. Configurar variables de entorno en `.env.local`
2. Iniciar servidor: `npm run dev`
3. Probar cada formulario:
   - `/contacto` - Formulario de contacto
   - `/vestri` - Formulario de Vestri
   - `/autos/[id]` - Formulario en detalle de vehículo

### Verificar Envío

- Revisar el email `consultas@caradvice.com.ar`
- Verificar que lleguen los 3 tipos de formularios correctamente
- Verificar formato HTML del email
- Probar casos de error (validaciones)

---

## 🐛 Solución de Problemas

### Error: "Configuración SMTP incompleta"
- Verificar que todas las variables de entorno estén configuradas
- Revisar que no haya espacios en los valores

### Error: "Invalid login"
- Gmail: Asegurarse de usar "Contraseña de aplicación", NO la contraseña normal
- Verificar que el email y contraseña sean correctos
- Verificar que la verificación en 2 pasos esté activada (para Gmail)

### Error: "Connection timeout"
- Verificar que el puerto sea correcto (587 para TLS, 465 para SSL)
- Verificar que `SMTP_SECURE` coincida con el puerto
- Revisar firewall/proxy si aplica

### Emails no llegan
- Revisar carpeta de spam
- Verificar logs del servidor
- Verificar que `EMAIL_TO` esté correcto
- Probar con otro email destino temporalmente

---

## 📝 Archivos Modificados/Creados

### Nuevos Archivos
- `app/api/leads/route.ts` - API route para envío de emails
- `components/vehicles/VehicleContactForm.tsx` - Componente formulario de vehículo
- `.env.example` - Ejemplo de variables de entorno (si se creó)

### Archivos Modificados
- `components/contacto/ContactForm.tsx` - Actualizado para usar API
- `components/vestri/ContactSection.tsx` - Actualizado para usar API
- `app/autos/[id]/page.tsx` - Integrado componente de formulario

### Dependencies
- `package.json` - Agregado nodemailer y @types/nodemailer

---

## 🎨 Interfaz Visual

**✅ IMPORTANTE**: Las interfaces visuales de los formularios NO fueron modificadas. Solo se actualizó la lógica de envío, manteniendo:
- Mismos estilos CSS
- Misma estructura HTML
- Mismos componentes de UI
- Misma experiencia de usuario

---

## 🚀 Próximos Pasos Recomendados (Opcional)

1. **Protección contra Spam**: Implementar reCAPTCHA o similar
2. **Rate Limiting**: Limitar envíos por IP
3. **Logging**: Registrar consultas en base de datos
4. **Notificaciones**: Integrar con Slack/Discord
5. **Auto-respuesta**: Enviar email de confirmación al usuario

---

## 📞 Soporte

Para cualquier problema o duda sobre la implementación, revisar:
- Logs del servidor Next.js
- Variables de entorno configuradas
- Configuración SMTP del proveedor de email

