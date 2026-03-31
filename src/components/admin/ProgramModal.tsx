'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · ProgramModal — Crear / Editar programa Harbiz
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface ProgramRow {
  id: string
  name: string
  description: string | null
  zone_codes: string[]
  level: string
  phase: string
  harbiz_url: string
  price_eur: number
  duration_weeks: number
  sessions_week: number
  floor_required: boolean
  active: boolean
}

interface ProgramModalProps {
  program?: ProgramRow | null  // null = crear nuevo
  onClose: () => void
  onSaved: () => void
}

// ── Zonas disponibles ─────────────────────────────────────────────────────────

const ZONE_OPTIONS = [
  { value: 'cervical',   label: 'Cervical' },
  { value: 'dorsal',     label: 'Dorsal' },
  { value: 'lumbar',     label: 'Lumbar' },
  { value: 'shoulder',   label: 'Hombro' },
  { value: 'elbow',      label: 'Codo' },
  { value: 'wrist',      label: 'Muñeca / Mano' },
  { value: 'hip',        label: 'Cadera' },
  { value: 'knee',       label: 'Rodilla' },
  { value: 'ankle_foot', label: 'Tobillo / Pie' },
]

// ── Esquema Zod ───────────────────────────────────────────────────────────────

const programSchema = z.object({
  name:           z.string().min(3, 'Mínimo 3 caracteres'),
  description:    z.string().optional(),
  zone_codes:     z.array(z.string()).min(1, 'Selecciona al menos una zona'),
  level:          z.enum(['verde', 'ambar', 'rojo']),
  phase:          z.enum(['prehab', 'rehab_fase1', 'rehab_fase2']),
  harbiz_url:     z.string().url('URL no válida').min(1),
  price_eur:      z.number({ coerce: true }).min(0).max(999),
  duration_weeks: z.number({ coerce: true }).int().min(1).max(52),
  sessions_week:  z.number({ coerce: true }).int().min(1).max(7),
  floor_required: z.boolean(),
  active:         z.boolean(),
})

type FormData = z.infer<typeof programSchema>

// ── Componente ────────────────────────────────────────────────────────────────

export default function ProgramModal({ program, onClose, onSaved }: ProgramModalProps) {
  const isEdit = !!program

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name:           '',
      description:    '',
      zone_codes:     [],
      level:          'ambar',
      phase:          'rehab_fase1',
      harbiz_url:     '',
      price_eur:      29,
      duration_weeks: 8,
      sessions_week:  3,
      floor_required: false,
      active:         true,
    },
  })

  // Prellenar si es edición
  useEffect(() => {
    if (program) {
      reset({
        name:           program.name,
        description:    program.description ?? '',
        zone_codes:     program.zone_codes,
        level:          program.level as 'verde' | 'ambar' | 'rojo',
        phase:          program.phase as 'prehab' | 'rehab_fase1' | 'rehab_fase2',
        harbiz_url:     program.harbiz_url,
        price_eur:      program.price_eur,
        duration_weeks: program.duration_weeks,
        sessions_week:  program.sessions_week,
        floor_required: program.floor_required,
        active:         program.active,
      })
    }
  }, [program, reset])

  const onSubmit = async (data: FormData) => {
    const url = '/api/admin/programs'
    const method = isEdit ? 'PATCH' : 'POST'
    const body = isEdit ? { id: program!.id, ...data } : data

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(`Error: ${err.error ?? 'Error inesperado'}`)
      return
    }
    onSaved()
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:ring-red-100'
        : 'border-slate-300 focus:border-[#E8A020] focus:ring-[#E8A020]/20'
    }`

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-[#1A3C5E]">
            {isEdit ? 'Editar programa' : 'Nuevo programa'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre *</label>
            <input {...register('name')} className={inputClass(!!errors.name)} placeholder="Rehab Lumbar Básico" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción</label>
            <textarea
              {...register('description')}
              rows={2}
              className={inputClass(false) + ' resize-none'}
              placeholder="Breve descripción del programa..."
            />
          </div>

          {/* Zonas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Zonas del cuerpo *</label>
            <Controller
              name="zone_codes"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {ZONE_OPTIONS.map((z) => {
                    const checked = field.value.includes(z.value)
                    return (
                      <label
                        key={z.value}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                          checked
                            ? 'bg-[#E8A020]/10 border-[#E8A020] text-[#1A3C5E]'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, z.value])
                            } else {
                              field.onChange(field.value.filter((v) => v !== z.value))
                            }
                          }}
                        />
                        {z.label}
                      </label>
                    )
                  })}
                </div>
              )}
            />
            {errors.zone_codes && <p className="text-xs text-red-500 mt-1">{errors.zone_codes.message}</p>}
          </div>

          {/* Nivel + Fase */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nivel *</label>
              <select {...register('level')} className={inputClass(!!errors.level)}>
                <option value="verde">Verde (Preventivo)</option>
                <option value="ambar">Ámbar (Moderado)</option>
                <option value="rojo">Rojo (Severo)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fase *</label>
              <select {...register('phase')} className={inputClass(!!errors.phase)}>
                <option value="prehab">Prehab</option>
                <option value="rehab_fase1">Rehab Fase 1</option>
                <option value="rehab_fase2">Rehab Fase 2</option>
              </select>
            </div>
          </div>

          {/* URL Harbiz */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">URL Harbiz *</label>
            <input
              {...register('harbiz_url')}
              className={inputClass(!!errors.harbiz_url)}
              placeholder="https://harbiz.es/programas/..."
            />
            {errors.harbiz_url && <p className="text-xs text-red-500 mt-1">{errors.harbiz_url.message}</p>}
          </div>

          {/* Precio, semanas, sesiones */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Precio (€)</label>
              <input type="number" step="0.01" {...register('price_eur', { valueAsNumber: true })} className={inputClass(!!errors.price_eur)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Semanas</label>
              <input type="number" {...register('duration_weeks', { valueAsNumber: true })} className={inputClass(!!errors.duration_weeks)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ses./semana</label>
              <input type="number" {...register('sessions_week', { valueAsNumber: true })} className={inputClass(!!errors.sessions_week)} />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <Controller
              name="floor_required"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => field.onChange(!field.value)}
                    className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 ${field.value ? 'bg-[#E8A020]' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${field.value ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-xs font-medium text-slate-600">Requiere suelo</span>
                </label>
              )}
            />
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => field.onChange(!field.value)}
                    className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 ${field.value ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${field.value ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-xs font-medium text-slate-600">Activo</span>
                </label>
              )}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
              style={{ background: '#1A3C5E' }}
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Guardando…</> : (isEdit ? 'Guardar cambios' : 'Crear programa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
