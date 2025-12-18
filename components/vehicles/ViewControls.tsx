"use client";

import { Grid, List, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ViewControlsProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  onSortChange: (sortBy: string, sortOrder: "ASC" | "DESC") => void;
}

const sortOptions = [
  { value: "created_at-DESC", label: "Fecha: Más nueva" },
  { value: "created_at-ASC", label: "Fecha: Más antigua" },
  { value: "price-DESC", label: "Precio: Mayor a menor" },
  { value: "price-ASC", label: "Precio: Menor a mayor" },
  { value: "year-DESC", label: "Año: Más nuevo" },
  { value: "year-ASC", label: "Año: Más antiguo" },
  { value: "kilometres-ASC", label: "Km: Menor a mayor" },
  { value: "kilometres-DESC", label: "Km: Mayor a menor" },
  { value: "title-ASC", label: "Nombre: A-Z" },
  { value: "title-DESC", label: "Nombre: Z-A" },
];

export default function ViewControls({
  viewMode,
  onViewModeChange,
  sortBy,
  sortOrder,
  onSortChange,
}: ViewControlsProps) {
  const [openSortDropdown, setOpenSortDropdown] = useState(false);
  const currentSortValue = `${sortBy}-${sortOrder}`;
  const currentSortLabel = sortOptions.find(opt => opt.value === currentSortValue)?.label || "Ordenar por";

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (openSortDropdown) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.sort-dropdown-container')) {
          setOpenSortDropdown(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openSortDropdown]);

  const handleSortSelect = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-");
    onSortChange(newSortBy, newSortOrder as "ASC" | "DESC");
    setOpenSortDropdown(false);
  };

  return (
    <div className="font-antenna flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
      {/* Toggle de vista - Oculto en mobile */}
      <div className="hidden sm:flex items-center gap-2 border rounded-lg p-1">
        <button
          onClick={() => onViewModeChange("grid")}
          className={cn(
            "p-2 rounded transition-colors",
            viewMode === "grid"
              ? "bg-orange-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          )}
          aria-label="Vista de cuadrícula"
        >
          <Grid size={20} />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={cn(
            "p-2 rounded transition-colors",
            viewMode === "list"
              ? "bg-orange-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          )}
          aria-label="Vista de lista"
        >
          <List size={20} />
        </button>
      </div>

      {/* Ordenamiento con dropdown personalizado */}
      <div className="sort-dropdown-container flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:flex-initial">
        <label className="text-sm text-gray-600 hidden sm:inline">Ordenar por:</label>
        <label className="text-sm text-gray-600 sm:hidden">Ordenar:</label>
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setOpenSortDropdown(!openSortDropdown)}
            className={cn(
              "w-full sm:w-auto bg-white rounded-full px-4 py-2 text-sm font-medium text-gray-700 flex items-center justify-between border border-gray-200 hover:border-orange-500 transition-colors",
              openSortDropdown && "ring-2 ring-orange-500 border-orange-500"
            )}
          >
            <span className="truncate">{currentSortLabel}</span>
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform flex-shrink-0 ml-2",
                openSortDropdown && "rotate-180"
              )}
            />
          </button>
          {openSortDropdown && (
            <div className="absolute z-50 mt-1 w-full sm:w-auto min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              {sortOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer",
                    currentSortValue === option.value && "bg-orange-50 text-orange-600 font-medium"
                  )}
                  onClick={() => handleSortSelect(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar dropdown */}
      {openSortDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenSortDropdown(false)}
        />
      )}
    </div>
  );
}
