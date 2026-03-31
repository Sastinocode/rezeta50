'use client'

import { cn } from '@/lib/utils'
import {
  Sofa, Footprints, Dumbbell, Zap, Trophy,
  HeartPulse, RefreshCw, Activity, Shield,
  Sun, Moon, Clock, CalendarDays,
  Check, X, AlertCircle,
} from 'lucide-react'
import type { GlobalAnswers } from '@/store/questionnaireStore'

// ── Datos de las preguntas ────────────────────────────────────────────────────

const ACTIVITY_OPTIONS = [
  {
    value: 'sedentary',
    label: 'Sedentario',
    desc: 'Trabajo de oficina, poca actividad',
    icon: Sofa,
  },
  {
    value: 'walking',
    label: 'Caminatas',
    desc: 'Paseos regulares, actividad ligera',
    icon: Footprints,
  },
  {
    value: 'exercise_1_2',
    label: 'Ejercicio 1–2x',
    desc: 'Entreno 1 o 2 veces por semana',
    icon: Dumbbell,
  },
  {
    value: 'exercise_3_plus',
    label: 'Ejercicio 3+',
    desc: '3 o más veces por semana',
    icon: Zap,
  },
  {
    value: 'athlete',
    label: 'Deportista',
    desc: 'Competición o entreno diario',
    icon: Trophy,
  },
]

const GOAL_OPTIONS = [
  { value: 'reduce_pain',       label: 'Reducir el dolor',        icon: HeartPulse },
  { value: 'recover_function',  label: 'Recuperar funcionalidad', icon: RefreshCw },
  { value: 'return_sport',      label: 'Volver al deporte',       icon: Activity },
  { value: 'prevent',          label: 'Prevenir lesiones',        icon: Shield },
]

const AGE_OPTIONS = [
  { value: '<30',   label: 'Menos de 30', icon: Sun },
  { value: '30-45', label: '30 – 45',     icon: Clock },
  { value: '46-60', label: '46 – 60',     icon: Moon },
  { value: '>60',   label: 'Más de 60',   icon: CalendarDays },
]

const FLOOR_OPTIONS = [
  { value: 'yes',        label: 'Sí, sin problema', icon: Check },
  { value: 'difficulty', label: 'Con dificultad',   icon: AlertCircle },
  { value: 'no',         label: 'No puedo',         icon: X },
]

// ── Sub-componente: tarjeta de opción ─────────────────────────────────────────

interface OptionCardProps {
  icon: React.ElementType
  label: string
  desc?: string
  selected: boolean
  onClick: () => void
  multi?: boolean
}

function OptionCard({ icon: Icon, label, desc, selected, onClick, multi }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border-2 text-left w-full transition-all',
        selected
          ? 'border-[#F4DF49] bg-[#FAFBE8]'
          : 'border-slate-200 bg-white hover:border-[#F4DF49]/40 hover:bg-[#FAFBE8]/30'
      )}
    >
      <span
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          selected ? 'bg-[#F4DF49] text-white' : 'bg-slate-100 text-slate-500'
        )}
      >
        <Icon size={18} />
      </span>
      <span className="flex-1 min-w-0">
        <span className={cn('block text-sm font-semibold', selected ? 'text-[#111111]' : 'text-slate-700')}>
          {label}
        </span>
        {desc && (
          <span className="block text-xs text-slate-500 leading-tight mt-0.5">{desc}</span>
        )}
      </span>
      {multi && selected && (
        <span className="flex-shrink-0 w-5 h-5 rounded bg-[#F4DF49] flex items-center justify-center">
          <Check size={12} color="white" />
        </span>
      )}
    </button>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface GlobalQuestionsProps {
  questionIndex: number   // 0=actividad, 1=objetivos, 2=edad, 3=suelo
  answers: GlobalAnswers
  onAnswer: (partial: Partial<GlobalAnswers>) => void
  onNext: () => void
  onBack: () => void
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function GlobalQuestions({
  questionIndex,
  answers,
  onAnswer,
  onNext,
  onBack,
}: GlobalQuestionsProps) {
  const canContinue = () => {
    switch (questionIndex) {
      case 0: return !!answers.activity_level
      case 1: return (answers.goals?.length ?? 0) > 0
      case 2: return !!answers.age_range
      case 3: return !!answers.floor_exercises
      default: return false
    }
  }

  const QUESTIONS = [
    {
      title: '¿Cuál es tu nivel de actividad física actual?',
      subtitle: 'Elige la opción que mejor te describe',
    },
    {
      title: '¿Qué objetivos tienes con esta valoración?',
      subtitle: 'Puedes seleccionar más de uno',
    },
    {
      title: '¿En qué franja de edad estás?',
      subtitle: 'Esto nos ayuda a personalizar tu programa',
    },
    {
      title: '¿Puedes realizar ejercicios en el suelo?',
      subtitle: '(Tumbado, en cuadrupedia…)',
    },
  ]

  const q = QUESTIONS[questionIndex]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-1">
          Pregunta {questionIndex + 1} de 4
        </p>
        <h2 className="text-xl font-bold text-[#111111] leading-tight">{q.title}</h2>
        <p className="text-sm text-slate-500 mt-1">{q.subtitle}</p>
      </div>

      {/* Pregunta 0 — Actividad */}
      {questionIndex === 0 && (
        <div className="space-y-2">
          {ACTIVITY_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              desc={opt.desc}
              selected={answers.activity_level === opt.value}
              onClick={() => onAnswer({ activity_level: opt.value })}
            />
          ))}
        </div>
      )}

      {/* Pregunta 1 — Objetivos (multiselect) */}
      {questionIndex === 1 && (
        <div className="space-y-2">
          {GOAL_OPTIONS.map((opt) => {
            const selected = answers.goals?.includes(opt.value) ?? false
            return (
              <OptionCard
                key={opt.value}
                icon={opt.icon}
                label={opt.label}
                selected={selected}
                multi
                onClick={() => {
                  const current = answers.goals ?? []
                  const next = selected
                    ? current.filter((g) => g !== opt.value)
                    : [...current, opt.value]
                  onAnswer({ goals: next })
                }}
              />
            )
          })}
        </div>
      )}

      {/* Pregunta 2 — Edad */}
      {questionIndex === 2 && (
        <div className="grid grid-cols-2 gap-3">
          {AGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAnswer({ age_range: opt.value })}
              className={cn(
                'flex flex-col items-center gap-2 py-5 rounded-xl border-2 transition-all',
                answers.age_range === opt.value
                  ? 'border-[#F4DF49] bg-[#FAFBE8]'
                  : 'border-slate-200 bg-white hover:border-[#F4DF49]/40'
              )}
            >
              <opt.icon
                size={24}
                className={answers.age_range === opt.value ? 'text-[#111111]' : 'text-slate-400'}
              />
              <span
                className={cn(
                  'text-sm font-semibold',
                  answers.age_range === opt.value ? 'text-[#111111]' : 'text-slate-700'
                )}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Pregunta 3 — Suelo */}
      {questionIndex === 3 && (
        <div className="space-y-3">
          {FLOOR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAnswer({ floor_exercises: opt.value })}
              className={cn(
                'flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all',
                answers.floor_exercises === opt.value
                  ? 'border-[#F4DF49] bg-[#FAFBE8]'
                  : 'border-slate-200 bg-white hover:border-[#F4DF49]/40'
              )}
            >
              <span
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  answers.floor_exercises === opt.value
                    ? 'bg-[#F4DF49] text-white'
                    : 'bg-slate-100 text-slate-500'
                )}
              >
                <opt.icon size={18} />
              </span>
              <span
                className={cn(
                  'text-base font-semibold',
                  answers.floor_exercises === opt.value ? 'text-[#111111]' : 'text-slate-700'
                )}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border-2 border-slate-300 font-semibold text-slate-600 hover:border-slate-400 transition-all"
        >
          ← Atrás
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue()}
          className={cn(
            'flex-[2] py-3 rounded-xl font-bold transition-all',
            canContinue()
              ? 'bg-[#F4DF49] hover:bg-[#d4c93a] text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          )}
        >
          {questionIndex === 3 ? 'Ver mi valoración →' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}
