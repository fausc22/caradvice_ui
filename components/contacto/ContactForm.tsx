"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
    aceptaPrivacidad: false,
  });

  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.aceptaPrivacidad) {
      alert("Debes aceptar las políticas de privacidad para continuar");
      return;
    }

    setFormStatus("sending");

    // Redirigir a WhatsApp con el mensaje
    const mensaje = encodeURIComponent(
      `Hola, mi nombre es ${formData.nombre}, mi teléfono es ${formData.telefono}, mi email es ${formData.email}. ${formData.mensaje}`
    );
    
    setTimeout(() => {
      window.open(`https://wa.link/q5z6lg?text=${mensaje}`, "_blank");
      setFormStatus("success");
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        mensaje: "",
        aceptaPrivacidad: false,
      });

      setTimeout(() => {
        setFormStatus("idle");
      }, 3000);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
      {/* Nombre */}
      <div className="mb-6">
        <label htmlFor="nombre" className="block text-gray-700 font-semibold mb-2">
          Nombre completo *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
          placeholder="Tu nombre"
        />
      </div>

      {/* Email */}
      <div className="mb-6">
        <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
          placeholder="tu@email.com"
        />
      </div>

      {/* Teléfono */}
      <div className="mb-6">
        <label htmlFor="telefono" className="block text-gray-700 font-semibold mb-2">
          Teléfono *
        </label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
          placeholder="351 515 8848"
        />
      </div>

      {/* Mensaje */}
      <div className="mb-6">
        <label htmlFor="mensaje" className="block text-gray-700 font-semibold mb-2">
          Mensaje *
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          value={formData.mensaje}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none"
          placeholder="Contanos en qué podemos ayudarte..."
        />
      </div>

      {/* Checkbox Privacidad */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="aceptaPrivacidad"
            checked={formData.aceptaPrivacidad}
            onChange={handleChange}
            required
            className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
          />
          <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
            Acepto las{" "}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold">
              políticas de privacidad
            </a>
          </span>
        </label>
      </div>

      {/* Botón Submit */}
      <motion.button
        type="submit"
        disabled={formStatus === "sending"}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 sm:py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-sm sm:text-base"
        whileHover={{ scale: formStatus === "sending" ? 1 : 1.02 }}
        whileTap={{ scale: formStatus === "sending" ? 1 : 0.98 }}
      >
        {formStatus === "sending" ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Enviando...
          </>
        ) : formStatus === "success" ? (
          <>
            <span>✓</span>
            ¡Mensaje enviado!
          </>
        ) : (
          <>
            <Send size={20} />
            Enviar
          </>
        )}
      </motion.button>

      {formStatus === "success" && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-green-600 text-center font-semibold"
        >
          ¡Gracias por contactarnos! Te responderemos a la brevedad.
        </motion.p>
      )}
    </form>
  );
}

