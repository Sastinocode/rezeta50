// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · ProgramCard — tarjeta de programa recomendado (dark theme)
// ─────────────────────────────────────────────────────────────────────────────

import type { ProgramSnapshot } from '@/types/database'
import { ExternalLink, Clock, BarChart2 } from 'lucide-react'

const PHASE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  prehab:      { label: 'Prevención',          color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  rehab_fase1: { label: 'Rehabilitación F1',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  rehab_fase2: { label: 'Rehabilitación F2',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
}

export default function ProgramCard({ program }: { program: ProgramSnapshot }) {
  const phase = PHASE_CONFIG[program.phase] ?? { label: program.phase, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' }

  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm leading-snug">{program.name}</h3>
          {program.description && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {program.description}
            </p>
          )}
        </div>
        <span
          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap"
          style={{ background: phase.bg, color: phase.color }}
        >
          {phase.label}
        </span>
      </div>

      {/* Métricas */}
      <div className="flex flex-wrap gap-4">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <Clock size={12} style={{ color: '#F4DF49' }} />
          {program.duration_weeks} sem · {program.sessions_week}x/sem
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <BarChart2 size={12} style={{ color: '#F4DF49' }} />
          {Math.min(program.match_score, 100)}% compatible
        </span>
        <span className="text-xs font-bold" style={{ color: '#F4DF49' }}>
          {program.price_eur === 0 ? 'Gratis' : `${program.price_eur} €`}
        </span>
      </div>

      {/* CTA */}
      <a
        href={program.harbiz_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-bold transition-all active:scale-95"
        style={{ background: '#F4DF49', color: '#111111' }}
      >
        Ver programa completo
        <ExternalLink size={14} />
      </a>
    </div>
  )
}
