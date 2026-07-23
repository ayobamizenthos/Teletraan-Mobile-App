import { useShallow } from 'zustand/react/shallow'
import { create } from 'zustand'
import type { FilterSelection } from '../components/camera-filter-modal'

// Shared state across the Quad-Grid and Single-Camera views so a filter or
// search typed on one is the same when the user switches to the other —
// and so taps into fullscreen-camera carry the same filter scope.

interface CameraViewState {
  filterSelections: FilterSelection[]
  searchText: string
}

interface CameraViewStore extends CameraViewState {
  setFilterSelections: (next: FilterSelection[]) => void
  setSearchText: (next: string) => void
  clear: () => void
}

const useStore = create<CameraViewStore>(set => ({
  filterSelections: [],
  searchText: '',
  setFilterSelections: next => set({ filterSelections: next }),
  setSearchText: next => set({ searchText: next }),
  clear: () => set({ filterSelections: [], searchText: '' }),
}))

// Imperative helpers — used outside React tree (haptic taps, modal apply).
export function getCameraView(): CameraViewState {
  const s = useStore.getState()
  return { filterSelections: s.filterSelections, searchText: s.searchText }
}

export function setFilterSelections(next: FilterSelection[]): void {
  useStore.getState().setFilterSelections(next)
}

export function setSearchText(next: string): void {
  useStore.getState().setSearchText(next)
}

export function clearCameraView(): void {
  useStore.getState().clear()
}

// Component subscription via Zustand. `useShallow` avoids re-renders when
// neighbouring slices change.
export function useCameraView(): CameraViewState {
  return useStore(
    useShallow(s => ({ filterSelections: s.filterSelections, searchText: s.searchText }))
  )
}
