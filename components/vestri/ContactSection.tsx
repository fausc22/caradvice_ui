"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Send, CheckCircle2, Phone, Mail } from "lucide-react";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    consulta: "",
  });

  const [formStatus, setFormStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");

    // Simulación de envío
    setTimeout(() => {
      setFormStatus("success");
      setFormData({
        nombre: "",
        telefono: "",
        consulta: "",
      });

      setTimeout(() => {
        setFormStatus("idle");
      }, 3000);
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <section id="contacto" className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título de la sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-[#192BC2] text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-4 font-[var(--font-montserrat)] leading-tight">
            Estamos para asesorarte
          </h2>
        </motion.div>

        {/* Layout de dos columnas */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Columna Izquierda - Formulario */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl shadow-xl p-6 md:p-8 lg:p-10 border border-gray-100"
            >
              <div className="space-y-5 md:space-y-6">
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="vestri-form-label block mb-2">
                    NOMBRE
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="vestri-form-input w-full"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label htmlFor="telefono" className="vestri-form-label block mb-2">
                    TELÉFONO
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    className="vestri-form-input w-full"
                  />
                </div>

                {/* Consulta */}
                <div>
                  <label htmlFor="consulta" className="vestri-form-label block mb-2">
                    CONSULTA
                  </label>
                  <textarea
                    id="consulta"
                    name="consulta"
                    value={formData.consulta}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="vestri-form-input w-full resize-none"
                  />
                </div>

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={formStatus === "sending"}
                  className="vestri-form-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {formStatus === "sending" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : formStatus === "success" ? (
                    <>
                      <CheckCircle2 size={20} />
                      ¡Consulta enviada!
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      ENVIAR CONSULTA
                    </>
                  )}
                </button>

                {formStatus === "success" && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 text-center font-semibold text-sm md:text-base"
                  >
                    ¡Gracias! Te contactaremos a la brevedad.
                  </motion.p>
                )}
              </div>
            </form>
          </motion.div>

          {/* Columna Derecha - Información del Equipo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6 md:space-y-8"
          >
            {/* Título del equipo */}
            <div className="text-center lg:text-left">
              <h3 className="text-[#192BC2] text-2xl md:text-3xl font-bold mb-3 font-[var(--font-montserrat)]">
                Equipo Vestri | Car Advice
              </h3>
              <p className="text-gray-600 text-base md:text-lg font-[var(--font-montserrat)]">
                Para más información, contactanos directamente. Estamos acá para
                ayudarte a hacer crecer tu negocio
              </p>
            </div>

            {/* Cards de contacto */}
            <div className="space-y-6">
              {/* WhatsApp */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 md:p-8 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <h4 className="text-lg md:text-xl font-bold font-[var(--font-montserrat)]">
                    Agendá nuestro número corporativo
                  </h4>
                </div>
                <a
                  href="https://wa.me/5493515158842"
                  className="text-2xl md:text-3xl font-bold hover:text-green-100 transition-colors duration-300 block mb-3 font-[var(--font-montserrat)]"
                >
                  351 515 8842
                </a>
                <p className="text-green-100 mb-6 text-sm md:text-base font-[var(--font-montserrat)]">
                  Confirmá que estás en nuestra lista de difusión para recibir
                  las oportunidades disponibles.
                </p>
                <a
                  href="https://wa.me/5493515158842"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-lg transition-all duration-300 font-[var(--font-montserrat)] hover:scale-105"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Abrir WhatsApp
                </a>
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 md:p-8 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <h4 className="text-lg md:text-xl font-bold font-[var(--font-montserrat)]">
                    Consultá por unidades disponibles
                  </h4>
                </div>
                <p className="text-orange-100 mb-4 text-sm md:text-base font-[var(--font-montserrat)]">
                  Consultá por unidades disponibles y condiciones según tus
                  necesidades.
                </p>
                <p className="text-orange-100 mb-6 text-sm md:text-base font-[var(--font-montserrat)]">
                  Comenzá a operar con nosotros y aprovechá las mejores
                  oportunidades.
                </p>
                <a
                  href="mailto:vestri@caradvice.com.ar"
                  className="text-xl md:text-2xl font-bold hover:text-orange-100 transition-colors duration-300 block font-[var(--font-montserrat)] break-all"
                >
                  vestri@caradvice.com.ar
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

