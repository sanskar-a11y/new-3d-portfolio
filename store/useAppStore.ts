import { create } from 'zustand'

export interface TelemetryState {
  line1: string
  line2: string
  isTransition: boolean
}

interface AppState {
  isLoaded: boolean
  setLoaded: (val: boolean) => void
  cursorVariant: 'default' | 'hover' | 'hidden'
  setCursorVariant: (val: 'default' | 'hover' | 'hidden') => void
  mode: number // 0, 1, 2
  cycleMode: () => void
  setMode: (mode: number) => void
  telemetry: TelemetryState
  setTelemetry: (telemetry: TelemetryState) => void
}

export const useAppStore = create<AppState>((set) => ({
  isLoaded: false,
  setLoaded: (val) => set({ isLoaded: val }),
  cursorVariant: 'default',
  setCursorVariant: (val) => set({ cursorVariant: val }),
  mode: 0,
  cycleMode: () => set((state) => ({ mode: (state.mode + 1) % 3 })),
  setMode: (mode: number) => set({ mode }),
  telemetry: {
    line1: 'BRAIN IS OFFLINE',
    line2: 'BE BACK LATER',
    isTransition: false,
  },
  setTelemetry: (telemetry) => set({ telemetry }),
}))

