'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuestionnaireStore } from '@/store/questionnaireStore'
import BodyMap from '@/components/questionnaire/BodyMap'
import ZoneForm from '@/components/questionnaire/ZoneForm'
import GlobalQuestions from '@/components/questionnaire/GlobalQuestions'
import ProgressBar from '@/components/questionnaire/ProgressBar'
import { getZoneById } from '@/constants/zones'
import type { ZoneCode, ZoneSide } from '@/types/database'

// ── Helpers ───────────────────────────────────────────────────────────────────

function zoneName(zone_code: ZoneCode, side: ZoneSide): string {
  const def = getZoneById(zone_code)
  const label = def?.label ?? zone_code
  if (!side) return label
  return `${label} ${side === 'r' ? 'derecha' : 'izquierda'}`
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function CuestionarioPage() {
  const router = useRouter()
  const {
    selectedZones,
    currentStep,
    currentZoneIndex,
    currentGlobalQuestion,
    globalAnswers,
    toggleZone,
    saveZoneAnswers,
    saveGlobalAnswers,
    nextStep,
    nextZone,
    prevZone,
    nextGlobalQuestion,
    prevGlobalQuestion,
  } = useQuestionnaireStore()

  // Cuando el step pasa a 'complete' → redirigir a /registro
  useEffect(() => {
    if (currentStep === 'complete') {
      router.push('/registro')
    }
  }, [currentStep, router])

  const currentZone = selectedZones[currentZoneIndex]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-100 flex items-center gap-2">
        <span className="text-xl font-black text-[#1A3C5E] tracking-tight">Rezeta</span>
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ background: '#E8A020', color: 'white' }}
        >
          50
        </span>
      </header>

      {/* Contenido */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {/* ProgressBar */}
        <div className="mb-6">
          <ProgressBar
            currentStep={currentStep}
            totalZones={selectedZones.length}
            currentZoneIndex={currentZoneIndex}
            currentGlobalQuestion={currentGlobalQuestion}
          />
        </div>

        {/* ─── STEP 1: Body Map ─────────────────────────────────── */}
        {currentStep === 'bodymap' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-[#1A3C5E] leading-tight">
                ¿Dónde sientes dolor o molestia?
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Toca las zonas que te molestan. Puedes seleccionar varias.
              </p>
            </div>

            <BodyMap
              selectedZones={selectedZones}
              onToggle={(zone_code, side) => toggleZone(zone_code, side)}
            />

            {/* Contador y CTA */}
            <div className="space-y-3 pt-2">
              <p className="text-center text-sm text-slate-600">
                {selectedZones.length === 0 ? (
                  <span className="text-slate-400">Ninguna zona seleccionada</span>
                ) : (
                  <>
                    <span className="font-bold text-[#1A3C5E]">{selectedZones.length}</span>
                    {' '}zona{selectedZones.length !== 1 ? 's' : ''} seleccionada{selectedZones.length !== 1 ? 's' : ''}:
                    {' '}
                    <span className="text-[#E8A020]">
                      {selectedZones.map((z, i) => (
                        <span key={i}>
                          {zoneName(z.zone_code, z.side)}
                          {i < selectedZones.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </span>
                  </>
                )}
              </p>

              <button
                onClick={() => {
                  if (selectedZones.length > 0) nextStep()
                }}
                disabled={selectedZones.length === 0}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
                  selectedZones.length > 0
                    ? 'bg-[#E8A020] hover:bg-[#CF8F1A] text-white shadow-md active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Continuar con {selectedZones.length} zona{selectedZones.length !== 1 ? 's' : ''} →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Zone Detail ──────────────────────────────── */}
        {currentStep === 'zone_detail' && currentZone && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-[#E8A020] uppercase tracking-wider mb-1">
                Zona {currentZoneIndex + 1} de {selectedZones.length}
              </p>
              <h1 className="text-2xl font-black text-[#1A3C5E]">
                {zoneName(currentZone.zone_code, currentZone.side)}
              </h1>
            </div>

            <ZoneForm
              zoneName={zoneName(currentZone.zone_code, currentZone.side)}
              defaultValues={currentZone.answers}
              onSubmit={(answers) => {
                saveZoneAnswers(currentZoneIndex, answers)
                nextZone()
              }}
              onBack={prevZone}
              isFirst={currentZoneIndex === 0}
              isLast={currentZoneIndex === selectedZones.length - 1}
            />
          </div>
        )}

        {/* ─── STEP 3: Global Questions ─────────────────────────── */}
        {currentStep === 'global' && (
          <GlobalQuestions
            questionIndex={currentGlobalQuestion}
            answers={globalAnswers}
            onAnswer={saveGlobalAnswers}
            onNext={nextGlobalQuestion}
            onBack={prevGlobalQuestion}
          />
        )}

        {/* ─── STEP complete: transición ────────────────────────── */}
        {currentStep === 'complete' && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ background: '#FDF3DF' }}
            >
              ✓
            </div>
            <p className="text-lg font-bold text-[#1A3C5E]">¡Cuestionario completado!</p>
            <p className="text-sm text-slate-500">Redirigiendo a tu registro…</p>
          </div>
        )}
      </main>
    </div>
  )
}
