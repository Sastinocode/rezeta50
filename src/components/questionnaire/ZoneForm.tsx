'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZoneAnswers } from '@/store/questionnaireStore'
import { cn } from '@/lib/utils'

// ── Esquema Zod ───────────────────────────────────────────────────────────────

const zoneSchema = z.object({
  pain_level: z.number().min(0).max(10),
  duration: z.string().min(1, 'Selecciona una opción'),
  frequency: z.string().min(1, 'Selecciona una opción'),
  functional_limit: z.string().min(1, 'Selecciona una opción'),
  prior_diagnosis: z.boolean(),
  prior_diagnosis_text: z.string().optional(),
  prior_injury: z.string().min(1, 'Selecciona una opción'),
})

type ZoneFormData = z.infer<typeof zoneSchema>

// ── Opciones ──────────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { value: 'less_1w',  label: '< 1 semana',   desc: 'Aparecido hace poco' },
  { value: '1w_1m',   label: '1 sem – 1 mes', desc: 'Subagudo' },
  { value: '1m_6m',   label: '1 – 6 meses',   desc: 'Crónico reciente' },
  { value: 'more_6m', label: '+ de 6 meses',  desc: 'Crónico establecido' },
]

const FREQUENCY_OPTIONS = [
  { value: 'occasional', label: 'Ocasional',   desc: '1–2 veces/semana' },
  { value: 'weekly',     label: 'Frecuente',   desc: 'Varios días/semana' },
  { value: 'daily',      label: 'Diario',      desc: 'Cada día' },
  { value: 'constant',   label: 'Constante',   desc: 'Casi siempre presente' },
]

const FUNCTIONAL_OPTIONS = [
  { value: 'none',     label: 'Sin límite',  desc: 'Hago todo normal' },
  { value: 'mild',     label: 'Leve',        desc: 'Con molestia pero puedo' },
  { value: 'moderate', label: 'Moderado',    desc: 'Evito algunas actividades' },
  { value: 'severe',   label: 'Severo',      desc: 'Limitación importante' },
]

const INJURY_OPTIONS = [
  { value: 'none',    label: 'Sin lesión previa' },
  { value: 'recent',  label: 'Lesión reciente (< 6 meses)' },
  { value: 'chronic', label: 'Lesión antigua / crónica' },
]

// ── Sub-componente: grupo de radio visual ─────────────────────────────────────

interface RadioGroupProps {
  options: { value: string; label: string; desc?: string }[]
  value: string
  onChange: (v: string) => void
  error?: string
  cols?: 2 | 4
}

function RadioGroup({ options, value, onChange, error, cols = 4 }: RadioGroupProps) {
  return (
    <div>
      <div
        className={cn(
          'grid gap-2',
          cols === 2 ? 'grid-cols-2 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
        )}
      >
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all',
                selected
                  ? 'border-[#F4DF49] bg-[#FAFBE8] text-[#111111]'
                  : 'border-slate-200 bg-white hover:border-[#F4DF49]/50 hover:bg-[#FAFBE8]/50'
              )}
            >
              <span className={cn('text-sm font-semibold', selected ? 'text-[#111111]' : 'text-slate-700')}>
                {opt.label}
              </span>
              {opt.desc && (
                <span className="text-xs text-slate-500 mt-0.5 leading-tight">{opt.desc}</span>
              )}
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ZoneFormProps {
  zoneName: string
  defaultValues?: Partial<ZoneAnswers>
  onSubmit: (data: ZoneAnswers) => void
  onBack: () => void
  isFirst: boolean
  isLast: boolean
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ZoneForm({
  zoneName,
  defaultValues,
  onSubmit,
  onBack,
  isFirst,
  isLast,
}: ZoneFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      pain_level: defaultValues?.pain_level ?? 5,
      duration: defaultValues?.duration ?? '',
      frequency: defaultValues?.frequency ?? '',
      functional_limit: defaultValues?.functional_limit ?? '',
      prior_diagnosis: defaultValues?.prior_diagnosis ?? false,
      prior_diagnosis_text: defaultValues?.prior_diagnosis_text ?? '',
      prior_injury: defaultValues?.prior_injury ?? '',
    },
  })

  const watchDiagnosis = watch('prior_diagnosis')
  const watchPainLevel = watch('pain_level')

  const submit = (data: ZoneFormData) => {
    onSubmit(data as ZoneAnswers)
  }

  const painLabel = (v: number) => {
    if (v === 0) return 'Sin dolor'
    if (v <= 2)  return 'Muy leve'
    if (v <= 4)  return 'Leve'
    if (v <= 6)  return 'Moderado'
    if (v <= 8)  return 'Intenso'
    return 'Máximo'
  }

  const painColor = (v: number) => {
    if (v <= 3) return '#22c55e'
    if (v <= 6) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <h2 className="text-lg font-bold text-[#111111]">{zoneName}</h2>

      {/* 1. Nivel de dolor */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          ¿Cuánto dolor sientes? <span className="text-slate-400 font-normal">(0 = sin dolor, 10 = máximo)</span>
        </label>
        <Controller
          name="pain_level"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              {/* Número grande */}
              <div className="flex items-center justify-center">
                <span
                  className="text-5xl font-black tabular-nums transition-all"
                  style={{ color: painColor(field.value) }}
                >
                  {field.value}
                </span>
                <span className="ml-2 text-sm font-medium text-slate-500">
                  / 10 — {painLabel(field.value)}
                </span>
              </div>
              {/* Slider */}
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${painColor(field.value)} 0%, ${painColor(field.value)} ${field.value * 10}%, #e2e8f0 ${field.value * 10}%)`,
                }}
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Sin dolor</span>
                <span>Dolor máximo</span>
              </div>
            </div>
          )}
        />
        {errors.pain_level && (
          <p className="text-xs text-red-500 mt-1">{errors.pain_level.message}</p>
        )}
      </div>

      {/* 2. Duración */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          ¿Cuánto tiempo llevas con este dolor?
        </label>
        <Controller
          name="duration"
          control={control}
          render={({ field }) => (
            <RadioGroup
              options={DURATION_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.duration?.message}
            />
          )}
        />
      </div>

      {/* 3. Frecuencia */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          ¿Con qué frecuencia lo notas?
        </label>
        <Controller
          name="frequency"
          control={control}
          render={({ field }) => (
            <RadioGroup
              options={FREQUENCY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.frequency?.message}
            />
          )}
        />
      </div>

      {/* 4. Limitación funcional */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          ¿Cuánto limita tus actividades diarias?
        </label>
        <Controller
          name="functional_limit"
          control={control}
          render={({ field }) => (
            <RadioGroup
              options={FUNCTIONAL_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.functional_limit?.message}
            />
          )}
        />
      </div>

      {/* 5. Diagnóstico previo */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          ¿Te han dado algún diagnóstico para esta zona?
        </label>
        <Controller
          name="prior_diagnosis"
          control={control}
          render={({ field }) => (
            <div className="flex gap-3">
              {[
                { value: true,  label: 'Sí' },
                { value: false, label: 'No' },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => field.onChange(opt.value)}
                  className={cn(
                    'flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all',
                    field.value === opt.value
                      ? 'border-[#F4DF49] bg-[#FAFBE8] text-[#111111]'
                      : 'border-slate-200 bg-white hover:border-[#F4DF49]/50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        />
        {watchDiagnosis && (
          <Controller
            name="prior_diagnosis_text"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="¿Cuál? (opcional)"
                className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#F4DF49] focus:ring-1 focus:ring-[#F4DF49]"
              />
            )}
          />
        )}
      </div>

      {/* 6. Lesión previa */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          ¿Has tenido alguna lesión anterior en esta zona?
        </label>
        <Controller
          name="prior_injury"
          control={control}
          render={({ field }) => (
            <RadioGroup
              options={INJURY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.prior_injury?.message}
              cols={2}
            />
          )}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border-2 border-slate-300 font-semibold text-slate-600 hover:border-slate-400 transition-all"
        >
          ← Atrás
        </button>
        <button
          type="submit"
          className="flex-[2] py-3 rounded-xl bg-[#F4DF49] hover:bg-[#d4c93a] text-white font-bold transition-all"
        >
          {isLast ? 'Última zona ✓' : 'Siguiente zona →'}
        </button>
      </div>
    </form>
  )
}
