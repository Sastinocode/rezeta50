// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · ZoneCard — tarjeta de resultado por zona (dark theme)
// ─────────────────────────────────────────────────────────────────────────────

import type { ZoneResult } from '@/types/database'

const ZONE_LABELS: Record<string, string> = {
  cervical:   'Cervical',
  dorsal:     'Dorsal',
  lumbar:     'Lumbar',
  shoulder:   'Hombro',
  elbow:      'Codo',
  wrist:      'Muñeca / Mano',
  hip:        'Cadera',
  knee:       'Rodilla',
  ankle_foot: 'Tobillo / Pie',
}

const LEVEL_CONFIG = {
  verde: {
    color:  '#22c55e',
    glow:   'rgba(34,197,94,0.2)',
    border: 'rgba(34,197,94,0.25)',
    label:  'Verde',
    bar:    '#22c55e',
    barBg:  'rgba(34,197,94,0.12)',
  },
  ambar: {
    color:  '#f59e0b',
    glow:   'rgba(245,158,11,0.2)',
    border: 'rgba(245,158,11,0.25)',
    label:  'Ámbar',
    bar:    '#f59e0b',
    barBg:  'rgba(245,158,11,0.12)',
  },
  rojo: {
    color:  '#ef4444',
    glow:   'rgba(239,68,68,0.2)',
    border: 'rgba(239,68,68,0.25)',
    label:  'Rojo',
    bar:    '#ef4444',
    barBg:  'rgba(239,68,68,0.12)',
  },
} as const

export default function ZoneCard({ result }: { result: ZoneResult }) {
  const cfg      = LEVEL_CONFIG[result.level]
  const zoneName = ZONE_LABELS[result.zone_code] ?? result.zone_code
  const side     = !result.side ? '' : result.side === 'r' ? ' derecho' : ' izquierdo'

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 20px ${cfg.glow}`,
      }}
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-white text-sm">
          {zoneName}{side}
        </span>
        <span
          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: cfg.glow, color: cfg.color, border: `1px solid ${cfg.border}` }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Barra de score */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Afectación</span>
          <span className="text-sm font-black" style={{ color: cfg.color }}>
            {result.score}<span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.3)' }}>/100</span>
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: cfg.barBg }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${result.score}%`,
              background: cfg.bar,
              boxShadow: `0 0 8px ${cfg.glow}`,
            }}
          />
        </div>
      </div>

      {/* Orientación */}
      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {result.orientation}
      </p>

      {/* Patología candidata */}
      {result.candidate_pathology && result.candidate_pathology !== '—' && (
        <p className="text-[11px] italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Posible: {result.candidate_pathology}
        </p>
      )}
    </div>
  )
}
