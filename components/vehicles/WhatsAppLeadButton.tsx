"use client";

import { MessageCircle } from "lucide-react";
import { trackLead } from "@/lib/meta-pixel";

interface WhatsAppLeadButtonProps {
  href: string;
  vehicleId: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Botón de WhatsApp que dispara el evento Lead del Meta Pixel con content_id
 * antes de abrir el enlace, para que Meta registre la consulta por el vehículo.
 */
export default function WhatsAppLeadButton({
  href,
  vehicleId,
  children,
  className,
}: WhatsAppLeadButtonProps) {
  const handleClick = () => {
    trackLead(vehicleId);
    // El navegador abrirá el href normalmente
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children ?? (
        <>
          <MessageCircle size={18} className="sm:w-5 sm:h-5" />
          <span>Chat via WhatsApp</span>
        </>
      )}
    </a>
  );
}
