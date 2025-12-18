import { create } from "zustand";
import { CarFilters } from "@/types/car";

interface VehicleStore {
  viewMode: "grid" | "list";
  currency: "ARS" | "USD";
  setViewMode: (mode: "grid" | "list") => void;
  setCurrency: (currency: "ARS" | "USD") => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  viewMode: "grid",
  currency: "ARS",
  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrency: (currency) => set({ currency }),
}));
