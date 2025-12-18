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
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShare = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(vehicleTitle)}`;

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
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Compartir Publicación</h3>
      <div className="flex gap-3">
        <button
          onClick={() => window.open(whatsappShare, "_blank")}
          className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center text-white transition-colors"
          title="Compartir en WhatsApp"
          aria-label="Compartir en WhatsApp"
        >
          <MessageCircle size={20} />
        </button>
        <button
          onClick={() => window.open(facebookShare, "_blank")}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-colors"
          title="Compartir en Facebook"
          aria-label="Compartir en Facebook"
        >
          <Share2 size={20} />
        </button>
        <button
          onClick={handleNativeShare}
          className="w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center justify-center text-white transition-colors"
          title="Compartir"
          aria-label="Compartir"
        >
          <Share2 size={20} />
        </button>
        <button
          onClick={() => window.open(twitterShare, "_blank")}
          className="w-12 h-12 bg-black hover:bg-gray-800 rounded-lg flex items-center justify-center text-white transition-colors"
          title="Compartir en X (Twitter)"
          aria-label="Compartir en X (Twitter)"
        >
          <span className="text-white font-bold text-lg">X</span>
        </button>
      </div>
    </div>
  );
}

