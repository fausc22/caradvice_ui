import { create } from "zustand";
import { Car } from "@/types/car";

interface ComparisonStore {
  selectedVehicles: number[]; // IDs de vehículos seleccionados
  vehicles: Map<number, Car>; // Cache de datos de vehículos
  maxSelection: number;
  addVehicle: (vehicle: Car) => boolean; // Retorna true si se agregó, false si ya está en el límite
  removeVehicle: (vehicleId: number) => void;
  toggleVehicle: (vehicle: Car) => boolean; // Retorna true si se agregó, false si se removió o no se pudo agregar
  isSelected: (vehicleId: number) => boolean;
  clearSelection: () => void;
  getSelectedVehicles: () => Car[];
  getSelectedCount: () => number;
}

export const useComparisonStore = create<ComparisonStore>((set, get) => ({
  selectedVehicles: [],
  vehicles: new Map(),
  maxSelection: 5,

  addVehicle: (vehicle: Car) => {
    const state = get();
    
    // Si ya está seleccionado, no hacer nada
    if (state.selectedVehicles.includes(vehicle.id)) {
      return false;
    }

    // Si ya alcanzó el límite, no agregar
    if (state.selectedVehicles.length >= state.maxSelection) {
      return false;
    }

    set((state) => {
      const newVehicles = new Map(state.vehicles);
      newVehicles.set(vehicle.id, vehicle);
      
      return {
        selectedVehicles: [...state.selectedVehicles, vehicle.id],
        vehicles: newVehicles,
      };
    });

    return true;
  },

  removeVehicle: (vehicleId: number) => {
    set((state) => {
      const newSelected = state.selectedVehicles.filter((id) => id !== vehicleId);
      const newVehicles = new Map(state.vehicles);
      newVehicles.delete(vehicleId);
      
      return {
        selectedVehicles: newSelected,
        vehicles: newVehicles,
      };
    });
  },

  toggleVehicle: (vehicle: Car) => {
    const state = get();
    
    if (state.isSelected(vehicle.id)) {
      state.removeVehicle(vehicle.id);
      return false; // Se removió
    } else {
      const added = state.addVehicle(vehicle);
      return added; // true si se agregó, false si no se pudo (límite alcanzado)
    }
  },

  isSelected: (vehicleId: number) => {
    return get().selectedVehicles.includes(vehicleId);
  },

  clearSelection: () => {
    set({
      selectedVehicles: [],
      vehicles: new Map(),
    });
  },

  getSelectedVehicles: () => {
    const state = get();
    return state.selectedVehicles
      .map((id) => state.vehicles.get(id))
      .filter((vehicle): vehicle is Car => vehicle !== undefined);
  },

  getSelectedCount: () => {
    return get().selectedVehicles.length;
  },
}));

