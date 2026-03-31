'use client'

import { cn } from '@/lib/utils'
import type { Step } from '@/store/questionnaireStore'

interface ProgressBarProps {
  currentStep: Step
  totalZones: number
  currentZoneIndex: number
  currentGlobalQuestion: number
}

const STEPS = [
  { key: 'bodymap',     label: 'Zonas',    short: '1' },
  { key: 'zone_detail', label: 'Detalle',  short: '2' },
  { key: 'global',      label: 'General',  short: '3' },
] as const

export default function ProgressBar({
  currentStep,
  totalZones,
  currentZoneIndex,
  currentGlobalQuestion,
}: ProgressBarProps) {
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep)

  // Porcentaje total
  const totalScreens = 1 + Math.max(totalZones, 1) + 4
  let doneSoFar = 0
  if (currentStep === 'bodymap')     doneSoFar = 0
  if (currentStep === 'zone_detail') doneSoFar = 1 + currentZoneIndex
  if (currentStep === 'global')      doneSoFar = 1 + totalZones + currentGlobalQuestion
  if (currentStep === 'complete')    doneSoFar = totalScreens
  const pct = Math.round((doneSoFar / totalScreens) * 100)

  // Texto de progreso contextual
  const contextLabel = () => {
    if (currentStep === 'bodymap')
      return 'Selecciona tus zonas de dolor'
    if (currentStep === 'zone_detail')
      return `Zona ${currentZoneIndex + 1} de ${totalZones} completada`
    if (currentStep === 'global')
      return `Pregunta ${currentGlobalQuestion + 1} de 4`
    return '¡Completado!'
  }

  return (
    <div className="w-full space-y-3">
      {/* Pasos numerados */}
      <div className="flex items-center">
        {STEPS.map((step, idx) => {
          const isDone    = idx < stepIndex
          const isCurrent = idx === stepIndex

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* Círculo del paso */}
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all',
                  isDone    && 'bg-[#F4DF49] text-white',
                  isCurrent && 'bg-[#111111] text-white ring-2 ring-[#111111]/20',
                  !isDone && !isCurrent && 'bg-slate-200 text-slate-400'
                )}
              >
                {isDone ? '✓' : step.short}
              </div>
              {/* Etiqueta */}
              <span
                className={cn(
                  'ml-1.5 text-xs font-medium hidden sm:block',
                  isCurrent ? 'text-[#111111]' : isDone ? 'text-[#111111]' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
              {/* Línea separadora */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 rounded transition-all',
                    idx < stepIndex ? 'bg-[#F4DF49]' : 'bg-slate-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full bg-[#F4DF49] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Label contextual */}
      <p className="text-xs text-slate-500 text-center">{contextLabel()}</p>
    </div>
  )
}
