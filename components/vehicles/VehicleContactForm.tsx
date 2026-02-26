"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { trackLead } from "@/lib/meta-pixel";

interface VehicleContactFormProps {
  vehicleId: string;
  vehicleTitle: string;
  vehicleUrl: string;
  vehiclePrice?: number;
  vehiclePriceCurrency?: "ARS" | "USD";
}

export default function VehicleContactForm({
  vehicleId,
  vehicleTitle,
  vehicleUrl,
  vehiclePrice,
  vehiclePriceCurrency,
}: VehicleContactFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
    aceptaPrivacidad: false,
  });

  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    // Limpiar error al cambiar campos
    if (formStatus === "error") {
      setFormStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.aceptaPrivacidad) {
      setErrorMessage("Debes aceptar las políticas de privacidad para continuar");
      setFormStatus("error");
      return;
    }

    setFormStatus("sending");
    setErrorMessage("");

    try {
      const data = await api.post("/api/leads", {
        source: "vehicle",
        name: formData.nombre,
        email: formData.email,
        phone: formData.telefono,
        message: formData.mensaje,
        vehicle: {
          id: vehicleId,
          title: vehicleTitle,
          url: vehicleUrl,
          price: vehiclePrice,
          priceCurrency: vehiclePriceCurrency,
        },
      });

      // Éxito: disparar Lead de Meta Pixel con content_id para coincidencia de catálogo
      trackLead(vehicleId);

      setFormStatus("success");
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        mensaje: "",
        aceptaPrivacidad: false,
      });

      // Resetear después de 5 segundos
      setTimeout(() => {
        setFormStatus("idle");
      }, 5000);
    } catch (error: any) {
      console.error("Error al enviar formulario:", error);
      setFormStatus("error");
      setErrorMessage(
        error.message || "Error al enviar el mensaje. Por favor, intenta nuevamente."
      );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Contacto</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            required
            disabled={formStatus === "sending"}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email*"
            required
            disabled={formStatus === "sending"}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Teléfono"
            required
            disabled={formStatus === "sending"}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base sm:col-span-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        <textarea
          name="mensaje"
          value={formData.mensaje}
          onChange={handleChange}
          placeholder="Mensaje*"
          rows={4}
          required
          disabled={formStatus === "sending"}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
        />
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="privacy-mobile"
            name="aceptaPrivacidad"
            checked={formData.aceptaPrivacidad}
            onChange={handleChange}
            required
            disabled={formStatus === "sending"}
            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 mt-1 disabled:cursor-not-allowed"
          />
          <label htmlFor="privacy-mobile" className="text-xs sm:text-sm text-gray-600">
            Acepto las{" "}
            <Link href="/politicas" className="text-orange-500 hover:text-orange-600">
              políticas de privacidad
            </Link>
          </label>
        </div>

        {/* Mensajes de estado */}
        {formStatus === "error" && errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        {formStatus === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            ¡Mensaje enviado correctamente! Te contactaremos a la brevedad.
          </div>
        )}

        <button
          type="submit"
          disabled={formStatus === "sending"}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors text-sm sm:text-base disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {formStatus === "sending" ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </>
          ) : formStatus === "success" ? (
            "✓ Mensaje enviado"
          ) : (
            "Enviar"
          )}
        </button>
      </form>
    </div>
  );
}

