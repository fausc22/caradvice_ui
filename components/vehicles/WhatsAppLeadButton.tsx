"use client";

import { MessageCircle } from "lucide-react";
import { trackLead } from "@/lib/meta-pixel";

interface WhatsAppLeadButtonProps {
  href: string;
  vehicleId: string;
  children?: React.ReactNode;
  className?: string;
}

const LEAD_DELAY_MS = 300;

export default function WhatsAppLeadButton({
  href,
  vehicleId,
  children,
  className,
}: WhatsAppLeadButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    trackLead(vehicleId);
    setTimeout(() => {
      window.open(href, "_blank", "noopener,noreferrer");
    }, LEAD_DELAY_MS);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
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
