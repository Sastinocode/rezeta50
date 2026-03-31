'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ZoneCode, ZoneSide } from '@/types/database'

// ── Tipos del store ───────────────────────────────────────────────────────────

export interface ZoneAnswers {
  pain_level: number        // 0–10
  duration: string          // 'less_1w' | '1w_1m' | '1m_6m' | 'more_6m'
  frequency: string         // 'occasional' | 'weekly' | 'daily' | 'constant'
  functional_limit: string  // 'none' | 'mild' | 'moderate' | 'severe'
  prior_diagnosis: boolean
  prior_diagnosis_text?: string
  prior_injury: string      // 'none' | 'recent' | 'chronic'
}

export interface ZoneSelection {
  zone_code: ZoneCode
  side: ZoneSide
  answers?: ZoneAnswers
}

export interface GlobalAnswers {
  activity_level?: string   // 'sedentary' | 'walking' | 'exercise_1_2' | 'exercise_3_plus' | 'athlete'
  goals?: string[]
  age_range?: string        // '<30' | '30-45' | '46-60' | '>60'
  floor_exercises?: string  // 'yes' | 'difficulty' | 'no'
}

export type Step = 'bodymap' | 'zone_detail' | 'global' | 'complete'

interface QuestionnaireState {
  selectedZones: ZoneSelection[]
  currentStep: Step
  currentZoneIndex: number
  currentGlobalQuestion: number   // 0–3
  globalAnswers: GlobalAnswers

  // Actions
  toggleZone: (zone_code: ZoneCode, side: ZoneSide) => void
  saveZoneAnswers: (index: number, answers: ZoneAnswers) => void
  saveGlobalAnswers: (partial: Partial<GlobalAnswers>) => void
  nextStep: () => void
  prevStep: () => void
  nextZone: () => void
  prevZone: () => void
  nextGlobalQuestion: () => void
  prevGlobalQuestion: () => void
  reset: () => void
}

// ── Store ─────────────────────────────────────────────────────────────────────

const initialState = {
  selectedZones: [] as ZoneSelection[],
  currentStep: 'bodymap' as Step,
  currentZoneIndex: 0,
  currentGlobalQuestion: 0,
  globalAnswers: {} as GlobalAnswers,
}

export const useQuestionnaireStore = create<QuestionnaireState>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleZone: (zone_code, side) =>
        set((state) => {
          const exists = state.selectedZones.some(
            (z) => z.zone_code === zone_code && z.side === side
          )
          if (exists) {
            return {
              selectedZones: state.selectedZones.filter(
                (z) => !(z.zone_code === zone_code && z.side === side)
              ),
            }
          }
          return {
            selectedZones: [...state.selectedZones, { zone_code, side }],
          }
        }),

      saveZoneAnswers: (index, answers) =>
        set((state) => {
          const zones = [...state.selectedZones]
          if (zones[index]) {
            zones[index] = { ...zones[index], answers }
          }
          return { selectedZones: zones }
        }),

      saveGlobalAnswers: (partial) =>
        set((state) => ({
          globalAnswers: { ...state.globalAnswers, ...partial },
        })),

      nextStep: () =>
        set((state) => {
          const steps: Step[] = ['bodymap', 'zone_detail', 'global', 'complete']
          const idx = steps.indexOf(state.currentStep)
          if (idx < steps.length - 1) {
            return { currentStep: steps[idx + 1], currentZoneIndex: 0, currentGlobalQuestion: 0 }
          }
          return {}
        }),

      prevStep: () =>
        set((state) => {
          const steps: Step[] = ['bodymap', 'zone_detail', 'global', 'complete']
          const idx = steps.indexOf(state.currentStep)
          if (idx > 0) {
            const prevStep = steps[idx - 1]
            // Al volver a zone_detail ir a la última zona
            const prevZoneIndex =
              prevStep === 'zone_detail'
                ? Math.max(0, state.selectedZones.length - 1)
                : 0
            return { currentStep: prevStep, currentZoneIndex: prevZoneIndex }
          }
          return {}
        }),

      nextZone: () =>
        set((state) => {
          const next = state.currentZoneIndex + 1
          if (next >= state.selectedZones.length) {
            return { currentStep: 'global', currentZoneIndex: 0, currentGlobalQuestion: 0 }
          }
          return { currentZoneIndex: next }
        }),

      prevZone: () =>
        set((state) => {
          const prev = state.currentZoneIndex - 1
          if (prev < 0) {
            return { currentStep: 'bodymap', currentZoneIndex: 0 }
          }
          return { currentZoneIndex: prev }
        }),

      nextGlobalQuestion: () =>
        set((state) => {
          const next = state.currentGlobalQuestion + 1
          if (next >= 4) {
            return { currentStep: 'complete' }
          }
          return { currentGlobalQuestion: next }
        }),

      prevGlobalQuestion: () =>
        set((state) => {
          const prev = state.currentGlobalQuestion - 1
          if (prev < 0) {
            const lastZone = Math.max(0, state.selectedZones.length - 1)
            return { currentStep: 'zone_detail', currentZoneIndex: lastZone }
          }
          return { currentGlobalQuestion: prev }
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'rezeta50-questionnaire',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : localStorage
      ),
    }
  )
)

// ── Helpers ───────────────────────────────────────────────────────────────────

export function isZoneSelected(
  zones: ZoneSelection[],
  zone_code: ZoneCode,
  side: ZoneSide
): boolean {
  return zones.some((z) => z.zone_code === zone_code && z.side === side)
}
