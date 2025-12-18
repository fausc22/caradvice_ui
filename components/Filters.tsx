"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

interface FilterOption {
  label: string;
  count?: number;
}

interface FilterSection {
  title: string;
  options: FilterOption[];
}

interface FiltersProps {
  filtersCount: number;
  resultsCount: number;
  onFilterChange?: (filters: any) => void;
}

export default function Filters({
  filtersCount,
  resultsCount,
  onFilterChange,
}: FiltersProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const filterSections: FilterSection[] = [
    { title: "Condición", options: [{ label: "Usado" }, { label: "Nuevo" }] },
    {
      title: "Tipo",
      options: [
        { label: "Sedán" },
        { label: "SUV" },
        { label: "Pickup" },
        { label: "Hatchback" },
      ],
    },
    {
      title: "Marca",
      options: [
        { label: "Toyota" },
        { label: "Ford" },
        { label: "Volkswagen" },
        { label: "Fiat" },
        { label: "Jeep" },
      ],
    },
    {
      title: "Transmisión",
      options: [{ label: "Manual" }, { label: "Automático" }],
    },
    {
      title: "Combustible",
      options: [{ label: "Nafta" }, { label: "Diesel" }],
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Filtros</h2>
          {filtersCount > 0 && (
            <span className="bg-accent text-white px-3 py-1 rounded-full text-sm">
              {filtersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">
            {resultsCount} Resultados
          </span>
          {filtersCount > 0 && (
            <button className="text-accent hover:text-accent-hover font-medium">
              Borrar todo
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filterSections.map((section, index) => {
          const isSectionExpanded = expandedSections.has(index);
          return (
            <div key={index} className="border-b pb-4 last:border-0">
              <button
                className="flex items-center justify-between w-full text-left font-semibold mb-2 hover:text-accent transition-colors"
                onClick={() => toggleSection(index)}
              >
                <span>{section.title}</span>
                <ChevronDown
                  size={20}
                  className={`transform transition-transform ${
                    isSectionExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isSectionExpanded && (
                <div className="space-y-2 mt-2">
                  {section.options.map((option, optIndex) => (
                    <label
                      key={optIndex}
                      className="flex items-center gap-2 cursor-pointer hover:text-accent transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-accent focus:ring-accent"
                      />
                      <span>
                        {option.label}
                        {option.count !== undefined && (
                          <span className="text-gray-500 ml-1">
                            ({option.count})
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t">
        <button
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="text-accent hover:text-accent-hover font-medium transition-colors"
        >
          {showMoreFilters ? "Menos filtros" : "Más filtros"}
        </button>
      </div>
    </div>
  );
}

