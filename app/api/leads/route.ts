import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Marcar como dinámica para evitar renderizado estático
export const dynamic = 'force-dynamic';

// Validación básica de email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitizar strings para prevenir inyección
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 5000); // Limitar longitud
}

// Validar y sanitizar los datos
function validateAndSanitize(data: any) {
  const errors: string[] = [];

  // Validar source
  if (!data.source || !['vehicle', 'contact', 'vestri'].includes(data.source)) {
    errors.push('Source debe ser: vehicle, contact o vestri');
  }

  // Validar nombre (requerido)
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Nombre es requerido (mínimo 2 caracteres)');
  }

  // Validar teléfono (requerido)
  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length < 8) {
    errors.push('Teléfono es requerido (mínimo 8 caracteres)');
  }

  // Validar email (requerido para contact y vehicle, opcional para vestri)
  if (data.source !== 'vestri') {
    if (!data.email || !isValidEmail(data.email)) {
      errors.push('Email válido es requerido');
    }
  } else if (data.email && !isValidEmail(data.email)) {
    errors.push('Email no válido');
  }

  // Validar mensaje (requerido)
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 5) {
    errors.push('Mensaje es requerido (mínimo 5 caracteres)');
  }

  if (errors.length > 0) {
    return { valid: false, errors, data: null };
  }

  // Sanitizar datos
  const sanitized = {
    source: data.source,
    name: sanitizeString(data.name),
    email: data.email ? sanitizeString(data.email) : '',
    phone: sanitizeString(data.phone),
    message: sanitizeString(data.message),
    vehicle: data.vehicle || null,
  };

  return { valid: true, errors: [], data: sanitized };
}

// Crear transporter de nodemailer
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  // Verificar variables de entorno
  const missingVars: string[] = [];
  if (!host) missingVars.push('SMTP_HOST');
  if (!user) missingVars.push('SMTP_USER');
  if (!pass) missingVars.push('SMTP_PASS');

  if (missingVars.length > 0) {
    const errorMsg = `Configuración SMTP incompleta. Faltan las siguientes variables de entorno: ${missingVars.join(', ')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  } catch (error: any) {
    console.error('Error al crear transporter de nodemailer:', error);
    throw new Error(`Error al configurar el servicio de email: ${error.message}`);
  }
}

// Formatear el email según el origen
function formatEmailContent(data: {
  source: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicle?: any;
}) {
  const sourceNames: Record<string, string> = {
    vehicle: 'Consulta desde Detalle de Vehículo',
    contact: 'Consulta desde Página de Contacto',
    vestri: 'Consulta desde Vestri',
  };

  const subject = `[CAR ADVICE] ${sourceNames[data.source] || 'Nueva Consulta'}`;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f97316; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #374151; margin-bottom: 5px; display: block; }
        .value { color: #1f2937; padding: 8px; background-color: white; border-radius: 4px; }
        .vehicle-info { background-color: #fff3cd; border-left: 4px solid #f97316; padding: 15px; margin-top: 15px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${sourceNames[data.source] || 'Nueva Consulta'}</h1>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Nombre:</span>
            <div class="value">${data.name}</div>
          </div>
          
          ${data.email ? `
          <div class="field">
            <span class="label">Email:</span>
            <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
          </div>
          ` : ''}
          
          <div class="field">
            <span class="label">Teléfono:</span>
            <div class="value"><a href="tel:${data.phone}">${data.phone}</a></div>
          </div>
          
          <div class="field">
            <span class="label">Mensaje:</span>
            <div class="value" style="white-space: pre-wrap;">${data.message}</div>
          </div>
          
          ${data.vehicle ? `
          <div class="vehicle-info">
            <h3 style="margin-top: 0; color: #92400e;">Información del Vehículo</h3>
            <div class="field">
              <span class="label">Vehículo:</span>
              <div class="value">${data.vehicle.title || 'N/A'}</div>
            </div>
            ${data.vehicle.id ? `
            <div class="field">
              <span class="label">ID:</span>
              <div class="value">${data.vehicle.id}</div>
            </div>
            ` : ''}
            ${data.vehicle.url ? `
            <div class="field">
              <span class="label">URL:</span>
              <div class="value"><a href="${data.vehicle.url}" target="_blank">Ver vehículo</a></div>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div class="field" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <span class="label">Origen del formulario:</span>
            <div class="value">${sourceNames[data.source] || data.source}</div>
          </div>
        </div>
        <div class="footer">
          <p>Este email fue generado automáticamente desde el formulario de contacto de CAR ADVICE.</p>
          <p>Fecha: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Versión texto plano
  let text = `${sourceNames[data.source] || 'Nueva Consulta'}\n\n`;
  text += `Nombre: ${data.name}\n`;
  if (data.email) text += `Email: ${data.email}\n`;
  text += `Teléfono: ${data.phone}\n`;
  text += `Mensaje: ${data.message}\n\n`;
  if (data.vehicle) {
    text += `Información del Vehículo:\n`;
    text += `Vehículo: ${data.vehicle.title || 'N/A'}\n`;
    if (data.vehicle.id) text += `ID: ${data.vehicle.id}\n`;
    if (data.vehicle.url) text += `URL: ${data.vehicle.url}\n`;
    text += `\n`;
  }
  text += `Origen: ${sourceNames[data.source] || data.source}\n`;
  text += `Fecha: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}\n`;

  return { subject, html, text };
}

export async function POST(request: NextRequest) {
  try {
    // Parsear el body
    const body = await request.json();

    // Validar y sanitizar
    const validation = validateAndSanitize(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.errors },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Verificar variables de entorno antes de continuar
    const missingVars: string[] = [];
    if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
    if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
    if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS');

    if (missingVars.length > 0) {
      console.error(`Variables de entorno faltantes en Vercel: ${missingVars.join(', ')}`);
      return NextResponse.json(
        { 
          error: 'Error de configuración del servidor',
          message: 'El servicio de email no está configurado correctamente. Por favor, contacta al administrador.',
          details: process.env.NODE_ENV === 'development' ? `Faltan: ${missingVars.join(', ')}` : undefined
        },
        { status: 500 }
      );
    }

    // Crear transporter
    const transporter = createTransporter();

    // Formatear contenido del email
    const emailContent = formatEmailContent(data);

    // Email destino
    const toEmail = process.env.EMAIL_TO || 'consultas@caradvice.com.ar';

    // Configurar email
    const mailOptions = {
      from: `"CAR ADVICE - Formulario Web" <${process.env.SMTP_USER}>`,
      to: toEmail,
      replyTo: data.email || process.env.SMTP_USER,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Consulta enviada correctamente' },
      { status: 200 }
    );
  } catch (error: any) {
    // Log completo del error para debugging
    console.error('Error al enviar email:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      responseCode: error.responseCode,
      response: error.response,
    });

    // Determinar el tipo de error
    let errorMessage = 'Error al enviar la consulta. Por favor, intenta nuevamente más tarde.';
    let statusCode = 500;

    if (error.message?.includes('Configuración SMTP incompleta')) {
      errorMessage = 'Error de configuración del servidor. Por favor, contacta al administrador.';
      statusCode = 500;
    } else if (error.code === 'EAUTH' || error.responseCode === 535) {
      errorMessage = 'Error de autenticación. Verifica las credenciales SMTP.';
      statusCode = 500;
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Error de conexión con el servidor de email. Por favor, intenta más tarde.';
      statusCode = 503;
    }

    // En desarrollo, mostrar más detalles
    const details = process.env.NODE_ENV === 'development' 
      ? error.message 
      : undefined;

    return NextResponse.json(
      { 
        error: 'Error al enviar consulta', 
        message: errorMessage,
        details 
      },
      { status: statusCode }
    );
  }
}

