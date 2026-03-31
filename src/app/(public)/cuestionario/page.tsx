'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuestionnaireStore, isZoneSelected } from '@/store/questionnaireStore'
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
  return `${label} ${side === 'r' ? 'Der' : 'Izq'}`
}

// ── Zonas por panel ───────────────────────────────────────────────────────────

const SPINE_ZONES: { code: ZoneCode; side: ZoneSide; label: string }[] = [
  { code: 'cervical',   side: null, label: 'Cervical'  },
  { code: 'dorsal',     side: null, label: 'Dorsal'    },
  { code: 'lumbar',     side: null, label: 'Lumbar'    },
]

const RIGHT_ZONES: { code: ZoneCode; side: ZoneSide; label: string }[] = [
  { code: 'shoulder',   side: 'r', label: 'Hombro'   },
  { code: 'elbow',      side: 'r', label: 'Codo'     },
  { code: 'wrist',      side: 'r', label: 'Muñeca'   },
  { code: 'hip',        side: 'r', label: 'Cadera'   },
  { code: 'knee',       side: 'r', label: 'Rodilla'  },
  { code: 'ankle_foot', side: 'r', label: 'Tobillo'  },
]

const LEFT_ZONES: { code: ZoneCode; side: ZoneSide; label: string }[] = [
  { code: 'shoulder',   side: 'l', label: 'Hombro'   },
  { code: 'elbow',      side: 'l', label: 'Codo'     },
  { code: 'wrist',      side: 'l', label: 'Muñeca'   },
  { code: 'hip',        side: 'l', label: 'Cadera'   },
  { code: 'knee',       side: 'l', label: 'Rodilla'  },
  { code: 'ankle_foot', side: 'l', label: 'Tobillo'  },
]

// ── ZoneRow — botón de zona lateral ──────────────────────────────────────────

function ZoneRow({
  label, selected, onToggle,
}: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all text-left"
      style={selected ? {
        background: 'rgba(244,223,73,0.12)',
        borderColor: 'rgba(244,223,73,0.5)',
        color: '#F4DF49',
      } : {
        background: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.55)',
      }}
    >
      <span className="text-xs font-semibold">{label}</span>
      <span
        className="w-3.5 h-3.5 rounded-full flex-shrink-0 border"
        style={selected ? {
          background: '#F4DF49',
          borderColor: '#F4DF49',
          boxShadow: '0 0 6px rgba(244,223,73,0.7)',
        } : {
          background: 'transparent',
          borderColor: 'rgba(255,255,255,0.25)',
        }}
      />
    </button>
  )
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
        <span className="text-xl font-black text-[#111111] tracking-tight">Rezeta</span>
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ background: '#F4DF49', color: '#111111' }}
        >
          50
        </span>
      </header>

      {/* Contenido */}
      <main className={`flex-1 px-4 py-6 mx-auto w-full ${currentStep === 'bodymap' ? 'max-w-4xl' : 'max-w-lg'}`}>
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
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-black text-[#111111] leading-tight">
                ¿Dónde sientes dolor o molestia?
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Selecciona las zonas que te molestan. Puedes marcar varias.
              </p>
            </div>

            {/* ── 3-column layout ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr_160px] gap-4 items-start">

              {/* Columna izquierda: DERECHO */}
              <div
                className="rounded-2xl p-3 space-y-2 hidden lg:block"
                style={{ background: '#0b1929' }}
              >
                <p className="text-[9px] font-bold tracking-widest uppercase text-center mb-3"
                   style={{ color: 'rgba(255,255,255,0.3)' }}>
                  ← Derecho
                </p>
                {SPINE_ZONES.map((z) => (
                  <ZoneRow
                    key={`${z.code}-spine`}
                    label={z.label}
                    selected={isZoneSelected(selectedZones, z.code, z.side)}
                    onToggle={() => toggleZone(z.code, z.side)}
                  />
                ))}
                <div className="border-t my-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                {RIGHT_ZONES.map((z) => (
                  <ZoneRow
                    key={`${z.code}-r`}
                    label={z.label}
                    selected={isZoneSelected(selectedZones, z.code, z.side)}
                    onToggle={() => toggleZone(z.code, z.side)}
                  />
                ))}
              </div>

              {/* Columna central: Body Map */}
              <div>
                <BodyMap
                  selectedZones={selectedZones}
                  onToggle={(zone_code, side) => toggleZone(zone_code, side)}
                />
              </div>

              {/* Columna derecha: IZQUIERDO */}
              <div
                className="rounded-2xl p-3 space-y-2 hidden lg:block"
                style={{ background: '#0b1929' }}
              >
                <p className="text-[9px] font-bold tracking-widest uppercase text-center mb-3"
                   style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Izquierdo →
                </p>
                {/* Spacer para alinear con columna derecha (no hay spine zones a la izq) */}
                {SPINE_ZONES.map((z) => (
                  <div key={`spacer-${z.code}`} className="h-[38px]" />
                ))}
                <div className="border-t my-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                {LEFT_ZONES.map((z) => (
                  <ZoneRow
                    key={`${z.code}-l`}
                    label={z.label}
                    selected={isZoneSelected(selectedZones, z.code, z.side)}
                    onToggle={() => toggleZone(z.code, z.side)}
                  />
                ))}
              </div>
            </div>

            {/* Contador y CTA */}
            <div className="space-y-3 pt-1">
              <p className="text-center text-sm text-slate-600">
                {selectedZones.length === 0 ? (
                  <span className="text-slate-400">Ninguna zona seleccionada</span>
                ) : (
                  <>
                    <span className="font-bold text-[#111111]">{selectedZones.length}</span>
                    {' '}zona{selectedZones.length !== 1 ? 's' : ''} seleccionada{selectedZones.length !== 1 ? 's' : ''}
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
                    ? 'bg-[#F4DF49] hover:bg-[#d4c93a] text-[#111111] shadow-md active:scale-95'
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
              <p className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1">
                Zona {currentZoneIndex + 1} de {selectedZones.length}
              </p>
              <h1 className="text-2xl font-black text-[#111111]">
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
              style={{ background: '#FAFBE8' }}
            >
              ✓
            </div>
            <p className="text-lg font-bold text-[#111111]">¡Cuestionario completado!</p>
            <p className="text-sm text-slate-500">Redirigiendo a tu registro…</p>
          </div>
        )}
      </main>
    </div>
  )
}
