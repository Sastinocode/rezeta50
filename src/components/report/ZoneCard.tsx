// ─────────────────────────────────────────────────────────────────────────────
// Rezeta 50 · ZoneCard — tarjeta de resultado por zona
// ─────────────────────────────────────────────────────────────────────────────

import type { ZoneResult } from '@/types/database'

// ── Etiquetas de zona ─────────────────────────────────────────────────────────

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

// ── Configuración visual por nivel ───────────────────────────────────────────

const LEVEL_CONFIG = {
  verde: {
    emoji: '🟢',
    bar:   '#22c55e',
    bg:    'bg-green-50',
    border:'border-green-200',
    badge: 'bg-green-100 text-green-700',
    label: 'Verde',
  },
  ambar: {
    emoji: '🟡',
    bar:   '#f59e0b',
    bg:    'bg-amber-50',
    border:'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Ámbar',
  },
  rojo: {
    emoji: '🔴',
    bar:   '#ef4444',
    bg:    'bg-red-50',
    border:'border-red-200',
    badge: 'bg-red-100 text-red-700',
    label: 'Rojo',
  },
} as const

interface ZoneCardProps {
  result: ZoneResult
}

export default function ZoneCard({ result }: ZoneCardProps) {
  const cfg       = LEVEL_CONFIG[result.level]
  const zoneName  = ZONE_LABELS[result.zone_code] ?? result.zone_code
  const sideLabel = !result.side ? '' : result.side === 'r' ? ' derecho' : ' izquierdo'
  const fullName  = `${zoneName}${sideLabel}`

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${cfg.bg} ${cfg.border}`}>
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" role="img" aria-label={cfg.label}>{cfg.emoji}</span>
          <span className="font-bold text-[#111111] text-sm">{fullName}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {/* Barra de progreso */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500">Nivel de afectación</span>
          <span className="text-sm font-black text-[#111111]">{result.score}<span className="text-xs font-normal text-slate-400">/100</span></span>
        </div>
        <div className="w-full h-2.5 bg-white rounded-full border border-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${result.score}%`, background: cfg.bar }}
          />
        </div>
      </div>

      {/* Orientación */}
      <p className="text-xs text-slate-600 leading-relaxed">
        {result.orientation}
      </p>

      {/* Patología candidata */}
      {result.candidate_pathology && result.candidate_pathology !== '—' && (
        <p className="text-[11px] text-slate-400 italic">
          Posible: {result.candidate_pathology}
        </p>
      )}
    </div>
  )
}
