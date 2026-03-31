// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · ProgramCard — tarjeta de programa Harbiz recomendado
// ─────────────────────────────────────────────────────────────────────────────

import type { ProgramSnapshot } from '@/types/database'
import { ExternalLink, Clock, BarChart2, Euro } from 'lucide-react'

// ── Etiquetas de fase ─────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
  prehab:       'Prevención',
  rehab_fase1:  'Rehabilitación Fase 1',
  rehab_fase2:  'Rehabilitación Fase 2',
}

const PHASE_COLORS: Record<string, string> = {
  prehab:       'bg-green-100 text-green-700',
  rehab_fase1:  'bg-amber-100 text-amber-700',
  rehab_fase2:  'bg-red-100 text-red-700',
}

interface ProgramCardProps {
  program: ProgramSnapshot
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const phaseLabel = PHASE_LABELS[program.phase] ?? program.phase
  const phaseColor = PHASE_COLORS[program.phase] ?? 'bg-slate-100 text-slate-600'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 hover:border-[#F4DF49]/60 hover:shadow-sm transition-all">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#111111] text-sm leading-snug">{program.name}</h3>
          {program.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{program.description}</p>
          )}
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${phaseColor}`}>
          {phaseLabel}
        </span>
      </div>

      {/* Datos del programa */}
      <div className="flex flex-wrap gap-3">
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Clock size={12} className="text-[#111111]" />
          {program.duration_weeks} semanas · {program.sessions_week}x/semana
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Euro size={12} className="text-[#111111]" />
          {program.price_eur === 0 ? 'Gratis' : `${program.price_eur} €`}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <BarChart2 size={12} className="text-[#111111]" />
          Compatibilidad: {Math.min(program.match_score, 100)}%
        </span>
      </div>

      {/* CTA */}
      <a
        href={program.harbiz_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all"
        style={{ background: '#22c55e' }}
        onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = '#16a34a' }}
        onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = '#22c55e' }}
      >
        Ver programa
        <ExternalLink size={14} />
      </a>
    </div>
  )
}
