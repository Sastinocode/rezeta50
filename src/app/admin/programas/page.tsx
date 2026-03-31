'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · /admin/programas — Gestión de programas Harbiz
// Client Component (necesita interactividad para modal)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import ProgramModal, { type ProgramRow } from '@/components/admin/ProgramModal'

const LEVEL_LABELS: Record<string, string> = { verde: 'Verde', ambar: 'Ámbar', rojo: 'Rojo' }
const PHASE_LABELS: Record<string, string> = { prehab: 'Prehab', rehab_fase1: 'Fase 1', rehab_fase2: 'Fase 2' }
const LEVEL_COLORS: Record<string, string> = {
  verde: 'bg-green-100 text-green-700',
  ambar: 'bg-amber-100 text-amber-700',
  rojo:  'bg-red-100 text-red-700',
}

const ZONE_SHORT: Record<string, string> = {
  cervical: 'Cerv', dorsal: 'Dors', lumbar: 'Lumb',
  shoulder: 'Homb', elbow: 'Codo', wrist: 'Muñ',
  hip: 'Cad', knee: 'Rod', ankle_foot: 'Tob',
}

export default function AdminProgramasPage() {
  const [programs, setPrograms] = useState<ProgramRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; program: ProgramRow | null }>({
    open: false,
    program: null,
  })

  const fetchPrograms = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/programs')
    if (res.ok) {
      const data = await res.json()
      setPrograms(data.programs ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPrograms() }, [fetchPrograms])

  const toggleActive = async (program: ProgramRow) => {
    await fetch('/api/admin/programs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...program, active: !program.active }),
    })
    fetchPrograms()
  }

  const handleSaved = () => {
    setModal({ open: false, program: null })
    fetchPrograms()
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#1A3C5E] mb-1">
            <ChevronLeft size={14} /> Panel admin
          </Link>
          <h1 className="text-2xl font-black text-[#1A3C5E]">Programas Harbiz</h1>
          <p className="text-sm text-slate-500">{programs.length} programas · {programs.filter(p => p.active).length} activos</p>
        </div>
        <button
          onClick={() => setModal({ open: true, program: null })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: '#E8A020' }}
        >
          <Plus size={16} />
          Nuevo programa
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Cargando programas…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Zonas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nivel</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Fase</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Precio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Sem.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Activo</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#1A3C5E] text-sm">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.zone_codes.map((z) => (
                          <span key={z} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                            {ZONE_SHORT[z] ?? z}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[p.level] ?? 'bg-slate-100 text-slate-600'}`}>
                        {LEVEL_LABELS[p.level] ?? p.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 hidden sm:table-cell">
                      {PHASE_LABELS[p.phase] ?? p.phase}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 hidden sm:table-cell">
                      {p.price_eur === 0 ? 'Gratis' : `${p.price_eur} €`}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 hidden sm:table-cell">
                      {p.duration_weeks}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`w-9 h-5 rounded-full transition-colors ${p.active ? 'bg-green-500' : 'bg-slate-300'}`}
                        title={p.active ? 'Desactivar' : 'Activar'}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${p.active ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setModal({ open: true, program: p })}
                        className="flex items-center gap-1 text-xs font-semibold text-[#E8A020] hover:text-[#B87A10] transition-colors"
                      >
                        <Edit2 size={13} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <ProgramModal
          program={modal.program}
          onClose={() => setModal({ open: false, program: null })}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
