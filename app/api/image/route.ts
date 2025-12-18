import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imagePath = searchParams.get("path");

    if (!imagePath) {
      return new NextResponse("Path parameter is required", { status: 400 });
    }

    // Validar que la ruta esté dentro del directorio de uploads
    const uploadsDir = path.join(process.cwd(), "server", "uploads");
    const fullPath = path.join(uploadsDir, imagePath.replace(/^.*uploads[\\/]/, ""));

    // Verificar que el archivo esté dentro del directorio permitido
    if (!fullPath.startsWith(uploadsDir)) {
      return new NextResponse("Invalid path", { status: 403 });
    }

    // Verificar que el archivo exista
    if (!fs.existsSync(fullPath)) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Leer el archivo
    const imageBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase().slice(1);

    // Determinar el content type
    const contentType =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "png"
        ? "image/png"
        : ext === "gif"
        ? "image/gif"
        : "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
