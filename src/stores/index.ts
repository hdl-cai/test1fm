/**
 * Stores Index
 * Central export for all Zustand stores
 */

export { useFarmsStore } from './useFarmsStore';
export { useSensorsStore } from './useSensorsStore';
export { useInventoryStore } from './useInventoryStore';
export { useCyclesStore } from './useCyclesStore';
export { usePersonnelStore } from './usePersonnelStore';
export { useUIStore } from './useUIStore';

// Import and re-export types
import type { FarmsState } from './useFarmsStore';
import type { SensorsState } from './useSensorsStore';
import type { InventoryState } from './useInventoryStore';
import type { CyclesState } from './useCyclesStore';
import type { PersonnelState } from './usePersonnelStore';
import type { UIState } from './useUIStore';

export type { FarmsState, SensorsState, InventoryState, CyclesState, PersonnelState, UIState };
