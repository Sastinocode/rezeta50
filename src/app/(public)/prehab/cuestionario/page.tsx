'use client'

import { useRouter } from 'next/navigation'
import {
  usePrehabStore,
  isInjuryZoneSelected,
  isSorenessZoneSelected,
  type PrehabStep,
  type InjuryZone,
  type SorenessZone,
} from '@/store/prehabStore'
import type { ZoneCode, ZoneSide } from '@/types/database'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

// ── Constantes ────────────────────────────────────────────────────────────────

const SPORTS = [
  { id: 'futbol',      label: 'Fútbol',      emoji: '⚽' },
  { id: 'padel',       label: 'Pádel',       emoji: '🏸' },
  { id: 'running',     label: 'Running',     emoji: '🏃' },
  { id: 'natacion',    label: 'Natación',    emoji: '🏊' },
  { id: 'ciclismo',    label: 'Ciclismo',    emoji: '🚴' },
  { id: 'gym',         label: 'Gym / Fitness', emoji: '🏋️' },
  { id: 'crossfit',    label: 'CrossFit',    emoji: '💪' },
  { id: 'tenis',       label: 'Tenis',       emoji: '🎾' },
  { id: 'baloncesto',  label: 'Baloncesto',  emoji: '🏀' },
  { id: 'otro',        label: 'Otro',        emoji: '🏅' },
]

const SPINE_ZONES: { code: ZoneCode; side: ZoneSide; label: string }[] = [
  { code: 'cervical',   side: null, label: 'Cervical'  },
  { code: 'dorsal',     side: null, label: 'Dorsal'    },
  { code: 'lumbar',     side: null, label: 'Lumbar'    },
]

const RIGHT_ZONES: { code: ZoneCode; side: ZoneSide; label: string }[] = [
  { code: 'shoulder',   side: 'r', label: 'Hombro D' },
  { code: 'elbow',      side: 'r', label: 'Codo D'   },
  { code: 'wrist',      side: 'r', label: 'Muñeca D' },
  { code: 'hip',        side: 'r', label: 'Cadera D' },
  { code: 'knee',       side: 'r', label: 'Rodilla D'},
  { code: 'ankle_foot', side: 'r', label: 'Tobillo D'},
]

const LEFT_ZONES: { code: ZoneCode; side: ZoneSide; label: string }[] = [
  { code: 'shoulder',   side: 'l', label: 'Hombro I' },
  { code: 'elbow',      side: 'l', label: 'Codo I'   },
  { code: 'wrist',      side: 'l', label: 'Muñeca I' },
  { code: 'hip',        side: 'l', label: 'Cadera I' },
  { code: 'knee',       side: 'l', label: 'Rodilla I'},
  { code: 'ankle_foot', side: 'l', label: 'Tobillo I'},
]

const STEP_LABELS: Record<PrehabStep, string> = {
  sport:          'Deporte',
  profile:        'Perfil',
  load:           'Carga',
  goals:          'Objetivos',
  injury_history: 'Historial',
  soreness:       'Molestias',
  complete:       'Listo',
}

const ORDERED_STEPS: PrehabStep[] = ['sport', 'profile', 'load', 'goals', 'injury_history', 'soreness']

const GOAL_LABELS: Record<string, string> = {
  prevention:  'Prevenir lesiones',
  flexibility: 'Flexibilidad y movilidad',
  strength:    'Fuerza y potencia',
  speed:       'Velocidad y agilidad',
  stress:      'Manejo del estrés',
  performance: 'Rendimiento general',
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function SelectButton({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all text-center"
      style={selected ? {
        background: 'rgba(244,223,73,0.12)',
        borderColor: 'rgba(244,223,73,0.6)',
        color: '#F4DF49',
      } : {
        background: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.65)',
      }}
    >
      {children}
    </button>
  )
}

function OptionRow({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all text-left"
      style={selected ? {
        background: 'rgba(244,223,73,0.12)',
        borderColor: 'rgba(244,223,73,0.5)',
        color: '#F4DF49',
      } : {
        background: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.65)',
      }}
    >
      <span className="text-sm font-semibold">{label}</span>
      {selected && <Check size={14} />}
    </button>
  )
}

function ZoneChip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all"
      style={selected ? {
        background: 'rgba(244,223,73,0.15)',
        borderColor: 'rgba(244,223,73,0.55)',
        color: '#F4DF49',
      } : {
        background: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.5)',
      }}
    >
      {label}
    </button>
  )
}

function StarRating({
  value, onChange,
}: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="text-xl transition-transform hover:scale-110"
        >
          <span style={{ color: n <= value ? '#F4DF49' : 'rgba(255,255,255,0.2)' }}>★</span>
        </button>
      ))}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PrehabCuestionarioPage() {
  const router = useRouter()
  const store  = usePrehabStore()
  const {
    currentStep, sport, ageRange, level, season,
    trainingDays, intensity, sessionHours, goals,
    injuryZones, sorenessZones,
    setSport, setProfile, setLoad, setGoals,
    toggleInjuryZone, setInjuryTiming,
    toggleSorenessZone, setSorenessIntensity,
    nextStep, prevStep, goToStep,
  } = store

  const stepIdx = ORDERED_STEPS.indexOf(currentStep)

  // ── Navegación ───────────────────────────────────────────────────────────

  const handleNext = () => {
    if (currentStep === 'soreness') {
      goToStep('complete')
      router.push('/registro?from=prehab')
    } else {
      nextStep()
    }
  }

  const handleBack = () => {
    if (currentStep === 'sport') {
      router.push('/')
    } else {
      prevStep()
    }
  }

  // ── Validación por paso ──────────────────────────────────────────────────

  const canContinue = (() => {
    switch (currentStep) {
      case 'sport':          return !!sport
      case 'profile':        return !!(ageRange && level && season)
      case 'load':           return !!(trainingDays && intensity && sessionHours)
      case 'goals':          return Object.keys(goals).length >= 3
      case 'injury_history': return true // opcional
      case 'soreness':       return true // opcional
      default:               return false
    }
  })()

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#111111' }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-white/10"
        style={{ background: 'rgba(17,17,17,0.92)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-black text-white">Rezeta</span>
          <span className="text-xs font-black px-1.5 py-0.5 rounded" style={{ background: '#F4DF49', color: '#111111' }}>50</span>
          <span className="text-xs text-white/30 ml-1 font-medium">PREHAB</span>
        </div>
        <span className="text-xs text-white/40">Paso {stepIdx + 1} de {ORDERED_STEPS.length}</span>
      </header>

      {/* ── Progress bar ──────────────────────────────────────── */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${((stepIdx + 1) / ORDERED_STEPS.length) * 100}%`,
            background: '#F4DF49',
            boxShadow: '0 0 8px rgba(244,223,73,0.5)',
          }}
        />
      </div>

      {/* ── Step pills ────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 overflow-x-auto">
        {ORDERED_STEPS.map((s, i) => {
          const done = i < stepIdx
          const active = s === currentStep
          return (
            <div
              key={s}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
              style={active ? {
                background: 'rgba(244,223,73,0.15)',
                color: '#F4DF49',
                border: '1px solid rgba(244,223,73,0.4)',
              } : done ? {
                background: 'rgba(34,197,94,0.12)',
                color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.25)',
              } : {
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {done && <Check size={10} />}
              {STEP_LABELS[s]}
            </div>
          )
        })}
      </div>

      {/* ── Contenido del paso ────────────────────────────────── */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">

        {/* ── PASO 1: Deporte ─────────────────────────────────── */}
        {currentStep === 'sport' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white mb-1">¿Cuál es tu deporte principal?</h1>
              <p className="text-sm text-white/45">Selecciona el deporte que practicas con mayor frecuencia.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SPORTS.map((s) => (
                <SelectButton
                  key={s.id}
                  selected={sport === s.id}
                  onClick={() => setSport(s.id)}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-xs font-semibold leading-tight">{s.label}</span>
                </SelectButton>
              ))}
            </div>
          </div>
        )}

        {/* ── PASO 2: Perfil ──────────────────────────────────── */}
        {currentStep === 'profile' && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl font-black text-white mb-1">Tu perfil de atleta</h1>
              <p className="text-sm text-white/45">Esta información nos ayuda a personalizar tu plan preventivo.</p>
            </div>

            {/* Edad */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-white/70">Rango de edad</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: '<18',   label: '< 18' },
                  { id: '18-30', label: '18-30' },
                  { id: '31-45', label: '31-45' },
                  { id: '46-60', label: '46-60' },
                  { id: '>60',   label: '> 60' },
                ].map((a) => (
                  <SelectButton
                    key={a.id}
                    selected={ageRange === a.id}
                    onClick={() => setProfile({ ageRange: a.id, level: level ?? '', season: season ?? '' })}
                  >
                    <span className="text-sm font-bold">{a.label}</span>
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* Nivel */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-white/70">Nivel deportivo</p>
              <div className="space-y-2">
                {[
                  { id: 'amateur',  label: 'Amateur', desc: 'Entreno por placer / salud' },
                  { id: 'semipro',  label: 'Semiprofesional', desc: 'Compito regularmente' },
                  { id: 'elite',    label: 'Elite / Profesional', desc: 'Alto rendimiento' },
                ].map((l) => (
                  <OptionRow
                    key={l.id}
                    label={`${l.label} — ${l.desc}`}
                    selected={level === l.id}
                    onClick={() => setProfile({ ageRange: ageRange ?? '', level: l.id, season: season ?? '' })}
                  />
                ))}
              </div>
            </div>

            {/* Fase temporada */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-white/70">Fase de temporada</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'pre',  label: 'Pre-temporada' },
                  { id: 'in',   label: 'En temporada' },
                  { id: 'post', label: 'Post-temporada' },
                  { id: 'off',  label: 'Fuera de temporada' },
                ].map((s) => (
                  <SelectButton
                    key={s.id}
                    selected={season === s.id}
                    onClick={() => setProfile({ ageRange: ageRange ?? '', level: level ?? '', season: s.id })}
                  >
                    <span className="text-xs font-semibold">{s.label}</span>
                  </SelectButton>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PASO 3: Carga ───────────────────────────────────── */}
        {currentStep === 'load' && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl font-black text-white mb-1">Carga de entrenamiento</h1>
              <p className="text-sm text-white/45">La carga es uno de los principales factores de riesgo lesional.</p>
            </div>

            {/* Días/semana */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-white/70">Días de entrenamiento por semana</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '1-2', label: '1-2 días' },
                  { id: '3-4', label: '3-4 días' },
                  { id: '5-6', label: '5-6 días' },
                  { id: '7+',  label: '7+ días' },
                ].map((d) => (
                  <SelectButton
                    key={d.id}
                    selected={trainingDays === d.id}
                    onClick={() => setLoad({ trainingDays: d.id, intensity: intensity ?? 3, sessionHours: sessionHours ?? '' })}
                  >
                    <span className="text-xs font-bold leading-tight">{d.label}</span>
                  </SelectButton>
                ))}
              </div>
            </div>

            {/* Intensidad */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-white/70">
                Intensidad media percibida
                <span className="text-white/35 font-normal ml-2">(1 = muy suave · 5 = máxima)</span>
              </p>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setLoad({ trainingDays: trainingDays ?? '', intensity: n, sessionHours: sessionHours ?? '' })}
                      className="w-10 h-10 rounded-xl border text-sm font-black transition-all"
                      style={intensity === n ? {
                        background: '#F4DF49',
                        borderColor: '#F4DF49',
                        color: '#111111',
                        boxShadow: '0 0 12px rgba(244,223,73,0.4)',
                      } : {
                        background: 'rgba(255,255,255,0.04)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                {intensity && (
                  <span className="text-xs text-white/40">
                    {['', 'Muy suave', 'Suave', 'Moderada', 'Intensa', 'Máxima'][intensity]}
                  </span>
                )}
              </div>
            </div>

            {/* Horas/sesión */}
            <div className="space-y-2">
              <p className="text-sm font-bold text-white/70">Duración media de cada sesión</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '<1',  label: 'Menos de 1h' },
                  { id: '1-2', label: '1 - 2 horas' },
                  { id: '>2',  label: 'Más de 2h' },
                ].map((h) => (
                  <SelectButton
                    key={h.id}
                    selected={sessionHours === h.id}
                    onClick={() => setLoad({ trainingDays: trainingDays ?? '', intensity: intensity ?? 3, sessionHours: h.id })}
                  >
                    <span className="text-xs font-bold">{h.label}</span>
                  </SelectButton>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PASO 4: Objetivos ───────────────────────────────── */}
        {currentStep === 'goals' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white mb-1">Tus objetivos</h1>
              <p className="text-sm text-white/45">Valora del 1 al 5 cada objetivo (mínimo 3 valoraciones).</p>
            </div>
            <div className="space-y-4">
              {Object.entries(GOAL_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl border"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <span className="text-sm font-semibold text-white/80">{label}</span>
                  <StarRating
                    value={(goals as Record<string, number>)[key] ?? 0}
                    onChange={(v) => setGoals({ [key]: v } as Partial<typeof goals>)}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-white/30 text-center">
              {Object.keys(goals).length} / 3 mínimo valorados
            </p>
          </div>
        )}

        {/* ── PASO 5: Historial de lesiones ────────────────────── */}
        {currentStep === 'injury_history' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white mb-1">Historial de lesiones</h1>
              <p className="text-sm text-white/45">
                Marca las zonas donde hayas tenido lesiones en el pasado. Puedes omitir este paso.
              </p>
            </div>

            {/* Zone selector */}
            <div className="space-y-4">
              {/* Columna vertebral */}
              <div>
                <p className="text-xs font-bold text-white/35 uppercase tracking-widest mb-2">Columna</p>
                <div className="flex flex-wrap gap-2">
                  {SPINE_ZONES.map((z) => (
                    <ZoneChip
                      key={`${z.code}-${z.side}`}
                      label={z.label}
                      selected={isInjuryZoneSelected(injuryZones, z.code, z.side)}
                      onClick={() => toggleInjuryZone(z.code, z.side)}
                    />
                  ))}
                </div>
              </div>

              {/* Miembros derechos */}
              <div>
                <p className="text-xs font-bold text-white/35 uppercase tracking-widest mb-2">Lado derecho</p>
                <div className="flex flex-wrap gap-2">
                  {RIGHT_ZONES.map((z) => (
                    <ZoneChip
                      key={`${z.code}-${z.side}`}
                      label={z.label}
                      selected={isInjuryZoneSelected(injuryZones, z.code, z.side)}
                      onClick={() => toggleInjuryZone(z.code, z.side)}
                    />
                  ))}
                </div>
              </div>

              {/* Miembros izquierdos */}
              <div>
                <p className="text-xs font-bold text-white/35 uppercase tracking-widest mb-2">Lado izquierdo</p>
                <div className="flex flex-wrap gap-2">
                  {LEFT_ZONES.map((z) => (
                    <ZoneChip
                      key={`${z.code}-${z.side}`}
                      label={z.label}
                      selected={isInjuryZoneSelected(injuryZones, z.code, z.side)}
                      onClick={() => toggleInjuryZone(z.code, z.side)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Timing para zonas seleccionadas */}
            {injuryZones.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-white/60">¿Cuándo fue cada lesión?</p>
                {injuryZones.map((z) => {
                  const label = [...SPINE_ZONES, ...RIGHT_ZONES, ...LEFT_ZONES].find(
                    (x) => x.code === z.code && x.side === z.side
                  )?.label ?? z.code
                  return (
                    <div
                      key={`${z.code}-${z.side}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border"
                      style={{ background: 'rgba(244,223,73,0.05)', borderColor: 'rgba(244,223,73,0.2)' }}
                    >
                      <span className="text-xs font-bold text-white/70">{label}</span>
                      <div className="flex gap-1.5">
                        {([
                          { id: 'recent',  label: '< 6 meses' },
                          { id: 'old',     label: '> 6 meses' },
                          { id: 'chronic', label: 'Crónica' },
                        ] as { id: InjuryZone['timing']; label: string }[]).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setInjuryTiming(z.code, z.side, t.id)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold border transition-all"
                            style={z.timing === t.id ? {
                              background: '#F4DF49',
                              borderColor: '#F4DF49',
                              color: '#111111',
                            } : {
                              background: 'rgba(255,255,255,0.04)',
                              borderColor: 'rgba(255,255,255,0.1)',
                              color: 'rgba(255,255,255,0.45)',
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {injuryZones.length === 0 && (
              <p className="text-center text-white/25 text-sm py-4">
                Sin historial de lesiones — ¡estupendo!
              </p>
            )}
          </div>
        )}

        {/* ── PASO 6: Molestias actuales ──────────────────────── */}
        {currentStep === 'soreness' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white mb-1">Molestias actuales</h1>
              <p className="text-sm text-white/45">
                ¿Tienes alguna molestia en este momento? Marca las zonas y su intensidad. Puedes omitir.
              </p>
            </div>

            {/* Zone selector */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-white/35 uppercase tracking-widest mb-2">Columna</p>
                <div className="flex flex-wrap gap-2">
                  {SPINE_ZONES.map((z) => (
                    <ZoneChip
                      key={`${z.code}-${z.side}`}
                      label={z.label}
                      selected={isSorenessZoneSelected(sorenessZones, z.code, z.side)}
                      onClick={() => toggleSorenessZone(z.code, z.side)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-white/35 uppercase tracking-widest mb-2">Lado derecho</p>
                <div className="flex flex-wrap gap-2">
                  {RIGHT_ZONES.map((z) => (
                    <ZoneChip
                      key={`${z.code}-${z.side}`}
                      label={z.label}
                      selected={isSorenessZoneSelected(sorenessZones, z.code, z.side)}
                      onClick={() => toggleSorenessZone(z.code, z.side)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-white/35 uppercase tracking-widest mb-2">Lado izquierdo</p>
                <div className="flex flex-wrap gap-2">
                  {LEFT_ZONES.map((z) => (
                    <ZoneChip
                      key={`${z.code}-${z.side}`}
                      label={z.label}
                      selected={isSorenessZoneSelected(sorenessZones, z.code, z.side)}
                      onClick={() => toggleSorenessZone(z.code, z.side)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Intensidad para zonas seleccionadas */}
            {sorenessZones.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-white/60">Intensidad de cada molestia</p>
                {sorenessZones.map((z) => {
                  const label = [...SPINE_ZONES, ...RIGHT_ZONES, ...LEFT_ZONES].find(
                    (x) => x.code === z.code && x.side === z.side
                  )?.label ?? z.code
                  return (
                    <div
                      key={`${z.code}-${z.side}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border"
                      style={{ background: 'rgba(244,223,73,0.05)', borderColor: 'rgba(244,223,73,0.2)' }}
                    >
                      <span className="text-xs font-bold text-white/70">{label}</span>
                      <div className="flex gap-1.5">
                        {([
                          { id: 1 as const, label: 'Leve',     color: '#22c55e' },
                          { id: 2 as const, label: 'Moderada', color: '#f59e0b' },
                          { id: 3 as const, label: 'Intensa',  color: '#ef4444' },
                        ]).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSorenessIntensity(z.code, z.side, t.id)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold border transition-all"
                            style={z.intensity === t.id ? {
                              background: t.color,
                              borderColor: t.color,
                              color: '#111111',
                            } : {
                              background: 'rgba(255,255,255,0.04)',
                              borderColor: 'rgba(255,255,255,0.1)',
                              color: 'rgba(255,255,255,0.45)',
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {sorenessZones.length === 0 && (
              <p className="text-center text-white/25 text-sm py-4">
                Sin molestias actuales — ¡perfecto!
              </p>
            )}
          </div>
        )}

      </main>

      {/* ── Botones de navegación ─────────────────────────────── */}
      <div
        className="sticky bottom-0 z-10 px-4 py-4 border-t border-white/10 flex items-center gap-3"
        style={{ background: 'rgba(17,17,17,0.95)', backdropFilter: 'blur(8px)' }}
      >
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all"
          style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}
        >
          <ChevronLeft size={16} />
          Atrás
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all disabled:opacity-30"
          style={canContinue ? { background: '#F4DF49', color: '#111111' } : { background: 'rgba(244,223,73,0.15)', color: 'rgba(244,223,73,0.4)' }}
        >
          {currentStep === 'soreness' ? 'Ver mi informe PREHAB' : 'Continuar'}
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  )
}
