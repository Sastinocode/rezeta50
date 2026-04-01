'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ZoneCode, ZoneSide } from '@/types/database'

// ── Tipos ────────────────────────────────────────────────────────────────────

export type PrehabStep =
  | 'sport'
  | 'profile'
  | 'load'
  | 'goals'
  | 'injury_history'
  | 'soreness'
  | 'complete'

export interface InjuryZone {
  code: ZoneCode
  side: ZoneSide
  timing: 'recent' | 'old' | 'chronic' // recent=<6m, old=>6m, chronic=recurrente
}

export interface SorenessZone {
  code: ZoneCode
  side: ZoneSide
  intensity: 1 | 2 | 3 // 1=leve, 2=moderada, 3=intensa
}

export interface PrehabGoals {
  prevention: number    // 1-5
  flexibility: number   // 1-5
  strength: number      // 1-5
  speed: number         // 1-5
  stress: number        // 1-5
  performance: number   // 1-5
}

interface PrehabState {
  currentStep: PrehabStep

  // Step 1: Deporte
  sport: string | null

  // Step 2: Perfil del atleta
  ageRange: string | null   // '<18' | '18-30' | '31-45' | '46-60' | '>60'
  level: string | null      // 'amateur' | 'semipro' | 'elite'
  season: string | null     // 'pre' | 'in' | 'post' | 'off'

  // Step 3: Carga de entrenamiento
  trainingDays: string | null  // '1-2' | '3-4' | '5-6' | '7+'
  intensity: number | null     // 1-5
  sessionHours: string | null  // '<1' | '1-2' | '>2'

  // Step 4: Objetivos
  goals: Partial<PrehabGoals>

  // Step 5: Historial de lesiones
  injuryZones: InjuryZone[]

  // Step 6: Molestias actuales
  sorenessZones: SorenessZone[]

  // Acciones
  setSport: (sport: string) => void
  setProfile: (data: { ageRange: string; level: string; season: string }) => void
  setLoad: (data: { trainingDays: string; intensity: number; sessionHours: string }) => void
  setGoals: (goals: Partial<PrehabGoals>) => void
  toggleInjuryZone: (code: ZoneCode, side: ZoneSide) => void
  setInjuryTiming: (code: ZoneCode, side: ZoneSide, timing: InjuryZone['timing']) => void
  toggleSorenessZone: (code: ZoneCode, side: ZoneSide) => void
  setSorenessIntensity: (code: ZoneCode, side: ZoneSide, intensity: SorenessZone['intensity']) => void
  goToStep: (step: PrehabStep) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

// ── Orden de pasos ────────────────────────────────────────────────────────────

const STEPS: PrehabStep[] = ['sport', 'profile', 'load', 'goals', 'injury_history', 'soreness', 'complete']

// ── Estado inicial ────────────────────────────────────────────────────────────

const initialState = {
  currentStep: 'sport' as PrehabStep,
  sport: null,
  ageRange: null,
  level: null,
  season: null,
  trainingDays: null,
  intensity: null,
  sessionHours: null,
  goals: {} as Partial<PrehabGoals>,
  injuryZones: [] as InjuryZone[],
  sorenessZones: [] as SorenessZone[],
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const usePrehabStore = create<PrehabState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSport: (sport) => set({ sport }),

      setProfile: ({ ageRange, level, season }) => set({ ageRange, level, season }),

      setLoad: ({ trainingDays, intensity, sessionHours }) =>
        set({ trainingDays, intensity, sessionHours }),

      setGoals: (goals) =>
        set((state) => ({ goals: { ...state.goals, ...goals } })),

      toggleInjuryZone: (code, side) =>
        set((state) => {
          const exists = state.injuryZones.some(
            (z) => z.code === code && z.side === side
          )
          if (exists) {
            return {
              injuryZones: state.injuryZones.filter(
                (z) => !(z.code === code && z.side === side)
              ),
            }
          }
          return {
            injuryZones: [...state.injuryZones, { code, side, timing: 'old' }],
          }
        }),

      setInjuryTiming: (code, side, timing) =>
        set((state) => ({
          injuryZones: state.injuryZones.map((z) =>
            z.code === code && z.side === side ? { ...z, timing } : z
          ),
        })),

      toggleSorenessZone: (code, side) =>
        set((state) => {
          const exists = state.sorenessZones.some(
            (z) => z.code === code && z.side === side
          )
          if (exists) {
            return {
              sorenessZones: state.sorenessZones.filter(
                (z) => !(z.code === code && z.side === side)
              ),
            }
          }
          return {
            sorenessZones: [...state.sorenessZones, { code, side, intensity: 1 }],
          }
        }),

      setSorenessIntensity: (code, side, intensity) =>
        set((state) => ({
          sorenessZones: state.sorenessZones.map((z) =>
            z.code === code && z.side === side ? { ...z, intensity } : z
          ),
        })),

      goToStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep } = get()
        const idx = STEPS.indexOf(currentStep)
        if (idx < STEPS.length - 1) {
          set({ currentStep: STEPS[idx + 1] })
        }
      },

      prevStep: () => {
        const { currentStep } = get()
        const idx = STEPS.indexOf(currentStep)
        if (idx > 0) {
          set({ currentStep: STEPS[idx - 1] })
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'rezeta50-prehab',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : localStorage
      ),
    }
  )
)

// ── Helpers ───────────────────────────────────────────────────────────────────

export function isInjuryZoneSelected(
  zones: InjuryZone[],
  code: ZoneCode,
  side: ZoneSide
): boolean {
  return zones.some((z) => z.code === code && z.side === side)
}

export function isSorenessZoneSelected(
  zones: SorenessZone[],
  code: ZoneCode,
  side: ZoneSide
): boolean {
  return zones.some((z) => z.code === code && z.side === side)
}
