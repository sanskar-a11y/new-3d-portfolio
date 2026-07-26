import { create } from 'zustand'

interface AppState {
  isLoaded: boolean
  setLoaded: (val: boolean) => void
  cursorVariant: 'default' | 'hover' | 'hidden'
  setCursorVariant: (val: 'default' | 'hover' | 'hidden') => void
  mode: number // 0, 1, 2
  cycleMode: () => void
}

export const useAppStore = create<AppState>((set) => ({
  isLoaded: false,
  setLoaded: (val) => set({ isLoaded: val }),
  cursorVariant: 'default',
  setCursorVariant: (val) => set({ cursorVariant: val }),
  mode: 0,
  cycleMode: () => set((state) => ({ mode: (state.mode + 1) % 3 })),
}))

