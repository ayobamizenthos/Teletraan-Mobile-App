import { useShallow } from 'zustand/react/shallow'
import { create } from 'zustand'

export interface ActiveFilters {
  cameras: string[]
  locations: string[]
  tags: string[]
  threatLevel: number
  dateFrom: string
  dateTo: string
  hour: string
  minute: string
  second: string
  ampm: 'AM' | 'PM'
}

export const EMPTY_FILTERS: ActiveFilters = {
  cameras: [],
  locations: [],
  tags: [],
  threatLevel: 0,
  dateFrom: '',
  dateTo: '',
  hour: '',
  minute: '',
  second: '',
  ampm: 'AM',
}

interface FilterStore {
  filters: ActiveFilters
  set: (next: ActiveFilters) => void
  clear: () => void
}

// Zustand singleton — survives Fast-Refresh / HMR (Zustand stores live on
// module scope; module re-evaluation under HMR re-imports the same store).
const useStore = create<FilterStore>(set => ({
  filters: { ...EMPTY_FILTERS },
  set: next => set({ filters: next }),
  clear: () => set({ filters: { ...EMPTY_FILTERS } }),
}))

// Imperative helpers preserved for non-React callers (modal apply, page chip
// removal). Backed by Zustand under the hood.
export function getActiveFilters(): ActiveFilters {
  return useStore.getState().filters
}

export function setActiveFilters(f: ActiveFilters): void {
  useStore.getState().set(f)
}

export function clearActiveFilters(): void {
  useStore.getState().clear()
}

export function hasActiveFilters(): boolean {
  const f = useStore.getState().filters
  return (
    f.cameras.length > 0 ||
    f.locations.length > 0 ||
    f.tags.length > 0 ||
    f.threatLevel > 0 ||
    f.dateFrom.length > 0 ||
    f.dateTo.length > 0 ||
    f.hour.length > 0 ||
    f.minute.length > 0
  )
}

// Component subscription. `useShallow` skips re-renders when an unrelated
// part of the store changes (we only have `filters` here, but keeps the
// pattern correct for future additions).
export function useActiveFilters(): ActiveFilters {
  return useStore(useShallow(s => s.filters))
}
