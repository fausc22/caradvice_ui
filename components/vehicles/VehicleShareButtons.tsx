"use client";

import { Share2, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

interface VehicleShareButtonsProps {
  vehicleTitle: string;
}

export default function VehicleShareButtons({ vehicleTitle }: VehicleShareButtonsProps) {
  const pathname = usePathname();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://caradvice.com.ar";
  const shareUrl = `${baseUrl}${pathname}`;

  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`${vehicleTitle} ${shareUrl}`)}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vehicleTitle,
          text: `Mira este vehículo: ${vehicleTitle}`,
          url: shareUrl,
        });
      } catch (err) {
        // Usuario canceló o error
        console.log("Error al compartir:", err);
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copiado al portapapeles");
      } catch (err) {
        console.log("Error al copiar:", err);
      }
    }
  };

  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Compartir Publicación</h3>
      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={() => window.open(whatsappShare, "_blank")}
          className="w-11 h-11 sm:w-12 sm:h-12 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center text-white transition-colors"
          title="Compartir en WhatsApp"
          aria-label="Compartir en WhatsApp"
        >
          <MessageCircle size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={handleNativeShare}
          className="w-11 h-11 sm:w-12 sm:h-12 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center justify-center text-white transition-colors"
          title="Compartir"
          aria-label="Compartir"
        >
          <Share2 size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}

