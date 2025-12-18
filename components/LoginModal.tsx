"use client";

import { useState } from "react";
import { X, Mail, Lock } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Ingrese a su cuenta</h2>
          <p className="text-gray-600">¡Bienvenido de nuevo! Iniciar sesión en su cuenta</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de usuario
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Usuario"
                minLength={4}
                required
              />
              <Mail
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              El nombre de usuario debe tener al menos 4 letras.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Contraseña"
                minLength={6}
                required
              />
              <Lock
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              La contraseña debe tener al menos 6 letras.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.remember}
                onChange={(e) =>
                  setFormData({ ...formData, remember: e.target.checked })
                }
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className="text-sm text-gray-700">Recordar</span>
            </label>
            <a
              href="#"
              className="text-sm text-accent hover:text-accent-hover"
            >
              Olvidé contraseña
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white py-2 rounded hover:bg-accent-hover transition-colors font-medium"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

